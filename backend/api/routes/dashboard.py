from fastapi import APIRouter, Depends

from ...db.mongodb import get_db
from ...db.repositories.threat_repository import ThreatRepository
from ...core.runtime_store import get_metrics
from .auth import require_user

router = APIRouter()


@router.get("/api/v1/dashboard/stats")
async def dashboard_stats() -> dict:
	try:
		return await ThreatRepository(get_db()).get_stats()
	except Exception:
		metrics = get_metrics()
		return {
			"total_events": metrics["total_events"],
			"threats_detected": metrics["total_events"] - metrics["safe_or_low"],
			"by_category": metrics["category_distribution"],
			"by_risk_level": metrics["risk_distribution"],
		}


@router.get("/api/v1/dashboard/metrics")
async def dashboard_metrics() -> dict:
	try:
		return await ThreatRepository(get_db()).get_metrics()
	except Exception:
		return get_metrics()
