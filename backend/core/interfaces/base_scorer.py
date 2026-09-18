from abc import ABC, abstractmethod
from core.events.event_types import ThreatEvent, RiskLevel

class BaseScorer(ABC):
    @abstractmethod
    def score(self, event: ThreatEvent) -> tuple[RiskLevel, float]:
        pass

    @abstractmethod
    def explain_score(self, event: ThreatEvent) -> list[str]:
        pass
