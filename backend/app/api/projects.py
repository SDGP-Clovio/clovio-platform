from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

# Import Database tools
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User

# Import Schemas (Both your AI ones and the new Database ones)
from app.schemas.project import (
    ProjectRequest, 
    MilestonePlanResponse,
    ProjectCreate,
    ProjectResponse
)

# Import AI Service
from app.services.ai_service import generate_milestones_only

# We leave the prefix blank here because main.py handles it!
router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project in the database."""
    # Check if the user trying to own this project actually exists
    db_owner = db.query(User).filter(User.id == project.created_by).first()
    if not db_owner:
        raise HTTPException(status_code=404, detail="Owner (User) not found")
    
    new_project = Project(
        name=project.name,
        description=project.description,
        status=project.status,
        created_by=project.created_by  # Updated to match the DB column!
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/", response_model=List[ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all projects from the database."""
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects



@router.post("/breakdown", response_model=MilestonePlanResponse)
async def create_project_plan(request: ProjectRequest):
    """
    Generate milestones (without tasks) for a project description and team members.
    """
    try:
        plan = generate_milestones_only(request.description, request.team_members)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))