from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.core.database import get_db
from app.models.task import Task
from app.models.milestone import Milestone
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()


def _serialize_task(task: Task, milestone: Milestone) -> dict[str, Any]:
    status_value = task.status.value if hasattr(task.status, "value") else str(task.status)
    return {
        "id": task.id,
        "name": task.name,
        "description": task.description,
        "status": status_value,
        "milestone_id": task.milestone_id,
        "milestone_title": milestone.title,
        "milestone_order": milestone.order,
        "complexity": task.complexity,
        "required_skills": task.required_skills,
        "assigned_to": task.assigned_to,
        "assignment_reason": task.assignment_reason,
        "is_skill_gap": task.is_skill_gap,
        "project_id": int(milestone.project_id),
    }


def _resolve_milestone_for_task(task: TaskCreate, db: Session) -> Milestone:
    if task.milestone_id is not None:
        milestone_query = db.query(Milestone).filter(Milestone.id == task.milestone_id)
        if task.project_id is not None:
            milestone_query = milestone_query.filter(Milestone.project_id == task.project_id)

        milestone = milestone_query.first()
        if milestone is not None:
            return milestone
        if task.project_id is None:
            raise HTTPException(status_code=404, detail="Milestone not found")

    if task.project_id is None:
        raise HTTPException(status_code=400, detail="A valid milestone_id or project_id is required")

    project = db.query(Project).filter(Project.id == task.project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    milestone_title = (task.milestone_title or "Backlog").strip() or "Backlog"
    milestone = (
        db.query(Milestone)
        .filter(
            Milestone.project_id == task.project_id,
            Milestone.title == milestone_title,
        )
        .first()
    )

    if milestone is not None:
        return milestone

    max_order = db.query(func.max(Milestone.order)).filter(Milestone.project_id == task.project_id).scalar()
    next_order = int(max_order or 0) + 1
    effort_points = int(task.milestone_effort_points or task.complexity or 1)

    milestone = Milestone(
        project_id=task.project_id,
        title=milestone_title,
        effort_points=max(1, effort_points),
        order=next_order,
    )
    db.add(milestone)
    db.flush()
    return milestone

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task and assign it to a milestone.
    """
    milestone = _resolve_milestone_for_task(task, db)

    new_task = Task(
        name=task.name,
        description=task.description,
        status=task.status,
        milestone_id=milestone.id,
        complexity=task.complexity,
        required_skills=task.required_skills,
        assigned_to=task.assigned_to,
        assignment_reason=task.assignment_reason,
        is_skill_gap=task.is_skill_gap
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return _serialize_task(new_task, milestone)

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of all tasks.
    """
    query = (
        db.query(Task, Milestone)
        .join(Milestone, Task.milestone_id == Milestone.id)
    )

    if project_id is not None:
        query = query.filter(Milestone.project_id == int(project_id))

    rows = query.offset(skip).limit(limit).all()

    return [_serialize_task(task, milestone) for task, milestone in rows]


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update an existing task."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = task_update.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)

    milestone = db.query(Milestone).filter(Milestone.id == db_task.milestone_id).first()
    if milestone is None:
        raise HTTPException(status_code=500, detail="Task milestone is missing")

    return _serialize_task(db_task, milestone)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task by ID."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()
    return None