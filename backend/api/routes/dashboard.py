from typing import Any
from fastapi import APIRouter, Depends
from api.routes.auth import get_current_user
from db.repositories.threat_repository import threat_repository

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Returns aggregated counts, category & risk breakdowns, timeline, and top targets strictly adhering to Section 11 schema."""
    stats = await threat_repository.get_dashboard_stats()
    return stats
