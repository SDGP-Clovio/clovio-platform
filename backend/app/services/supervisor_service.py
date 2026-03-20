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

    def get_project_detail(self, supervisor_id: int, project_id: int):
        raise NotImplementedError

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
    
    # ... other methods

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

