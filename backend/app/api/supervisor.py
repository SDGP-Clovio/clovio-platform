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
