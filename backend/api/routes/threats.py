from fastapi import APIRouter, Depends, HTTPException, Query

from ...db.mongodb import get_db
from ...db.repositories.threat_repository import ThreatRepository
from .auth import require_user

router = APIRouter()


@router.get("/api/v1/threats")
async def get_threats(
	limit: int = Query(default=20, ge=1, le=100),
	skip: int = Query(default=0, ge=0),
) -> list[dict]:
	return await ThreatRepository(get_db()).get_recent(limit=limit, skip=skip)


@router.get("/api/v1/threats/{event_id}")
async def get_threat(event_id: str) -> dict:
	threat = await ThreatRepository(get_db()).get_by_event_id(event_id)
	if threat is None:
		raise HTTPException(status_code=404, detail="Threat not found")
	return threat
