from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

ALGORITHM = "HS256"
EXPIRE_M = 60 * 24  # 24-hour tokens


def create_access_token(data: dict[str, Any]) -> str:
    """Generates a JWT access token with a 24-hour expiration time."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_M)
    to_encode = {**data, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2)) -> dict[str, Any]:
    """Dependency to validate JWT Bearer token on protected routes."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()) -> dict[str, str]:
    """Issues JWT token upon verifying credentials against admin settings."""
    if form.username != settings.ADMIN_USER or form.password != settings.ADMIN_PASS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
        )
    token = create_access_token({"sub": form.username, "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}
