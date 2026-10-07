from __future__ import annotations

from abc import ABC, abstractmethod

from ..events.event_types import RiskLevel, ThreatEvent


class BaseScorer(ABC):
    @abstractmethod
    def score(self, event: ThreatEvent) -> tuple[RiskLevel, float]:
        """Calculate the event risk level and numeric score."""

    @abstractmethod
    def explain_score(self, event: ThreatEvent) -> list[str]:
        """Return human-readable factors that contributed to the score."""
