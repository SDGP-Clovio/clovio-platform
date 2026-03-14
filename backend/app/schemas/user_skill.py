from pydantic import BaseModel
from typing import Optional

# 1. Base properties for assigning a skill to a user
class w_UserSkillBase(BaseModel):
    w_user_id: int
    w_skill_id: int
    w_proficiency_level: Optional[int] = 1  # e.g., 1-5 scale to show how good they are

# 2. Properties required to create the link
class w_UserSkillCreate(w_UserSkillBase):
    pass

# 3. Properties returned when fetching the link
class w_UserSkillResponse(w_UserSkillBase):
    w_id: int

    class Config:
        from_attributes = True