from fastapi import APIRouter, Query

from ...db.mongodb import get_db
from ...db.repositories.threat_repository import ThreatRepository

router = APIRouter()


@router.get("/api/v1/threats")
async def get_threats(
	limit: int = Query(default=20, ge=1, le=100),
	skip: int = Query(default=0, ge=0),
) -> list[dict]:
	return await ThreatRepository(get_db()).get_recent(limit=limit, skip=skip)
