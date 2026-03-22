from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


MeetingStatus = Literal["scheduled", "completed", "cancelled"]


class MeetingCreate(BaseModel):
    project_id: int
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    attendees: list[int] = Field(default_factory=list)
    location: str | None = None
    status: MeetingStatus = "scheduled"


class MeetingResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    attendees: list[int] = Field(default_factory=list)
    created_by: int
    location: str | None = None
    status: MeetingStatus = "scheduled"
    created_at: datetime

    class Config:
        from_attributes = True
