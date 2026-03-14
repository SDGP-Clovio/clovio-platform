from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Importing your database connection and the Pydantic "bouncers" you just made
from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User  # Importing the SQLAlchemy database model

router = APIRouter()

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
        first_name=user.first_name,
        last_name=user.last_name,
        student_id=user.student_id,
        hashed_password=user.password # Storing raw temporarily for testing
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