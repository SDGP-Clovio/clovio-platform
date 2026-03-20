from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Mapping, Optional, Protocol, Sequence

@dataclass
class SupervisorService:
    pass

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

