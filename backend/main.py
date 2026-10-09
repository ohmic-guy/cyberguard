from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from collections.abc import Awaitable, Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.health import router as health_router
from .api.routes.auth import router as auth_router
from .api.routes.demo import router as demo_router
from .api.routes.dashboard import router as dashboard_router
from .api.routes.stream import router as stream_router
from .api.routes.threats import router as threats_router
from .api.routes.upload import router as upload_router
from .api.websocket import broadcast_completed_threats, websocket_endpoint
from .core.container import api_abuse_agent, deepfake_agent, log_agent, orchestrator, phishing_agent, response_agent, scoring_agent
from .core.events.event_bus import event_bus
from .core.events.streams import API_ABUSE_INPUT, DEEPFAKE_INPUT, LOG_INPUT, PHISHING_INPUT, RAW_INPUT, THREAT_DETECTED, THREAT_SCORED, THREAT_ESCALATED
from .db.mongodb import check_mongodb, close_db, connect_db, create_indexes, get_db
from .db.repositories.threat_repository import ThreatRepository


async def run_agent(agent: object, stream: str) -> None:
    process: Callable[..., Awaitable[object]] = agent.process  # type: ignore[attr-defined]
    consumer = agent.__class__.__name__.lower()  # type: ignore[attr-defined]
    group = "cyberguard"
    await event_bus.create_consumer_group(stream, group)
    while True:
        try:
            entries = await event_bus.consume(stream, group, consumer, count=5, block_ms=0, start_id="0")
            if not entries:
                entries = await event_bus.consume(stream, group, consumer, count=5, block_ms=1000, start_id=">")
            for entry_id, event in entries:
                await process(event)
                await event_bus.ack(stream, group, entry_id)
        except asyncio.CancelledError:
            raise
        except Exception as error:
            if "Timeout reading from" not in str(error):
                print(f"[{consumer}] Error: {error}")
                with open("C:/Users/omkar/.gemini/antigravity-ide/brain/3debf90c-5853-4c91-8548-2be2e36583c2/scratch/agent_errors.log", "a") as f:
                    import traceback
                    f.write(f"[{consumer}] Error: {traceback.format_exc()}\n")
            await asyncio.sleep(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await event_bus.connect()
    try:
        await connect_db()
        await create_indexes()
        if await check_mongodb() == "ok":
            response_agent.attach_repository(ThreatRepository(get_db()))
    except Exception as error:
        print(f"[mongodb] Startup check failed: {error}")

    tasks = [
        asyncio.create_task(run_agent(orchestrator, RAW_INPUT)),
        asyncio.create_task(run_agent(phishing_agent, PHISHING_INPUT)),
        asyncio.create_task(run_agent(deepfake_agent, DEEPFAKE_INPUT)),
        asyncio.create_task(run_agent(log_agent, LOG_INPUT)),
        asyncio.create_task(run_agent(api_abuse_agent, API_ABUSE_INPUT)),
        asyncio.create_task(run_agent(scoring_agent, THREAT_DETECTED)),
        asyncio.create_task(run_agent(response_agent, THREAT_SCORED)),
        asyncio.create_task(run_agent(response_agent, THREAT_ESCALATED)),
        asyncio.create_task(broadcast_completed_threats()),
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
app.include_router(auth_router)
app.include_router(demo_router)
app.include_router(dashboard_router)
app.include_router(upload_router)
app.include_router(threats_router)
app.include_router(stream_router)
app.add_api_websocket_route("/ws/threats", websocket_endpoint)
