from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.meeting import Meeting
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingResponse

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


def _current_db_user(db: Session, principal: User | str) -> User:
    if isinstance(principal, User):
        return principal

    user = db.query(User).filter(User.username == principal).first()
    if not user:
        raise HTTPException(status_code=401, detail="Authenticated user not found")
    return user


def _serialize_meeting(meeting: Meeting) -> dict:
    return {
        "id": int(meeting.id),
        "project_id": int(meeting.project_id),
        "title": meeting.title,
        "description": meeting.description,
        "start_time": meeting.start_time,
        "end_time": meeting.end_time,
        "attendees": [int(uid) for uid in (meeting.attendees or [])],
        "created_by": int(meeting.created_by) if meeting.created_by is not None else 0,
        "location": meeting.location,
        "status": meeting.status,
        "created_at": meeting.created_at,
    }


@router.get("/", response_model=list[MeetingResponse])
def list_meetings(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current = _current_db_user(db, current_user)

    allowed_project_ids = [
        pid
        for (pid,) in db.query(ProjectMember.project_id)
        .filter(ProjectMember.user_id == current.id)
        .all()
    ]

    if project_id is not None and project_id not in allowed_project_ids:
        raise HTTPException(status_code=403, detail="Not a member of this project")

    if not allowed_project_ids:
        return []

    query = db.query(Meeting).filter(Meeting.project_id.in_(allowed_project_ids))
    if project_id is not None:
        query = query.filter(Meeting.project_id == project_id)

    meetings = query.order_by(Meeting.start_time.asc()).all()
    return [_serialize_meeting(meeting) for meeting in meetings]


@router.post("/", response_model=MeetingResponse, status_code=201)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current = _current_db_user(db, current_user)

    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == payload.project_id,
            ProjectMember.user_id == current.id,
        )
        .first()
        is not None
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this project")

    if payload.start_time >= payload.end_time:
        raise HTTPException(status_code=400, detail="Meeting end_time must be after start_time")

    project_member_ids = {
        uid
        for (uid,) in db.query(ProjectMember.user_id)
        .filter(ProjectMember.project_id == payload.project_id)
        .all()
    }

    attendee_ids = sorted(set(payload.attendees or []))
    if current.id not in attendee_ids:
        attendee_ids.append(current.id)
        attendee_ids = sorted(set(attendee_ids))

    invalid_attendees = [uid for uid in attendee_ids if uid not in project_member_ids]
    if invalid_attendees:
        raise HTTPException(
            status_code=400,
            detail=f"Attendees must be members of the project. Invalid IDs: {invalid_attendees}",
        )

    meeting = Meeting(
        project_id=payload.project_id,
        title=payload.title.strip(),
        description=payload.description,
        start_time=payload.start_time,
        end_time=payload.end_time,
        attendees=attendee_ids,
        created_by=current.id,
        location=payload.location,
        status=payload.status,
    )

    if not meeting.title:
        raise HTTPException(status_code=400, detail="Meeting title cannot be empty")

    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return _serialize_meeting(meeting)
