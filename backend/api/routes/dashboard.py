from fastapi import APIRouter, Depends

from ...db.mongodb import get_db
from ...db.repositories.threat_repository import ThreatRepository
from .auth import require_user

router = APIRouter()


@router.get("/api/v1/dashboard/stats")
async def dashboard_stats() -> dict:
	return await ThreatRepository(get_db()).get_stats()
