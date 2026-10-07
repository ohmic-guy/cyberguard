from __future__ import annotations

from ..core.events.event_types import RiskLevel, ThreatEvent
from ..core.interfaces.base_scorer import BaseScorer


class ThreatScorer(BaseScorer):
	"""Convert detector evidence into a normalized risk level and score."""

	def score(self, event: ThreatEvent) -> tuple[RiskLevel, float]:
		confidence = event.confidence or 0.0
		label = (event.label or "").strip().lower()
		suspicious = label not in {"", "0", "safe", "benign", "normal", "legitimate"}
		indicator_score = min(len(event.indicators) * 0.05, 0.25)
		value = confidence + indicator_score if suspicious else confidence * 0.25
		value = round(min(max(value, 0.0), 1.0), 4)

		if value >= 0.85:
			level = RiskLevel.CRITICAL
		elif value >= 0.65:
			level = RiskLevel.HIGH
		elif value >= 0.4:
			level = RiskLevel.MEDIUM
		elif value >= 0.2:
			level = RiskLevel.LOW
		else:
			level = RiskLevel.SAFE
		return level, value

	def explain_score(self, event: ThreatEvent) -> list[str]:
		factors = [f"Detector confidence: {event.confidence or 0.0:.0%}"]
		if event.label:
			factors.append(f"Detector label: {event.label}")
		if event.indicators:
			factors.append(f"{len(event.indicators)} indicator(s) reported")
		return factors
