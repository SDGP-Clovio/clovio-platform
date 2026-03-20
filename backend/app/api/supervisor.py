from typing import Any, Mapping
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/supervisor", tags=["Supervisor"])


def get_supervisor_user() -> Mapping[str, Any]:
    """
    Integration hook for existing JWT + role guard.

    Replace this dependency with your existing branch dependency that ensures
    supervisor-only access and returns the authenticated user payload.
    """
    raise HTTPException(
        status_code=500,
        detail="Supervisor auth dependency is not configured. Wire existing JWT/role dependency.",
    )

def _extract_user_id(user_payload: Mapping[str, Any]) -> int:
    raw_id = user_payload.get("id")
    if raw_id is None:
        raise HTTPException(status_code=401, detail="Authenticated user payload missing id")
    try:
        return int(raw_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Authenticated user id is invalid")
