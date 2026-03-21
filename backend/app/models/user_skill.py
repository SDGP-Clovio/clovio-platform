from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    level = Column(Integer, nullable=False)   # 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert

    __table_args__ = (
        CheckConstraint('level BETWEEN 1 AND 4', name='check_level_range'),
    )

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="users")