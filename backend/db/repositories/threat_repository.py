from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


class ThreatRepository:
	def __init__(self, database: AsyncIOMotorDatabase) -> None:
		self._collection = database.threats

	async def save(self, threat: Mapping[str, Any]) -> None:
		document = dict(threat)
		await self._collection.replace_one(
			{"event_id": document["event_id"]}, document, upsert=True
		)

	async def get_recent(self, limit: int = 20, skip: int = 0) -> list[dict[str, Any]]:
		cursor = self._collection.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
		return await cursor.to_list(length=limit)
