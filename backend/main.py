from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from collections.abc import Awaitable, Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.health import router as health_router
from .api.routes.threats import router as threats_router
from .api.routes.upload import router as upload_router
from .core.container import orchestrator, phishing_agent, scoring_agent
from .core.events.event_bus import event_bus
from .core.events.streams import PHISHING_INPUT, RAW_INPUT, THREAT_DETECTED
from .db.mongodb import close_db, connect_db, create_indexes


async def run_agent(agent: object, stream: str) -> None:
    process: Callable[..., Awaitable[object]] = agent.process  # type: ignore[attr-defined]
    consumer = agent.__class__.__name__.lower()  # type: ignore[attr-defined]
    group = "cyberguard"
    await event_bus.create_consumer_group(stream, group)
    while True:
        try:
            for entry_id, event in await event_bus.consume(stream, group, consumer, count=5, block_ms=1000):
                await process(event)
                await event_bus.ack(stream, group, entry_id)
        except asyncio.CancelledError:
            raise
        except Exception as error:
            print(f"[{consumer}] Error: {error}")
            await asyncio.sleep(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await event_bus.connect()
    try:
        await connect_db()
        await create_indexes()
    except Exception as error:
        print(f"[mongodb] Startup check failed: {error}")

    tasks = [
        asyncio.create_task(run_agent(orchestrator, RAW_INPUT)),
        asyncio.create_task(run_agent(phishing_agent, PHISHING_INPUT)),
        asyncio.create_task(run_agent(scoring_agent, THREAT_DETECTED)),
    ]
    try:
        yield
    finally:
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        await event_bus.close()
        await close_db()


app = FastAPI(title="CyberGuard API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(upload_router)
app.include_router(threats_router)
