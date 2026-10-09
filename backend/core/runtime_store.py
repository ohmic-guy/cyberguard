from __future__ import annotations

from collections.abc import Mapping
from typing import Any


_events: dict[str, dict[str, Any]] = {}


def save_event(event: Mapping[str, Any]) -> None:
	document = dict(event)
	event_id = str(document["event_id"])
	_events[event_id] = document


def get_event(event_id: str) -> dict[str, Any] | None:
	return _events.get(event_id)


def get_recent(limit: int = 20, skip: int = 0) -> list[dict[str, Any]]:
	events = sorted(_events.values(), key=lambda item: str(item.get("created_at", "")), reverse=True)
	return events[skip:skip + limit]


def get_metrics() -> dict[str, Any]:
	events = list(_events.values())
	risk_distribution: dict[str, int] = {}
	category_distribution: dict[str, int] = {}
	confidence_values: list[float] = []
	for event in events:
		risk = str(event.get("risk_level", "unknown"))
		category = str(event.get("category", "unknown"))
		risk_distribution[risk] = risk_distribution.get(risk, 0) + 1
		category_distribution[category] = category_distribution.get(category, 0) + 1
		if isinstance(event.get("confidence"), (int, float)):
			confidence_values.append(float(event["confidence"]))
	return {
		"total_events": len(events),
		"critical_threats": risk_distribution.get("critical", 0),
		"high_threats": risk_distribution.get("high", 0),
		"medium_threats": risk_distribution.get("medium", 0),
		"safe_or_low": risk_distribution.get("safe", 0) + risk_distribution.get("low", 0),
		"avg_confidence": sum(confidence_values) / len(confidence_values) if confidence_values else 0.0,
		"processing_rate": 0,
		"active_agents": 8,
		"category_distribution": category_distribution,
		"risk_distribution": risk_distribution,
	}