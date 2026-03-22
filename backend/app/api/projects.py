from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

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
    ProjectResponse
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
        return new_project
    except Exception:
        # Roll back all changes if anything goes wrong
        db.rollback()
        raise


@router.get("/", response_model=List[ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all projects from the database."""
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects


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
        add_participant(db, project_id=project_id, user_id=user_id)
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
        remove_participant(db, project_id=project_id, user_id=user_id)
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