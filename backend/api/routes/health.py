from fastapi import APIRouter

from ...core.events.event_bus import event_bus
from ...db.mongodb import check_mongodb

router = APIRouter()


@router.get("/api/v1/health")
async def health() -> dict[str, str]:
	return {
		"status": "ok",
		"redis": await event_bus.check(),
		"mongodb": await check_mongodb(),
	}