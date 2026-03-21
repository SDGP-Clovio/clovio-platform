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
    project_id: int,
    member_ids: list[int],
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


def add_participant(db: Session, project_id: int, user_id: int):
    """Called when a new member is added to the project."""
    conversation = _get_conversation_by_project(db, project_id)
    already_in = db.query(ConversationParticipant).filter_by(
        conversation_id=conversation.id,
        user_id=user_id,
    ).first()
    if not already_in:
        db.add(ConversationParticipant(conversation_id=conversation.id, user_id=user_id))
        db.commit()


def remove_participant(db: Session, project_id: int, user_id: int):
    """Called when a member is removed from the project."""
    conversation = _get_conversation_by_project(db, project_id)
    db.query(ConversationParticipant).filter_by(
        conversation_id=conversation.id,
        user_id=user_id,
    ).delete()
    db.commit()


def is_participant(db: Session, conversation_id: int, user_id: int) -> bool:
    return db.query(ConversationParticipant).filter_by(
        conversation_id=conversation_id,
        user_id=user_id,
    ).first() is not None


def get_recent_messages(db: Session, conversation_id: int, limit: int = 50) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )


def _get_conversation_by_project(db: Session, project_id: int) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.project_id == project_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found for this project")
    return conv


# ── Direct messages ─────────────────────────────────────────

def get_or_create_dm(db: Session, current_user_id: int, target_email: str) -> DirectConversation:
    """
    Finds the target user by email.
    Returns an existing DM conversation or creates a new one.
    The two user IDs are always stored in sorted order so the
    pair is always unique regardless of who initiates.
    """
    target = db.query(User).filter(User.email == target_email).first()
    if not target:
        raise HTTPException(status_code=404, detail="No user found with that email")
    if target.id == current_user_id:
        raise HTTPException(status_code=400, detail="You cannot DM yourself")

    a_id, b_id = sorted([current_user_id, target.id])  # ints sort naturally, no need for key=str

    existing = db.query(DirectConversation).filter_by(
        user_a_id=a_id,
        user_b_id=b_id,
    ).first()

    if existing:
        return existing

    dm = DirectConversation(user_a_id=a_id, user_b_id=b_id)
    db.add(dm)
    db.commit()
    db.refresh(dm)
    return dm


def is_dm_participant(db: Session, dm_id: int, user_id: int) -> bool:
    dm = db.query(DirectConversation).filter(DirectConversation.id == dm_id).first()
    if not dm:
        return False
    return user_id in [dm.user_a_id, dm.user_b_id]  # int comparison, no need for str()


def get_recent_dm_messages(db: Session, dm_id: int, limit: int = 50) -> list[DirectMessage]:
    return (
        db.query(DirectMessage)
        .filter(DirectMessage.direct_conversation_id == dm_id)
        .order_by(DirectMessage.created_at.desc())
        .limit(limit)
        .all()
    )