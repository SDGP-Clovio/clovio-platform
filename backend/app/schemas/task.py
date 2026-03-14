from pydantic import BaseModel
from typing import Optional

# 1. Base properties every Task needs
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "todo"  # e.g., "todo", "in_progress", "done"
    milestone_id: int     # Links the task to a specific milestone/project phase
    assigned_user_id: Optional[int] = None  # Who is doing the work? (Can be empty at first)

# 2. Properties required when creating a new Task
class TaskCreate(TaskBase):
    pass

# 3. Properties returned when sending a Task back to the frontend
class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True