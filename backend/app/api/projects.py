from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Any, List

# Import Database tools
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User, UserRole
from app.models.project_member import ProjectMember

# Import Schemas (Both your AI ones and the new Database ones)
from app.schemas.project import (
    ProjectRequest,
    MilestonePlanResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)

# Import AI Service
from app.services.ai_service import generate_milestones_only
import logging

logger = logging.getLogger(__name__)

# Import Chat Service for managing project conversations and participants
from app.services.chat_service import (
    create_conversation_for_project,
    add_participant,
    remove_participant,
)

# We leave the prefix blank here because main.py handles it!
router = APIRouter()


def _serialize_project(db: Session, project: Project) -> dict[str, Any]:
    member_rows = (
        db.query(ProjectMember.user_id, User.role)
        .join(User, User.id == ProjectMember.user_id)
        .filter(ProjectMember.project_id == project.id)
        .all()
    )

    member_ids = [int(user_id) for user_id, role in member_rows if role != UserRole.SUPERVISOR]
    supervisor_ids = [int(user_id) for user_id, role in member_rows if role == UserRole.SUPERVISOR]

    status_value = project.status.value if hasattr(project.status, "value") else str(project.status)

    return {
        "id": int(project.id),
        "name": project.name,
        "description": project.description,
        "status": status_value,
        "created_by": int(project.created_by) if project.created_by is not None else 0,
        "course_name": project.course_name,
        "deadline": project.deadline,
        "created_at": project.created_at,
        "member_ids": member_ids,
        "supervisor_id": supervisor_ids[0] if supervisor_ids else None,
    }


def _sync_conversation_member_add(db: Session, project_id: int, user_id: int) -> None:
    try:
        add_participant(db, project_id=project_id, user_id=user_id)
    except HTTPException as exc:
        # Legacy projects may exist without a project conversation.
        if exc.status_code != 404:
            raise


def _sync_conversation_member_remove(db: Session, project_id: int, user_id: int) -> None:
    try:
        remove_participant(db, project_id=project_id, user_id=user_id)
    except HTTPException as exc:
        # Legacy projects may exist without a project conversation.
        if exc.status_code != 404:
            raise


