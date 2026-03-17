"""
Authentication API routes.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import create_access_token, get_current_user, hash_password, verify_password
from app.schemas.auth_schema import TokenResponse, SignUpRequest

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


# Temporary in-memory user store (replace with DB later)
# Passwords are stored pre-hashed using bcrypt so verify_password() works correctly.
fake_user_db = {
    "admin@clovio.dev": {
        "email": "admin@clovio.dev",
        "password": hash_password("admin123")
    }
}


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 password-flow login.
    Note: OAuth2 field name is 'username', but we treat it as email.
    """
    email = form_data.username
    user = fake_user_db.get(email)

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest):
    """
    Register user by email and return JWT.
    """
    email = payload.email.lower().strip()

    if email in fake_user_db:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    fake_user_db[email] = {
        "email": email,
        "password": hash_password(payload.password)
    }

    token = create_access_token({"sub": email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_profile(email: str = Depends(get_current_user)):
    """
    Example protected endpoint.
    """
    return {"email": email}