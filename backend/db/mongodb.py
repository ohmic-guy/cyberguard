from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings


class MongoDB:
    """Async Motor MongoDB client holder and index manager."""

    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB]
        await create_indexes(self.db)

    async def close(self) -> None:
        if self.client:
            self.client.close()
            self.client = None
            self.db = None


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    """Run index creation at backend startup per Section 10."""
    await db.threats.create_index("event_id", unique=True)
    await db.threats.create_index([("created_at", -1)])
    await db.threats.create_index("risk_level")
    await db.threats.create_index("category")
    await db.threats.create_index("status")
    await db.threats.create_index([("risk_level", 1), ("created_at", -1)])

    # TTL indexes
    await db.sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.escalations.create_index("created_at", expireAfterSeconds=604800)


mongodb = MongoDB()
