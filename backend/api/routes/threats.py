from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from api.routes.auth import get_current_user
from core.events.event_types import RiskLevel, ThreatCategory
from db.repositories.threat_repository import threat_repository

router = APIRouter(prefix="/api/v1/threats", tags=["threats"])


@router.get("")
async def get_threats(
    risk_level: RiskLevel | str | None = Query(default=None, description="Filter by risk level"),
    category: ThreatCategory | str | None = Query(default=None, description="Filter by threat category"),
    date_from: datetime | None = Query(default=None, description="Filter from ISO timestamp"),
    date_to: datetime | None = Query(default=None, description="Filter to ISO timestamp"),
    limit: int = Query(default=50, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Paginated list query against MongoDB threats collection with risk_level, category, and date range filters."""
    threats, total_count = await threat_repository.query_threats(
        risk_level=risk_level,
        category=category,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        skip=skip,
    )
    return {
        "threats": threats,
        "total": total_count,
        "limit": limit,
        "skip": skip,
    }


@router.get("/{event_id}")
async def get_threat_by_id(
    event_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Fetches a single complete ThreatEvent document by event_id."""
    threat = await threat_repository.get_threat_by_id(event_id)
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Threat event with ID '{event_id}' not found",
        )
    return threat
