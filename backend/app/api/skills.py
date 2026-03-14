from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.skill import SkillCreate, SkillResponse
from app.models.skill import Skill  # Your SQLAlchemy VIP section

router = APIRouter()

@router.post("/", response_model=SkillResponse, status_code=201)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    """
    Add a new master skill (e.g., 'Python', 'React') to the platform.
    """
    # Check if the skill already exists (case-insensitive)
    db_skill = db.query(Skill).filter(Skill.name.ilike(skill.name)).first()
    if db_skill:
        raise HTTPException(status_code=400, detail="Skill already exists in the system")
    
    new_skill = Skill(
        name=skill.name,
        category=skill.category
    )
    
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    return new_skill

@router.get("/", response_model=List[SkillResponse])
def read_skills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Fetch all available skills in the platform.
    """
    skills = db.query(Skill).offset(skip).limit(limit).all()
    return skills