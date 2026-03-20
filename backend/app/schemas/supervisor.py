from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class SupervisorProjectOverview(BaseModel):
    total_projects: int
    active_teams: int
    at_risk_teams: int
    average_completion_percent: float = Field(..., ge=0.0, le=100.0)


class SupervisorProjectItem(BaseModel):
    id: int
    name: str
    status: str
    completion_percent: float = Field(..., ge=0.0, le=100.0)
    risk_level: str
    team_size: int = Field(..., ge=0)
    due_date: Optional[date] = None


class SupervisorProjectsResponse(BaseModel):
    overview: SupervisorProjectOverview
    projects: List[SupervisorProjectItem]

