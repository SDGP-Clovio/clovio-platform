from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from statistics import pvariance
from typing import Any, Mapping, Optional, Protocol, Sequence

from fastapi import HTTPException

from app.schemas.supervisor import (
    SupervisorAlertItem,
    SupervisorAlertsResponse,
    SupervisorContributionItem,
    SupervisorContributionsResponse,
    SupervisorFairnessResponse,
    SupervisorProjectDetailResponse,
    SupervisorProjectItem,
    SupervisorProjectOverview,
    SupervisorProjectsResponse,
    SupervisorTimelineItem,
)


class SupervisorDataProvider(Protocol):
    def get_projects_for_supervisor(self, supervisor_id: int) -> Sequence[Mapping[str, Any]]:
        ...

    def get_project_by_id(self, project_id: int, supervisor_id: int) -> Optional[Mapping[str, Any]]:
        ...

    def get_team_members(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        ...

    def get_tasks(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        ...

    def get_contribution_logs(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        ...


@dataclass
class SupervisorService:
    provider: SupervisorDataProvider

    def get_projects(self, supervisor_id: int) -> SupervisorProjectsResponse:
        projects = list(self.provider.get_projects_for_supervisor(supervisor_id))
        items = [self._map_project_item(record) for record in projects]

        overview = SupervisorProjectOverview(
            total_projects=len(items),
            active_teams=sum(1 for item in items if item.status.lower() in {"active", "on track", "in progress"}),
            at_risk_teams=sum(1 for item in items if item.risk_level.lower() in {"high", "at risk"}),
            average_completion_percent=round(
                (sum(item.completion_percent for item in items) / len(items)) if items else 0.0,
                2,
            ),
        )

        return SupervisorProjectsResponse(overview=overview, projects=items)

    def get_project_detail(self, supervisor_id: int, project_id: int) -> SupervisorProjectDetailResponse:
        project = self.provider.get_project_by_id(project_id, supervisor_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        tasks = list(self.provider.get_tasks(project_id))
        total_tasks = len(tasks)
        done_tasks = sum(1 for task in tasks if str(task.get("status", "")).lower() in {"done", "completed"})

        timeline = self._build_timeline(project=project, tasks=tasks)

        return SupervisorProjectDetailResponse(
            id=int(project.get("id", project_id)),
            name=str(project.get("name", "")),
            status=str(project.get("status", "Unknown")),
            completion_percent=self._to_float(project.get("completion_percent"), fallback=0.0),
            risk_level=str(project.get("risk_level", "Medium")),
            task_completion_total=total_tasks,
            task_completion_done=done_tasks,
            timeline=timeline,
        )

    def get_contributions(self, supervisor_id: int, project_id: int) -> SupervisorContributionsResponse:
        project = self.provider.get_project_by_id(project_id, supervisor_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        members = list(self.provider.get_team_members(project_id))
        tasks = list(self.provider.get_tasks(project_id))
        logs = list(self.provider.get_contribution_logs(project_id))

        completed_by_user: dict[int, int] = {}
        updates_by_user: dict[int, int] = {}

        for task in tasks:
            if str(task.get("status", "")).lower() not in {"done", "completed"}:
                continue
            assignee_id = self._to_int(task.get("assigned_to_id"))
            if assignee_id is None:
                continue
            completed_by_user[assignee_id] = completed_by_user.get(assignee_id, 0) + 1

        for log in logs:
            user_id = self._to_int(log.get("user_id"))
            if user_id is None:
                continue
            updates_by_user[user_id] = updates_by_user.get(user_id, 0) + 1

        scores: dict[int, float] = {}
        for member in members:
            user_id = int(member.get("id"))
            task_weight = completed_by_user.get(user_id, 0) * 0.7
            update_weight = updates_by_user.get(user_id, 0) * 0.3
            scores[user_id] = task_weight + update_weight

        score_total = sum(scores.values())
        contributions: list[SupervisorContributionItem] = []

        for member in members:
            user_id = int(member.get("id"))
            score = scores.get(user_id, 0.0)
            contribution_percent = round((score / score_total) * 100.0, 2) if score_total > 0 else 0.0
            contributions.append(
                SupervisorContributionItem(
                    user_id=user_id,
                    name=str(member.get("name", "Unknown")),
                    contribution_percent=contribution_percent,
                    tasks_completed=completed_by_user.get(user_id, 0),
                    updates_count=updates_by_user.get(user_id, 0),
                    activity_score=round(score, 2),
                )
            )

        return SupervisorContributionsResponse(project_id=project_id, contributions=contributions)

    def get_fairness(self, supervisor_id: int, project_id: int) -> SupervisorFairnessResponse:
        contribution_response = self.get_contributions(supervisor_id=supervisor_id, project_id=project_id)
        percentages = [item.contribution_percent for item in contribution_response.contributions]

        if len(percentages) <= 1:
            fairness_score = 100.0
        else:
            variance = pvariance(percentages)
            fairness_score = max(0.0, round(100.0 - min(100.0, variance), 2))

        return SupervisorFairnessResponse(
            project_id=project_id,
            fairness_score=fairness_score,
            imbalance_flag=fairness_score < 60.0,
        )

    def get_alerts(self, supervisor_id: int, project_id: int) -> SupervisorAlertsResponse:
        contribution_response = self.get_contributions(supervisor_id=supervisor_id, project_id=project_id)
        detail = self.get_project_detail(supervisor_id=supervisor_id, project_id=project_id)

        alerts: list[SupervisorAlertItem] = []

        for contribution in contribution_response.contributions:
            if contribution.contribution_percent < 10.0:
                alerts.append(
                    SupervisorAlertItem(
                        level="warning",
                        message=f"Low activity detected for {contribution.name}",
                        user_id=contribution.user_id,
                    )
                )

        if detail.status.lower() in {"delayed", "overdue"}:
            alerts.append(
                SupervisorAlertItem(
                    level="critical",
                    message="Project delay warning: status indicates delay/overdue",
                )
            )

        if detail.task_completion_total > 0:
            completion_ratio = detail.task_completion_done / detail.task_completion_total
            if completion_ratio < 0.5:
                alerts.append(
                    SupervisorAlertItem(
                        level="warning",
                        message="Project progress is below 50% of tasks completed",
                    )
                )

        return SupervisorAlertsResponse(project_id=project_id, alerts=alerts)

    def _map_project_item(self, record: Mapping[str, Any]) -> SupervisorProjectItem:
        return SupervisorProjectItem(
            id=int(record.get("id")),
            name=str(record.get("name", "")),
            status=str(record.get("status", "Unknown")),
            completion_percent=self._to_float(record.get("completion_percent"), fallback=0.0),
            risk_level=str(record.get("risk_level", "Medium")),
            team_size=int(record.get("team_size", 0)),
            due_date=self._to_date(record.get("due_date")),
        )

    def _build_timeline(
        self,
        project: Mapping[str, Any],
        tasks: Sequence[Mapping[str, Any]],
    ) -> list[SupervisorTimelineItem]:
        timeline: list[SupervisorTimelineItem] = []

        start_date = self._to_date(project.get("start_date"))
        due_date = self._to_date(project.get("due_date"))

        if start_date:
            timeline.append(SupervisorTimelineItem(date=start_date, title="Project Started", status="completed"))

        for task in tasks:
            completed_at = self._to_date(task.get("completed_at"))
            if completed_at:
                timeline.append(
                    SupervisorTimelineItem(
                        date=completed_at,
                        title=str(task.get("title", "Task update")),
                        status=str(task.get("status", "done")),
                    )
                )

        if due_date:
            timeline.append(SupervisorTimelineItem(date=due_date, title="Project Due Date", status="upcoming"))

        timeline.sort(key=lambda item: item.date)
        return timeline

    @staticmethod
    def _to_int(value: Any) -> Optional[int]:
        try:
            if value is None:
                return None
            return int(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _to_float(value: Any, fallback: float) -> float:
        try:
            if value is None:
                return fallback
            return float(value)
        except (TypeError, ValueError):
            return fallback

    @staticmethod
    def _to_date(value: Any) -> Optional[date]:
        if value is None:
            return None
        if isinstance(value, date):
            return value
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)
            except ValueError:
                return None
        return None
