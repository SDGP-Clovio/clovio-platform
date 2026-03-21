from pydantic import BaseModel
from datetime import datetime


class MessageOut(BaseModel):
    id: int
    sender_id: int
    sender_username: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DirectConversationOut(BaseModel):
    id: int
    with_user_id: int
    with_username: str
    with_email: str

    class Config:
        from_attributes = True


class StartDMRequest(BaseModel):
    email: str


class SendMessageRequest(BaseModel):
    content: str


class SendDirectMessageRequest(BaseModel):
    content: str