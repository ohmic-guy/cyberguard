import asyncio
import logging
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from api.routes.auth import ALGORITHM
from config import settings
from core.events.event_bus import event_bus
from core.events.event_types import ThreatEvent
from core.events.streams import THREAT_COMPLETE, THREAT_ESCALATED

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages active WebSocket client connections and handles message broadcasting."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        disconnected: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


async def broadcast_stream_listener() -> None:
    """Background listener consuming complete and escalated streams and broadcasting to WebSockets."""
    group = "websocket_broadcaster_group"
    consumer = "ws_consumer_1"

    # Create consumer groups
    for stream in (THREAT_COMPLETE, THREAT_ESCALATED):
        try:
            await event_bus.create_consumer_group(stream, group)
        except Exception:
            pass

    while True:
        try:
            for stream, msg_type in [(THREAT_COMPLETE, "threat.complete"), (THREAT_ESCALATED, "threat.escalated")]:
                entries = await event_bus.consume(stream=stream, group=group, consumer=consumer, count=10, block_ms=1000)
                for entry_id, event in entries:
                    event_dict = event.model_dump(mode="json")
                    payload = {
                        "type": msg_type,
                        "data": event_dict,
                        **event_dict,
                    }
                    await manager.broadcast(payload)
                    await event_bus.ack(stream, group, entry_id)
        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.error(f"Error in websocket broadcast listener: {exc}")
            await asyncio.sleep(1)


@router.websocket("/ws/threats")
async def websocket_threats_endpoint(websocket: WebSocket) -> None:
    """WS endpoint requiring JWT query param auth, handling 30s keep-alive ping/pong."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token parameter")
        return

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired token")
        return

    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            if isinstance(data, dict) and data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
