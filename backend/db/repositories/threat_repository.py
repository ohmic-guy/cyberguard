from datetime import datetime, timezone
from typing import Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.events.event_types import ThreatEvent, RiskLevel, ThreatCategory, EventStatus
from db.mongodb import mongodb


class ThreatRepository:
    """Async repository for MongoDB threats and escalations collections."""

    def __init__(self, db: AsyncIOMotorDatabase | None = None) -> None:
        self._db_override = db

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db_override is not None:
            return self._db_override
        if mongodb.db is None:
            raise RuntimeError("MongoDB connection is not initialized. Call mongodb.connect() first.")
        return mongodb.db

    async def save_threat(self, event: ThreatEvent) -> None:
        """Persist or update a completed ThreatEvent in the threats collection."""
        doc = event.model_dump(mode="json")
        await self.db.threats.replace_one(
            {"event_id": event.event_id},
            doc,
            upsert=True,
        )

    async def save_escalation(self, event: ThreatEvent) -> None:
        """Persist an escalated ThreatEvent in the escalations collection."""
        doc = event.model_dump(mode="json")
        await self.db.escalations.replace_one(
            {"event_id": event.event_id},
            doc,
            upsert=True,
        )

    async def get_threat_by_id(self, event_id: str) -> dict[str, Any] | None:
        """Retrieve a single threat event document by event_id."""
        doc = await self.db.threats.find_one({"event_id": event_id})
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def query_threats(
        self,
        risk_level: RiskLevel | str | None = None,
        category: ThreatCategory | str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        limit: int = 50,
        skip: int = 0,
    ) -> tuple[list[dict[str, Any]], int]:
        """Query paginated threat documents with filters."""
        query: dict[str, Any] = {}

        if risk_level:
            val = risk_level.value if isinstance(risk_level, RiskLevel) else risk_level
            query["risk_level"] = val

        if category:
            val = category.value if isinstance(category, ThreatCategory) else category
            query["category"] = val

        if date_from or date_to:
            date_filter: dict[str, Any] = {}
            if date_from:
                date_filter["$gte"] = date_from.isoformat() if isinstance(date_from, datetime) else date_from
            if date_to:
                date_filter["$lte"] = date_to.isoformat() if isinstance(date_to, datetime) else date_to
            query["created_at"] = date_filter

        total_count = await self.db.threats.count_documents(query)
        cursor = self.db.threats.find(query).sort("created_at", -1).skip(skip).limit(limit)

        results: list[dict[str, Any]] = []
        async for doc in cursor:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            results.append(doc)

        return results, total_count

    async def get_dashboard_stats(self) -> dict[str, Any]:
        """Compute aggregated statistics strictly matching Section 11 schema."""
        total_events = await self.db.threats.count_documents({})
        safe_events = await self.db.threats.count_documents({"risk_level": RiskLevel.SAFE.value})
        threats_detected = total_events - safe_events

        # Category aggregation
        by_category = {
            ThreatCategory.PHISHING.value: 0,
            ThreatCategory.DEEPFAKE.value: 0,
            ThreatCategory.LOG_ANOMALY.value: 0,
            ThreatCategory.API_ABUSE.value: 0,
        }
        category_pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
        async for cat_stat in self.db.threats.aggregate(category_pipeline):
            cat_name = cat_stat.get("_id")
            if cat_name in by_category:
                by_category[cat_name] = cat_stat.get("count", 0)

        # Risk level aggregation
        by_risk_level = {
            RiskLevel.CRITICAL.value: 0,
            RiskLevel.HIGH.value: 0,
            RiskLevel.MEDIUM.value: 0,
            RiskLevel.LOW.value: 0,
            RiskLevel.SAFE.value: 0,
        }
        risk_pipeline = [{"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}]
        async for risk_stat in self.db.threats.aggregate(risk_pipeline):
            risk_name = risk_stat.get("_id")
            if risk_name in by_risk_level:
                by_risk_level[risk_name] = risk_stat.get("count", 0)

        # Attack timeline (hourly bucket)
        timeline_pipeline = [
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%dT%H:00:00Z",
                            "date": {"$dateFromString": {"dateString": "$created_at"}},
                        }
                    },
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"_id": 1}},
            {"$limit": 24},
        ]
        attack_timeline: list[dict[str, Any]] = []
        try:
            async for item in self.db.threats.aggregate(timeline_pipeline):
                if item.get("_id"):
                    attack_timeline.append({"timestamp": item["_id"], "count": item["count"]})
        except Exception:
            # Fallback if created_at strings aren't iso dates in old data
            cursor = self.db.threats.find({}).sort("created_at", -1).limit(10)
            async for doc in cursor:
                ts = doc.get("created_at", datetime.now(timezone.utc).isoformat())
                attack_timeline.append({"timestamp": str(ts), "count": 1})

        # Frequently targeted (extracted from payload targets or default fallback)
        frequently_targeted_set: set[str] = set()
        recent_cursor = self.db.threats.find({}).sort("created_at", -1).limit(50)
        async for doc in recent_cursor:
            payload = doc.get("payload", {})
            if isinstance(payload, dict):
                target = payload.get("target") or payload.get("recipient") or payload.get("user")
                if target and isinstance(target, str):
                    frequently_targeted_set.add(target)
        
        frequently_targeted = list(frequently_targeted_set)[:5]
        if not frequently_targeted:
            frequently_targeted = ["admin@org.com", "finance-portal", "login-page"]

        # Recent 5 threats
        recent_threats: list[dict[str, Any]] = []
        recent_cursor5 = self.db.threats.find({}).sort("created_at", -1).limit(5)
        async for doc in recent_cursor5:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            recent_threats.append(doc)

        return {
            "total_events": total_events,
            "threats_detected": max(0, threats_detected),
            "safe_events": safe_events,
            "by_category": by_category,
            "by_risk_level": by_risk_level,
            "attack_timeline": attack_timeline,
            "frequently_targeted": frequently_targeted,
            "recent_threats": recent_threats,
        }


threat_repository = ThreatRepository()
