from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Mapping, Optional, Sequence

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.models.milestone import Milestone
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.models.user import User, UserRole
from app.services.supervisor_service import SupervisorDataProvider


class SqlAlchemySupervisorDataProvider(SupervisorDataProvider):
    """
    SQLAlchemy-backed provider for supervisor dashboard data.
    """

    def __init__(self, db: Session):
        self.db = db

    def _list_visible_projects(self, supervisor_id: int) -> list[Project]:
        try:
            membership_rows = self.db.execute(
                select(ProjectMember.project_id).where(ProjectMember.user_id == supervisor_id)
            ).scalars().all()
        except SQLAlchemyError:
            membership_rows = []

        project_ids = {int(project_id) for project_id in membership_rows}

        try:
            if project_ids:
                return self.db.query(Project).filter(Project.id.in_(project_ids)).all()

            creator_projects = self.db.query(Project).filter(Project.created_by == supervisor_id).all()
            if creator_projects:
                return creator_projects

            # Fallback for legacy seeded data where supervisors were not linked by membership yet.
            return self.db.query(Project).all()
        except SQLAlchemyError:
            return []

    def _task_rows_for_project(self, project_id: int) -> list[Task]:
        try:
            return (
                self.db.query(Task)
                .join(Milestone, Task.milestone_id == Milestone.id)
                .filter(Milestone.project_id == project_id)
                .all()
            )
        except SQLAlchemyError:
            return []

    @staticmethod
    def _completion_percent(tasks: list[Task]) -> float:
        if not tasks:
            return 0.0
        done_count = sum(1 for task in tasks if str(task.status).lower().endswith("done"))
        return round((done_count / len(tasks)) * 100.0, 2)

    @staticmethod
    def _risk_level(project: Project, completion_percent: float) -> str:
        now = datetime.utcnow()
        deadline = project.deadline

        if deadline is not None and deadline.tzinfo is not None:
            deadline = deadline.astimezone(timezone.utc).replace(tzinfo=None)

        status_value = str(project.status.value if hasattr(project.status, "value") else project.status).lower()

        if status_value == "completed" or completion_percent >= 100.0:
            return "Low"

        if deadline is not None and deadline < now and completion_percent < 100.0:
            return "High"

        if completion_percent < 40.0:
            return "High"

        if completion_percent < 70.0:
            return "Medium"

        return "Low"

    @staticmethod
    def _status_label(project: Project) -> str:
        value = str(project.status.value if hasattr(project.status, "value") else project.status).lower()
        if value == "planned":
            return "On Track"
        if value == "active":
            return "Active"
        if value == "completed":
            return "Completed"
        return value.title()

    def _project_record(self, project: Project, tasks: list[Task], team_size: int) -> dict[str, Any]:
        completion = self._completion_percent(tasks)
        return {
            "id": project.id,
            "name": project.name or f"Project {project.id}",
            "status": self._status_label(project),
            "completion_percent": completion,
            "risk_level": self._risk_level(project, completion),
            "team_size": team_size,
            "due_date": project.deadline,
            "start_date": project.created_at,
        }

    def get_projects_for_supervisor(self, supervisor_id: int) -> Sequence[Mapping[str, Any]]:
        projects = self._list_visible_projects(supervisor_id)
        records: list[Mapping[str, Any]] = []

        for project in projects:
            tasks = self._task_rows_for_project(project.id)
            try:
                team_size = (
                    self.db.query(ProjectMember)
                    .filter(ProjectMember.project_id == project.id)
                    .count()
                )
            except SQLAlchemyError:
                team_size = 0
            records.append(self._project_record(project, tasks, team_size))

        return records

    def get_project_by_id(self, project_id: int, supervisor_id: int) -> Optional[Mapping[str, Any]]:
        project = next(
            (candidate for candidate in self._list_visible_projects(supervisor_id) if int(candidate.id) == int(project_id)),
            None,
        )
        if project is None:
            return None

        tasks = self._task_rows_for_project(project.id)
        try:
            team_size = (
                self.db.query(ProjectMember)
                .filter(ProjectMember.project_id == project.id)
                .count()
            )
        except SQLAlchemyError:
            team_size = 0
        return self._project_record(project, tasks, team_size)

    def get_team_members(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        try:
            rows = (
                self.db.query(User)
                .join(ProjectMember, ProjectMember.user_id == User.id)
                .filter(
                    ProjectMember.project_id == project_id,
                    User.role != UserRole.SUPERVISOR,
                )
                .all()
            )
        except SQLAlchemyError:
            return []

        return [
            {
                "id": user.id,
                "name": user.full_name or user.username or f"User {user.id}",
            }
            for user in rows
        ]

    def get_tasks(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        tasks = self._task_rows_for_project(project_id)
        return [
            {
                "id": task.id,
                "title": task.name,
                "status": task.status.value if hasattr(task.status, "value") else str(task.status),
                "assigned_to_id": task.assigned_to,
                # Current schema has no completion timestamp; service tolerates missing values.
                "completed_at": None,
            }
            for task in tasks
        ]

    def get_contribution_logs(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        # No dedicated contribution log table yet; return an empty list for now.
        return []


def get_supervisor_data_provider(db: Session = Depends(get_db)) -> SupervisorDataProvider:
    return SqlAlchemySupervisorDataProvider(db)
