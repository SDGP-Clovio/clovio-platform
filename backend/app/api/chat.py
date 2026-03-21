from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from collections import defaultdict
from typing import Dict, Set

from app.core.database import get_db, SessionLocal
from app.core.auth import get_current_user, verify_token
from app.models.user import User
from app.models.chat import Message, DirectMessage, DirectConversation
from app.services.chat_service import (
    get_or_create_dm,
    is_dm_participant,
    is_participant,
    get_recent_messages,
    get_recent_dm_messages,
    get_conversation_by_project,
)
from app.schemas.chat import (
    StartDMRequest,
    DirectConversationOut,
    MessageOut,
    SendMessageRequest,
    SendDirectMessageRequest,
)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ConnectionManager:
    def __init__(self):
        self.group_rooms: Dict[int, Set[WebSocket]] = defaultdict(set)
        self.dm_rooms: Dict[int, Set[WebSocket]] = defaultdict(set)

    async def connect_group(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        self.group_rooms[conversation_id].add(websocket)

    async def disconnect_group(self, conversation_id: int, websocket: WebSocket):
        self.group_rooms[conversation_id].discard(websocket)

    async def broadcast_group(self, conversation_id: int, payload: dict):
        dead = []
        for ws in self.group_rooms[conversation_id]:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.group_rooms[conversation_id].discard(ws)

    async def connect_dm(self, dm_id: int, websocket: WebSocket):
        await websocket.accept()
        self.dm_rooms[dm_id].add(websocket)

    async def disconnect_dm(self, dm_id: int, websocket: WebSocket):
        self.dm_rooms[dm_id].discard(websocket)

    async def broadcast_dm(self, dm_id: int, payload: dict):
        dead = []
        for ws in self.dm_rooms[dm_id]:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.dm_rooms[dm_id].discard(ws)


manager = ConnectionManager()


def _current_db_user(db: Session, username: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Authenticated user not found")
    return user


def _user_from_token(db: Session, token: str) -> User:
    payload = verify_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Authenticated user not found")
    return user

@router.post("/dm/start", response_model=DirectConversationOut)
def start_dm(
    payload: StartDMRequest,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user),
):
    current = _current_db_user(db, username)
    dm = get_or_create_dm(db, current_user_id=current.id, target_email=payload.email)
    db.commit()
    db.refresh(dm)

    other_id = dm.user_b_id if dm.user_a_id == current.id else dm.user_a_id
    other = db.query(User).filter(User.id == other_id).first()
    if not other:
        raise HTTPException(status_code=404, detail="Counterpart user not found")

    return DirectConversationOut(
        id=dm.id,
        with_user_id=other.id,
        with_username=other.username,
        with_email=other.email,
    )


@router.get("/dm/{dm_id}/messages", response_model=list[MessageOut])
def list_dm_messages(
    dm_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user),
):
    current = _current_db_user(db, username)

    if not is_dm_participant(db, dm_id, current.id):
        raise HTTPException(status_code=403, detail="Not a participant in this DM")

    msgs = get_recent_dm_messages(db, dm_id, limit=100)
    msgs = list(reversed(msgs))

    return [
        MessageOut(
            id=m.id,
            sender_id=m.sender_id,
            sender_username=(m.sender.username if m.sender else "unknown"),
            content=m.content,
            created_at=m.created_at,
        )
        for m in msgs
    ]


@router.post("/dm/{dm_id}/messages", response_model=MessageOut)
def send_dm_message(
    dm_id: int,
    payload: SendDirectMessageRequest,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user),
):
    current = _current_db_user(db, username)

    if not is_dm_participant(db, dm_id, current.id):
        raise HTTPException(status_code=403, detail="Not a participant in this DM")

    msg = DirectMessage(
        direct_conversation_id=dm_id,
        sender_id=current.id,
        content=payload.content.strip(),
    )
    if not msg.content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    db.add(msg)
    db.commit()
    db.refresh(msg)

    return MessageOut(
        id=msg.id,
        sender_id=msg.sender_id,
        sender_username=current.username,
        content=msg.content,
        created_at=msg.created_at,
    )