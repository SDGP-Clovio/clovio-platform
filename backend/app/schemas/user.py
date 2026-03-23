from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional
from app.models.user import UserRole

# 1. Base properties shared across all user interactions
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# 2. Properties required when a user registers (Create)
class UserCreate(UserBase):
    password: str


class DayAvailabilitySlot(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    hours: List[int] = Field(default_factory=list)
    enabled: bool = True


# 3. Properties returned to the frontend (Read)
class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    default_availability: Optional[List[DayAvailabilitySlot]] = Field(default_factory=list)

    class Config:
        from_attributes = True


class UserSkillSetting(BaseModel):
    name: str
    level: Literal["beginner", "intermediate", "advanced", "expert"]


class UserSettingsResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    skills: List[UserSkillSetting] = Field(default_factory=list)
    default_availability: List[DayAvailabilitySlot] = Field(default_factory=list)


class UserSettingsUpdate(BaseModel):
    full_name: Optional[str] = None
    skills: Optional[List[UserSkillSetting]] = None
    default_availability: Optional[List[DayAvailabilitySlot]] = None