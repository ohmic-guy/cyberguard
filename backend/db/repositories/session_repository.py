from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


class SessionRepository:
	def __init__(self, database: AsyncIOMotorDatabase) -> None:
		self._collection = database.sessions

	async def save(self, session: Mapping[str, Any]) -> None:
		document = dict(session)
		await self._collection.replace_one(
			{"session_id": document["session_id"]}, document, upsert=True
		)

	async def get_by_id(self, session_id: str) -> dict[str, Any] | None:
		return await self._collection.find_one({"session_id": session_id}, {"_id": 0})
