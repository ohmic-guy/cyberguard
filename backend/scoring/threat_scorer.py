from core.interfaces.base_scorer import BaseScorer
from core.events.event_types import ThreatEvent, RiskLevel


class ThreatScorer(BaseScorer):
    """Calculates risk level and risk explanation factors based on detection confidence."""

    def score(self, event: ThreatEvent) -> tuple[RiskLevel, float]:
        """Calculates RiskLevel strictly according to Section 19 confidence thresholds.

        Thresholds:
        0.00 <= conf < 0.30 -> SAFE
        0.30 <= conf < 0.55 -> LOW
        0.55 <= conf < 0.75 -> MEDIUM
        0.75 <= conf < 0.90 -> HIGH
        0.90 <= conf <= 1.00 -> CRITICAL
        """
        confidence = event.confidence if event.confidence is not None else 0.0
        # Ensure confidence is clamped between 0.0 and 1.0
        conf = max(0.0, min(1.0, float(confidence)))

        if conf < 0.30:
            risk_level = RiskLevel.SAFE
        elif conf < 0.55:
            risk_level = RiskLevel.LOW
        elif conf < 0.75:
            risk_level = RiskLevel.MEDIUM
        elif conf < 0.90:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.CRITICAL

        return risk_level, conf

    def explain_score(self, event: ThreatEvent) -> list[str]:
        """Returns 3 to 5 human-readable driving factors detailing modality, thresholds, and indicators."""
        risk_level, conf = self.score(event)

        modality_str = event.modality.value if hasattr(event.modality, "value") else str(event.modality)
        category_str = event.category.value if hasattr(event.category, "value") else str(event.category)
        label_str = event.label if event.label else "unclassified"

        factors: list[str] = [
            f"Confidence score of {conf:.2f} evaluated against risk threshold {risk_level.value.upper()}",
            f"Input modality identified as '{modality_str}' under category '{category_str}'",
            f"Detection model assigned label '{label_str}'",
        ]

        if event.indicators and len(event.indicators) > 0:
            top_indicators = ", ".join(event.indicators[:3])
            factors.append(f"Top threat indicators: {top_indicators}")
        else:
            factors.append("No explicit behavioral flags raised by detector models")

        if risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            factors.append(f"Action required: Event confidence ({conf:.2f}) exceeds high risk tolerance boundary")
        else:
            factors.append(f"Monitoring notice: Event assessed within tolerable risk boundary ({risk_level.value})")

        return factors[:5]
