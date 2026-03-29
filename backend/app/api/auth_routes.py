"""
Authentication API routes with database integration.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    is_recognized_password_hash,
    verify_password,
)
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth_schema import RegisterRequest, TokenResponse, UserResponse

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


def authenticate_user(db: Session, username: str, password: str) -> User:
    """
    Authenticate a user by username/email and password.
    """
    # Try to find user by username or email
    user = db.query(User).filter(
        (User.username == username) | (User.email == username)
    ).first()

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        # Backward compatibility path for legacy plaintext values in hashed_password.
        # If the raw password matches, immediately upgrade it to bcrypt.
        if not is_recognized_password_hash(user.hashed_password) and password == user.hashed_password:
            user.hashed_password = hash_password(password)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            return None

    if not user.is_active:
        return None

    return user


def get_user_by_username_or_email(db: Session, username: str, email: str) -> User:
    """
    Check if a user exists by username or email.
    """
    return db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()


@router.post("/register", response_model=UserResponse)
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    """
    # Check if user already exists
    existing_user = get_user_by_username_or_email(db, user_data.username, user_data.email)
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    """
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    """
    return current_user