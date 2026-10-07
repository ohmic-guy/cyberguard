from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from ...config import settings

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
	username: str
	password: str


@router.post("/api/v1/auth/login")
async def login(request: LoginRequest) -> dict[str, str]:
	if request.username != settings.ADMIN_USER or request.password != settings.ADMIN_PASS:
		raise HTTPException(status_code=401, detail="Invalid credentials")
	token = jwt.encode(
		{"sub": request.username, "exp": datetime.now(timezone.utc) + timedelta(hours=8)},
		settings.JWT_SECRET,
		algorithm="HS256",
	)
	return {"access_token": token, "token_type": "bearer"}


def get_current_user(token: str) -> str:
	try:
		payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
		username = payload.get("sub")
		if not username:
			raise ValueError("Missing subject")
		return str(username)
	except (JWTError, ValueError) as error:
		raise HTTPException(status_code=401, detail="Invalid token") from error


def require_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
	if credentials is None:
		raise HTTPException(status_code=401, detail="Authentication required")
	return get_current_user(credentials.credentials)
