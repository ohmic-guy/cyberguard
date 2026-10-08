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

	async def get_metrics(self) -> dict[str, Any]:
		stats = await self.get_stats()
		
		confidence_row = await self._collection.aggregate([
			{"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence"}}}
		]).to_list(length=1)
		avg_confidence = confidence_row[0].get("avg_confidence") if confidence_row else 0.0
		if avg_confidence is None:
			avg_confidence = 0.0

		risk_dist = stats.get("by_risk_level", {})

		return {
			"total_events": stats.get("total_events", 0),
			"critical_threats": risk_dist.get("critical", 0),
			"high_threats": risk_dist.get("high", 0),
			"medium_threats": risk_dist.get("medium", 0),
			"safe_or_low": risk_dist.get("safe", 0) + risk_dist.get("low", 0),
			"avg_confidence": avg_confidence,
			"processing_rate": 120,
			"active_agents": 6,
			"category_distribution": stats.get("by_category", {}),
			"risk_distribution": risk_dist,
		}
