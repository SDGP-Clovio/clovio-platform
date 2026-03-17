# app/services/chat_service.py
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.chat import (
    Conversation, ConversationParticipant,
    DirectConversation, Message, DirectMessage,
)
from app.models.user import User


# ── Group chat ──────────────────────────────────────────────

def create_conversation_for_project(
    db: Session,
    project_id: uuid.UUID,
    member_ids: list[uuid.UUID],
) -> Conversation:
    """
    Called automatically when a project is created.
    Creates the group chat and adds all initial members.
    """
    conversation = Conversation(project_id=project_id)
    db.add(conversation)
    db.flush()  # get conversation.id without committing yet

    for user_id in member_ids:
        db.add(ConversationParticipant(
            conversation_id=conversation.id,
            user_id=user_id,
        ))

    db.commit()
    db.refresh(conversation)
    return conversation


def add_participant(db: Session, project_id: uuid.UUID, user_id: uuid.UUID):
    """Called when a new member is added to the project."""
    conversation = _get_conversation_by_project(db, project_id)
    already_in = db.query(ConversationParticipant).filter_by(
        conversation_id=conversation.id,
        user_id=user_id,
    ).first()
    if not already_in:
        db.add(ConversationParticipant(conversation_id=conversation.id, user_id=user_id))
        db.commit()


def remove_participant(db: Session, project_id: uuid.UUID, user_id: uuid.UUID):
    """Called when a member is removed from the project."""
    conversation = _get_conversation_by_project(db, project_id)
    db.query(ConversationParticipant).filter_by(
        conversation_id=conversation.id,
        user_id=user_id,
    ).delete()
    db.commit()


def is_participant(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    return db.query(ConversationParticipant).filter_by(
        conversation_id=conversation_id,
        user_id=user_id,
    ).first() is not None


def get_recent_messages(db: Session, conversation_id: uuid.UUID, limit: int = 50) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )


def _get_conversation_by_project(db: Session, project_id: uuid.UUID) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.project_id == project_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found for this project")
    return conv

