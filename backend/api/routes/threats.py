from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query

from ...core.events.event_bus import event_bus
from ...core.events.event_types import InputModality, ThreatCategory, ThreatEvent
from ...core.events.streams import RAW_INPUT
from ...db.mongodb import get_db
from ...db.repositories.threat_repository import ThreatRepository
from ...core.runtime_store import get_event, get_recent
from .auth import require_user

router = APIRouter()


class ThreatAnalysisRequest(BaseModel):
	category: ThreatCategory
	modality: InputModality
	source: str
	payload: dict[str, object]


@router.post("/api/v1/threats/analyze")
async def analyze_threat(request: ThreatAnalysisRequest) -> dict[str, object]:
	event = ThreatEvent(
		category=request.category,
		modality=request.modality,
		source=request.source,
		payload=request.payload,
	)
	entry_id = await event_bus.publish(RAW_INPUT, event)
	return {
		**event.model_dump(mode="json"),
		"status": "queued",
		"entry_id": entry_id,
	}


@router.get("/api/v1/threats")
async def get_threats(
	limit: int = Query(default=20, ge=1, le=100),
	skip: int = Query(default=0, ge=0),
	category: ThreatCategory | None = Query(default=None),
	modality: InputModality | None = Query(default=None),
	risk: str | None = Query(default=None),
	search: str | None = Query(default=None),
) -> list[dict]:
	try:
		threats = await ThreatRepository(get_db()).get_recent(limit=100, skip=0)
	except Exception:
		threats = get_recent(limit=100, skip=0)
	if category is not None:
		threats = [item for item in threats if item.get("category") == category.value]
	if modality is not None:
		threats = [item for item in threats if item.get("modality") == modality.value]
	if risk is not None:
		threats = [item for item in threats if item.get("risk_level") == risk]
	if search:
		needle = search.lower()
		threats = [
			item for item in threats
			if needle in str(item.get("event_id", "")).lower()
			or needle in str(item.get("label", "")).lower()
			or needle in str(item.get("explanation", "")).lower()
		]
	return threats[skip:skip + limit]


@router.get("/api/v1/threats/{event_id}")
async def get_threat(event_id: str) -> dict:
	try:
		threat = await ThreatRepository(get_db()).get_by_event_id(event_id)
	except Exception:
		threat = get_event(event_id)
	if threat is None:
		threat = get_event(event_id)
	if threat is None:
		raise HTTPException(status_code=404, detail="Threat not found")
	return threat
