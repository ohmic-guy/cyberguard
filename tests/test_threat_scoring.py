from backend.core.events.event_types import InputModality, RiskLevel, ThreatEvent
from backend.scoring.threat_scorer import ThreatScorer


def make_event(label: str, confidence: float, indicators: list[str]) -> ThreatEvent:
	return ThreatEvent(
		modality=InputModality.URL,
		source="test",
		payload={},
		label=label,
		confidence=confidence,
		indicators=indicators,
	)


def test_scorer_marks_safe_detector_result_low() -> None:
	level, score = ThreatScorer().score(make_event("safe", 0.9, []))

	assert level is RiskLevel.LOW
	assert score == 0.225


def test_scorer_adds_indicator_evidence_to_high_confidence_threat() -> None:
	level, score = ThreatScorer().score(make_event("phishing", 0.7, ["spoofed domain", "urgent request"]))

	assert level is RiskLevel.HIGH
	assert score == 0.8


def test_scorer_caps_critical_score_at_one() -> None:
	level, score = ThreatScorer().score(make_event("deepfake", 1.0, ["artifact"] * 10))

	assert level is RiskLevel.CRITICAL
	assert score == 1.0