@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project in the database."""
    # Check if the user trying to own this project actually exists
    db_owner = db.query(User).filter(User.id == project.created_by).first()
    if not db_owner:
        raise HTTPException(status_code=404, detail="Owner (User) not found")

    # Combine provided member IDs with the owner's ID, using a set to avoid duplicates
    unique_member_ids = set(project.member_ids or [])
    unique_member_ids.add(project.created_by)

    if project.supervisor_id is not None:
        supervisor = db.query(User).filter(User.id == project.supervisor_id).first()
        if not supervisor:
            raise HTTPException(status_code=404, detail="Supervisor user not found")
        if supervisor.role != UserRole.SUPERVISOR:
            raise HTTPException(status_code=400, detail="Selected supervisor user must have supervisor role")
        unique_member_ids.add(project.supervisor_id)

    # Validate that all provided member IDs exist in the database
    users = db.query(User).filter(User.id.in_(list(unique_member_ids))).all()
    found_ids = {u.id for u in users}
    missing_ids = unique_member_ids - found_ids
    if missing_ids:
        raise HTTPException(status_code=400, detail=f"Invalid member IDs: {sorted(list(missing_ids))}")

    try:
        new_project = Project(
            name=project.name,
            description=project.description,
            status=project.status,
            created_by=project.created_by,  # Updated to match the DB column!
            course_name=project.course_name,
            deadline=project.deadline,
        )
        db.add(new_project)
        # Flush to get the new project ID without fully committing yet
        db.flush()

        # Create a ProjectMember record for each member (including the owner)
        for uid in unique_member_ids:
            db.add(ProjectMember(project_id=new_project.id, user_id=uid))

        # Automatically create a group conversation for this project with all members
        create_conversation_for_project(
            db=db,
            project_id=new_project.id,
            member_ids=list(unique_member_ids),
        )

        db.commit()
        db.refresh(new_project)
        return _serialize_project(db, new_project)
    except Exception:
        # Roll back all changes if anything goes wrong
        db.rollback()
        raise


@router.get("/", response_model=List[ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all projects from the database."""
    projects = db.query(Project).offset(skip).limit(limit).all()
    return [_serialize_project(db, project) for project in projects]


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    """Update core project fields and project membership."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = project_update.model_dump(exclude_unset=True)
    if not updates:
        return _serialize_project(db, project)

    current_member_rows = (
        db.query(ProjectMember.user_id)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )
    current_member_ids = {int(user_id) for (user_id,) in current_member_rows}

    current_supervisor_rows = (
        db.query(ProjectMember.user_id)
        .join(User, User.id == ProjectMember.user_id)
        .filter(
            ProjectMember.project_id == project_id,
            User.role == UserRole.SUPERVISOR,
        )
        .all()
    )
    current_supervisor_ids = {int(user_id) for (user_id,) in current_supervisor_rows}

    if "member_ids" in updates:
        target_member_ids = {int(user_id) for user_id in (updates.get("member_ids") or [])}
    else:
        target_member_ids = set(current_member_ids)

    if "supervisor_id" in updates:
        supervisor_id = updates.get("supervisor_id")
        if supervisor_id is not None:
            supervisor = db.query(User).filter(User.id == supervisor_id).first()
            if supervisor is None:
                raise HTTPException(status_code=404, detail="Supervisor user not found")
            if supervisor.role != UserRole.SUPERVISOR:
                raise HTTPException(status_code=400, detail="Selected supervisor user must have supervisor role")
            target_member_ids.add(int(supervisor_id))
        else:
            for current_supervisor_id in current_supervisor_ids:
                target_member_ids.discard(current_supervisor_id)
    else:
        target_member_ids.update(current_supervisor_ids)

    if project.created_by is not None:
        target_member_ids.add(int(project.created_by))

    if target_member_ids:
        users = db.query(User).filter(User.id.in_(list(target_member_ids))).all()
        found_ids = {int(user.id) for user in users}
        missing_ids = target_member_ids - found_ids
        if missing_ids:
            raise HTTPException(status_code=400, detail=f"Invalid member IDs: {sorted(list(missing_ids))}")

    for field in ("name", "description", "status", "course_name", "deadline"):
        if field in updates:
            setattr(project, field, updates[field])

    to_add = target_member_ids - current_member_ids
    to_remove = current_member_ids - target_member_ids

    try:
        for user_id in to_add:
            db.add(ProjectMember(project_id=project_id, user_id=user_id))
            _sync_conversation_member_add(db, project_id=project_id, user_id=user_id)

        for user_id in to_remove:
            membership = (
                db.query(ProjectMember)
                .filter(
                    ProjectMember.project_id == project_id,
                    ProjectMember.user_id == user_id,
                )
                .first()
            )
            if membership is not None:
                db.delete(membership)
            _sync_conversation_member_remove(db, project_id=project_id, user_id=user_id)

        db.commit()
        db.refresh(project)
        return _serialize_project(db, project)
    except Exception:
        db.rollback()
        raise


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project and all related records."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        db.delete(project)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return None


@router.post("/{project_id}/members/{user_id}", status_code=204)
def add_project_member(project_id: int, user_id: int, db: Session = Depends(get_db)):
    """Add a user to an existing project and its associated conversation."""
    # Ensure the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Ensure the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user is already a member to avoid duplicate entries
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if not existing:
        db.add(ProjectMember(project_id=project_id, user_id=user_id))
        # Also add the user to the project's chat conversation
        _sync_conversation_member_add(db, project_id=project_id, user_id=user_id)
        db.commit()

    return None


@router.delete("/{project_id}/members/{user_id}", status_code=204)
def remove_project_member_endpoint(project_id: int, user_id: int, db: Session = Depends(get_db)):
    """Remove a user from a project and its associated conversation."""
    # Ensure the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Look up the membership record
    row = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()

    if row:
        db.delete(row)
        # Also remove the user from the project's chat conversation
        _sync_conversation_member_remove(db, project_id=project_id, user_id=user_id)
        db.commit()

    return None


@router.post("/breakdown", response_model=MilestonePlanResponse)
async def create_project_plan(request: ProjectRequest):
    """
    Generate milestones (without tasks) for a project description and team members.
    """
    try:
        logger.info(f"Received request: description={request.description[:50]}..., team_members={len(request.team_members)}")
        plan = generate_milestones_only(request.description, request.team_members)
        logger.info(f"Generated plan with {len(plan.milestones)} milestones")
        return plan
    except Exception as e:
        logger.error(f"Error in create_project_plan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))