"""
Authentication API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import create_access_token, get_current_user
from app.schemas.auth_schema import TokenResponse

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

# Temporary in-memory user store (replace with DB later)
fake_user_db = {
    "admin": {
        "username": "admin",
        "password": "admin123"
    }
}


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and return JWT token.
    """

    user = fake_user_db.get(form_data.username)

    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(
        {"sub": user["username"]}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_profile(user: str = Depends(get_current_user)):
    """
    Example protected endpoint.
    """

    return {"username": user}