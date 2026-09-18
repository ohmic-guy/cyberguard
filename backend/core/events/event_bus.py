from __future__ import annotations

from collections.abc import Sequence

import redis.asyncio as aioredis

try:
    from ...config import settings
except ImportError:
    from config import settings

from .event_types import ThreatEvent
StreamKey = str
StreamEntry = tuple[str, ThreatEvent]


class EventBus:
    """Redis Streams wrapper used by agents through dependency injection."""

    def __init__(self) -> None:
        self._redis: aioredis.Redis | None = None

    async def connect(self) -> None:
        self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async def publish(self, stream: StreamKey, event: ThreatEvent) -> str:
        redis = self._require_redis()
        return await redis.xadd(self._stream_value(stream), {"data": event.model_dump_json()})

    async def consume(
        self,
        stream: StreamKey,
        group: str,
        consumer: str,
        count: int = 10,
        block_ms: int = 0,
    ) -> list[StreamEntry]:
        redis = self._require_redis()
        entries = await redis.xreadgroup(
            groupname=group,
            consumername=consumer,
            streams={self._stream_value(stream): ">"},
            count=count,
            block=block_ms,
        )
        return self._parse_entries(entries)

    async def ack(self, stream: StreamKey, group: str, entry_id: str) -> None:
        redis = self._require_redis()
        await redis.xack(self._stream_value(stream), group, entry_id)

    async def create_consumer_group(self, stream: StreamKey, group: str) -> None:
        redis = self._require_redis()
        try:
            await redis.xgroup_create(self._stream_value(stream), group, id="0", mkstream=True)
        except aioredis.ResponseError:
            return

    def _require_redis(self) -> aioredis.Redis:
        if self._redis is None:
            raise RuntimeError("EventBus is not connected. Call connect() before use.")
        return self._redis

    @staticmethod
    def _stream_value(stream: StreamKey) -> str:
        return stream

    @staticmethod
    def _parse_entries(entries: Sequence[tuple[str, list[tuple[str, dict[str, str]]]]]) -> list[StreamEntry]:
        results: list[StreamEntry] = []
        for _, messages in entries:
            for entry_id, data in messages:
                event = ThreatEvent.model_validate_json(data["data"])
                results.append((entry_id, event))
        return results


event_bus = EventBus()
