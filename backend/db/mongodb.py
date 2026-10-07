from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from ..config import settings

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_db() -> AsyncIOMotorDatabase:
	global _client, _database
	if _database is None:
		_client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1000)
		_database = _client[settings.MONGODB_DB]
		await _client.admin.command("ping")
	return _database


def get_db() -> AsyncIOMotorDatabase:
	if _database is None:
		raise RuntimeError("MongoDB is not connected. Call connect_db() during startup.")
	return _database


async def check_mongodb() -> str:
	try:
		database = await connect_db()
		await database.command("ping")
		return "ok"
	except Exception:
		return "unavailable"


async def create_indexes() -> None:
	if _database is None:
		return
	await _database.threats.create_index("created_at")
	await _database.threats.create_index("event_id", unique=True)


async def close_db() -> None:
	global _client, _database
	if _client is not None:
		_client.close()
	_client = None
	_database = None
