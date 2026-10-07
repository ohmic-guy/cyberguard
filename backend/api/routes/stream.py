from fastapi import APIRouter, Depends

from ...core.events.event_bus import event_bus
from ...core.events.event_types import ThreatEvent
from ...core.events.streams import RAW_INPUT
from .auth import require_user

router = APIRouter(dependencies=[Depends(require_user)])


@router.post("/api/v1/stream/ingest")
async def ingest(event: ThreatEvent) -> dict[str, str]:
	entry_id = await event_bus.publish(RAW_INPUT, event)
	return {"event_id": event.event_id, "status": "queued", "entry_id": entry_id}
