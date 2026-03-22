from pydantic import BaseModel
from typing import Optional, List, Literal

# 1. Base properties every Task needs
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Literal["todo", "doing", "done"] = "todo"
    complexity: int  # CRITICAL: Added because Database requires it!
    required_skills: Optional[List[str]] = None 
    assigned_to: Optional[int] = None  # Renamed to match Database!
    assignment_reason: Optional[str] = None
    is_skill_gap: bool = False

# 2. Properties required when creating a new Task
class TaskCreate(TaskBase):
    milestone_id: Optional[int] = None
    project_id: Optional[int] = None
    milestone_title: Optional[str] = None
    milestone_effort_points: Optional[int] = None


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["todo", "doing", "done"]] = None
    complexity: Optional[int] = None
    required_skills: Optional[List[str]] = None
    assigned_to: Optional[int] = None
    assignment_reason: Optional[str] = None
    is_skill_gap: Optional[bool] = None

# 3. Properties returned when sending a Task back to the frontend
class TaskResponse(TaskBase):
    id: int
    milestone_id: int
    milestone_title: Optional[str] = None
    milestone_order: Optional[int] = None
    project_id: int

    class Config:
        from_attributes = True