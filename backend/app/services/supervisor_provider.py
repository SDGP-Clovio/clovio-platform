from __future__ import annotations

from typing import Any, Mapping, Optional, Sequence

from fastapi import HTTPException

from app.services.supervisor_service import SupervisorDataProvider


class UnconfiguredSupervisorDataProvider(SupervisorDataProvider):
    """
    Integration adapter for supervisor read models.

    Replace this adapter by wiring your branch-specific data provider implementation
    that reads SQLAlchemy models/repositories. This keeps route handlers thin and
    avoids duplicating existing model/auth logic.
    """

    def _raise(self) -> None:
        raise HTTPException(
            status_code=500,
            detail="Supervisor data provider is not configured. Wire existing branch provider.",
        )

    def get_projects_for_supervisor(self, supervisor_id: int) -> Sequence[Mapping[str, Any]]:
        self._raise()

    def get_project_by_id(self, project_id: int, supervisor_id: int) -> Optional[Mapping[str, Any]]:
        self._raise()

    def get_team_members(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        self._raise()

    def get_tasks(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        self._raise()

    def get_contribution_logs(self, project_id: int) -> Sequence[Mapping[str, Any]]:
        self._raise()


def get_supervisor_data_provider() -> SupervisorDataProvider:
    return UnconfiguredSupervisorDataProvider()
