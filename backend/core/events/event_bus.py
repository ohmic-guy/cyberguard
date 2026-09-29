import redis.asyncio as aioredis
from core.events.event_types import ThreatEvent
from config import settings


class EventBus:
    """Agents never import redis directly. They use this class."""

    def __init__(self) -> None:
        self._redis: aioredis.Redis | None = None

    async def connect(self) -> None:
        self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self) -> None:
        if self._redis:
            await self._redis.close()
            self._redis = None

    async def publish(self, stream: str, event: ThreatEvent) -> str:
        if self._redis is None:
            raise RuntimeError("EventBus is not connected to Redis. Call connect() first.")
        entry_id = await self._redis.xadd(stream, {"data": event.model_dump_json()})
        return str(entry_id)

    async def consume(
        self, stream: str, group: str, consumer: str, count: int = 10, block_ms: int = 0
    ) -> list[tuple[str, ThreatEvent]]:
        if self._redis is None:
            raise RuntimeError("EventBus is not connected to Redis. Call connect() first.")
        entries = await self._redis.xreadgroup(
            groupname=group,
            consumername=consumer,
            streams={stream: ">"},
            count=count,
            block=block_ms,
        )
        results: list[tuple[str, ThreatEvent]] = []
        for _, messages in entries:
            for entry_id, data in messages:
                event = ThreatEvent.model_validate_json(data["data"])
                results.append((entry_id, event))
        return results

    async def ack(self, stream: str, group: str, entry_id: str) -> None:
        if self._redis is None:
            raise RuntimeError("EventBus is not connected to Redis. Call connect() first.")
        await self._redis.xack(stream, group, entry_id)

    async def create_consumer_group(self, stream: str, group: str) -> None:
        if self._redis is None:
            raise RuntimeError("EventBus is not connected to Redis. Call connect() first.")
        try:
            await self._redis.xgroup_create(stream, group, id="0", mkstream=True)
        except aioredis.ResponseError:
            pass  # Group already exists — safe to ignore


event_bus = EventBus()  # Singleton
