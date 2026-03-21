from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task and assign it to a milestone.
    """
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
    
    return new_task

@router.get("/", response_model=List[TaskResponse])
def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all tasks.
    """
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks