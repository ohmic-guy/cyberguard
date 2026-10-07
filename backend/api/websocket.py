from __future__ import annotations

import asyncio
import json

from fastapi import Query, WebSocket

from .routes.auth import get_current_user
from ..core.events.event_bus import event_bus
from ..core.events.streams import THREAT_COMPLETE

connected_clients: list[WebSocket] = []


async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)) -> None:
	try:
		get_current_user(token)
	except Exception:
		await websocket.close(code=1008)
		return
	await websocket.accept()
	connected_clients.append(websocket)
	try:
		while True:
			if await websocket.receive_text() == '{"type":"ping"}':
				await websocket.send_text('{"type":"pong"}')
	except Exception:
		if websocket in connected_clients:
			connected_clients.remove(websocket)


async def broadcast_completed_threats() -> None:
	group = "websocket_broadcaster"
	consumer = "broadcaster_1"
	await event_bus.create_consumer_group(THREAT_COMPLETE, group)
	while True:
		try:
			for entry_id, threat in await event_bus.consume(THREAT_COMPLETE, group, consumer, count=10, block_ms=500):
				message = json.dumps({"type": "threat.complete", **threat.model_dump(mode="json")})
				dead = []
				for client in connected_clients:
					try:
						await client.send_text(message)
					except Exception:
						dead.append(client)
				for client in dead:
					if client in connected_clients:
						connected_clients.remove(client)
				await event_bus.ack(THREAT_COMPLETE, group, entry_id)
		except asyncio.CancelledError:
			raise
		except Exception:
			await asyncio.sleep(1)
