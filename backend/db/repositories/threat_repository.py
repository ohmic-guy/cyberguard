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

	async def get_by_event_id(self, event_id: str) -> dict[str, Any] | None:
		return await self._collection.find_one({"event_id": event_id}, {"_id": 0})

	async def get_stats(self) -> dict[str, Any]:
		total_events = await self._collection.count_documents({})
		threats_detected = await self._collection.count_documents({"label": {"$nin": [None, "safe", "normal"]}})
		category_rows = await self._collection.aggregate([
			{"$group": {"_id": "$category", "count": {"$sum": 1}}},
		]).to_list(length=None)
		risk_rows = await self._collection.aggregate([
			{"$group": {"_id": "$risk_level", "count": {"$sum": 1}}},
		]).to_list(length=None)
		return {
			"total_events": total_events,
			"threats_detected": threats_detected,
			"by_category": {row["_id"]: row["count"] for row in category_rows if row["_id"]},
			"by_risk_level": {row["_id"]: row["count"] for row in risk_rows if row["_id"]},
		}
