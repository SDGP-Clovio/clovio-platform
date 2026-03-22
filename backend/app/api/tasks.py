from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.core.database import get_db
from app.models.task import Task
from app.models.milestone import Milestone
from app.schemas.task import TaskCreate, TaskResponse

router = APIRouter()


def _serialize_task(task: Task, project_id: int) -> dict[str, Any]:
    status_value = task.status.value if hasattr(task.status, "value") else str(task.status)
    return {
        "id": task.id,
        "name": task.name,
        "description": task.description,
        "status": status_value,
        "milestone_id": task.milestone_id,
        "complexity": task.complexity,
        "required_skills": task.required_skills,
        "assigned_to": task.assigned_to,
        "assignment_reason": task.assignment_reason,
        "is_skill_gap": task.is_skill_gap,
        "project_id": project_id,
    }

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task and assign it to a milestone.
    """
    milestone = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    new_task = Task(
        name=task.name,
        description=task.description,
        status=task.status,
        milestone_id=task.milestone_id,
        complexity=task.complexity,
        required_skills=task.required_skills,
        assigned_to=task.assigned_to,
        assignment_reason=task.assignment_reason,
        is_skill_gap=task.is_skill_gap
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return _serialize_task(new_task, milestone.project_id)

@router.get("/", response_model=List[TaskResponse])
def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all tasks.
    """
    rows = (
        db.query(Task, Milestone.project_id)
        .join(Milestone, Task.milestone_id == Milestone.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_serialize_task(task, int(project_id)) for task, project_id in rows]