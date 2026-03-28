from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload
from typing import List

# Importing your database connection and the Pydantic "bouncers" you just made
from app.core.database import get_db
from app.core.auth import get_current_user, hash_password
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserSettingsResponse,
    UserSettingsUpdate,
)
from app.models.user import User  # Importing the SQLAlchemy database model
from app.models.skill import Skill
from app.models.user_skill import UserSkill

router = APIRouter()


_LEVEL_TO_LABEL = {
    1: "beginner",
    2: "intermediate",
    3: "advanced",
    4: "expert",
}

_LABEL_TO_LEVEL = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3,
    "expert": 4,
}


def _serialize_user_settings(user: User) -> dict:
    skills = []
    for user_skill in user.skills:
        if user_skill.skill is None:
            continue
        skills.append(
            {
                "name": user_skill.skill.name,
                "level": _LEVEL_TO_LABEL.get(int(user_skill.level), "beginner"),
            }
        )

    default_availability = user.default_availability
    if not isinstance(default_availability, list):
        default_availability = []

    return {
        "id": int(user.id),
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": bool(user.is_active),
        "skills": skills,
        "default_availability": default_availability,
    }


@router.get("/me/settings", response_model=UserSettingsResponse)
def get_my_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .options(selectinload(User.skills).selectinload(UserSkill.skill))
        .filter(User.id == current_user.id)
        .first()
    )

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return _serialize_user_settings(user)


@router.put("/me/settings", response_model=UserSettingsResponse)
def update_my_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .options(selectinload(User.skills).selectinload(UserSkill.skill))
        .filter(User.id == current_user.id)
        .first()
    )

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    updates = settings_update.model_dump(exclude_unset=True)

    if "full_name" in updates:
        full_name = (updates.get("full_name") or "").strip()
        user.full_name = full_name if full_name else user.full_name

    if "default_availability" in updates:
        slots = settings_update.default_availability or []
        normalized_slots = [slot.model_dump() for slot in slots]
        user.default_availability = normalized_slots

    if "skills" in updates:
        incoming_skills = settings_update.skills or []

        unique_skills: dict[str, tuple[str, int]] = {}
        for skill in incoming_skills:
            name = skill.name.strip()
            if not name:
                continue
            unique_skills[name.lower()] = (name, _LABEL_TO_LEVEL[skill.level])

        db.query(UserSkill).filter(UserSkill.user_id == user.id).delete(synchronize_session=False)

        if unique_skills:
            existing_skills = (
                db.query(Skill)
                .filter(func.lower(Skill.name).in_(list(unique_skills.keys())))
                .all()
            )
            skills_by_key = {skill.name.lower(): skill for skill in existing_skills}

            for normalized_name, (display_name, level) in unique_skills.items():
                skill = skills_by_key.get(normalized_name)
                if skill is None:
                    skill = Skill(name=display_name)
                    db.add(skill)
                    db.flush()
                    skills_by_key[normalized_name] = skill
                elif skill.name != display_name:
                    skill.name = display_name

                db.add(UserSkill(user_id=user.id, skill_id=skill.id, level=level))

    db.commit()

    refreshed = (
        db.query(User)
        .options(selectinload(User.skills).selectinload(UserSkill.skill))
        .filter(User.id == current_user.id)
        .first()
    )

    if refreshed is None:
        raise HTTPException(status_code=404, detail="User not found")

    return _serialize_user_settings(refreshed)

@router.post("/", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user in the Clovio platform.
    """
    # 1. Check if a user with this email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Map the validated Pydantic data to your SQLAlchemy model
    
    new_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hash_password(user.password)
    )
    
    # 3. Save to the PostgreSQL database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Fetch a list of all registered users.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users