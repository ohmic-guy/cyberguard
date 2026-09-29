import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.auth import router as auth_router
from api.routes.dashboard import router as dashboard_router
from api.routes.stream import router as stream_router
from api.routes.threats import router as threats_router
from api.routes.upload import router as upload_router
from api.websocket import broadcast_stream_listener, router as websocket_router
from core.events.event_bus import event_bus
from db.mongodb import mongodb


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for event bus connection, MongoDB setup, and background tasks."""
    # Startup
    try:
        await event_bus.connect()
    except Exception as exc:
        print(f"[Warning] Redis connection failed on startup: {exc}")

    try:
        await mongodb.connect()
    except Exception as exc:
        print(f"[Warning] MongoDB connection failed on startup: {exc}")

    # Launch WebSocket stream listener background task
    listener_task = asyncio.create_task(broadcast_stream_listener())

    yield

    # Shutdown
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        pass

    await event_bus.disconnect()
    await mongodb.close()


app = FastAPI(
    title="CyberGuard API",
    description="Agentic AI Cybersecurity Platform REST & WebSocket API",
    version="3.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(stream_router)
app.include_router(threats_router)
app.include_router(dashboard_router)
app.include_router(websocket_router)


@app.get("/api/v1/health", tags=["health"])
async def health_check() -> dict[str, Any]:
    """Public health check endpoint reporting status of Redis, MongoDB, and system time."""
    redis_connected = event_bus._redis is not None
    mongo_connected = mongodb.client is not None and mongodb.db is not None

    overall_status = "ok" if (redis_connected and mongo_connected) else "degraded"

    return {
        "status": overall_status,
        "redis": "connected" if redis_connected else "disconnected",
        "mongodb": "connected" if mongo_connected else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
