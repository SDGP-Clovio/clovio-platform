from pydantic import BaseModel, EmailStr
from typing import Optional, List

# 1. Base properties shared across all user interactions
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    student_id: Optional[str] = None
    # Essential for Clovio's AI to allocate tasks fairly based on expertise
    skills: Optional[List[str]] = []

# 2. Properties required when a user registers (Create)
class UserCreate(UserBase):
    password: str

# 3. Properties returned to the frontend (Read)
class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        # Tells Pydantic to read data directly from your SQLAlchemy models
        from_attributes = True