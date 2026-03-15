from pydantic import BaseModel, Field
from typing import Optional

# 1. Base properties for assigning a skill to a user
class UserSkillBase(BaseModel):
    user_id: int
    skill_id: int
    level: int = Field(1, ge=1, le=4)

# 2. Properties required to create the link
class UserSkillCreate(UserSkillBase):
    pass

# 3. Properties returned when fetching the link
class UserSkillResponse(UserSkillBase):
    id: int

    class Config:
        from_attributes = True