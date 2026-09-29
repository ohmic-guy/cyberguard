from typing import Any
from fastapi import APIRouter, Body, Depends
from api.routes.auth import get_current_user
from ingestion.redis_stream_handler import RedisStreamHandler

router = APIRouter(prefix="/api/v1/stream", tags=["stream"])
stream_handler = RedisStreamHandler()


@router.post("/ingest")
async def ingest_stream(
    payload: dict[str, Any] = Body(...),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    """Ingests raw JSON payload, validates modality, publishes to Redis Stream, and returns event_id."""
    event = await stream_handler.handle_stream(payload)
    return {"event_id": event.event_id, "status": "received"}
