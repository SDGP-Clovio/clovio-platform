from pydantic import BaseModel, EmailStr
from typing import Optional

# 1. Base properties shared across all user interactions
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# 2. Properties required when a user registers (Create)
class UserCreate(UserBase):
    password: str

# 3. Properties returned to the frontend (Read)
class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True