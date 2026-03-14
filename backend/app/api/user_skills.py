from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.user_skill import UserSkillCreate, UserSkillResponse
from app.models.user_skill import UserSkill  # The Bridge Table
from app.models.user import User          # To check if user exists
from app.models.skill import Skill        # To check if skill exists

router = APIRouter()

@router.post("/", response_model=UserSkillResponse, status_code=201)
def assign_skill_to_user(user_skill: UserSkillCreate, db: Session = Depends(get_db)):
    """
    Link a specific user to a specific skill in the Clovio platform.
    """
    # 1. Make sure the User actually exists
    db_user = db.query(User).filter(User.id == user_skill.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Make sure the Master Skill actually exists
    db_skill = db.query(Skill).filter(Skill.id == user_skill.skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    # 3. Check if they already have this skill linked!
    existing_link = db.query(UserSkill).filter(
        UserSkill.user_id == user_skill.user_id,
        UserSkill.skill_id == user_skill.skill_id
    ).first()
    
    if existing_link:
        raise HTTPException(status_code=400, detail="User already has this skill assigned")

    # 4. Create the new bridge connection
    new_link = UserSkill(
        user_id=user_skill.user_id,
        skill_id=user_skill.skill_id,
        proficiency_level=user_skill.proficiency_level
    )
    
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    return new_link