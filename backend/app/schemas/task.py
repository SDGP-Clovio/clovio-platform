from pydantic import BaseModel
from typing import Optional, List, Any

# 1. Base properties every Task needs
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "todo"  # Must be "todo", "doing", or "done" to match DB
    milestone_id: int
    complexity: int  # CRITICAL: Added because Database requires it!
    required_skills: Optional[List[str]] = None 
    assigned_to: Optional[int] = None  # Renamed to match Database!
    assignment_reason: Optional[str] = None
    is_skill_gap: bool = False

# 2. Properties required when creating a new Task
class TaskCreate(TaskBase):
    pass

# 3. Properties returned when sending a Task back to the frontend
class TaskResponse(TaskBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True