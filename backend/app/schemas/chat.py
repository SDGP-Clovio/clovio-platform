from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class MessageOut(BaseModel):
    id: UUID
    sender_id: UUID
    sender_username: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: UUID
    project_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class DirectConversationOut(BaseModel):
    id: UUID
    with_user_id: UUID
    with_username: str
    with_email: str

    class Config:
        from_attributes = True


class StartDMRequest(BaseModel):
    email: str  # user starts a DM by typing the other person's email