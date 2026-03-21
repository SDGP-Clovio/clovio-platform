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

class SupervisorTimelineItem(BaseModel):
    date: date
    title: str
    status: str


class SupervisorProjectDetailResponse(BaseModel):
    id: int
    name: str
    status: str
    completion_percent: float = Field(..., ge=0.0, le=100.0)
    risk_level: str
    task_completion_total: int = Field(..., ge=0)
    task_completion_done: int = Field(..., ge=0)
    timeline: List[SupervisorTimelineItem]

class SupervisorContributionItem(BaseModel):
    user_id: int
    name: str
    contribution_percent: float = Field(..., ge=0.0, le=100.0)
    tasks_completed: int = Field(..., ge=0)
    updates_count: int = Field(..., ge=0)
    activity_score: float = Field(..., ge=0.0)


class SupervisorContributionsResponse(BaseModel):
    project_id: int
    contributions: List[SupervisorContributionItem]


class SupervisorFairnessResponse(BaseModel):
    project_id: int
    fairness_score: float = Field(..., ge=0.0, le=100.0)
    imbalance_flag: bool


class SupervisorAlertItem(BaseModel):
    level: str
    message: str
    user_id: Optional[int] = None


class SupervisorAlertsResponse(BaseModel):
    project_id: int
    alerts: List[SupervisorAlertItem]


class SupervisorReportResponse(BaseModel):
    project_id: int
    filename: str
    content_type: str = "application/pdf"
    