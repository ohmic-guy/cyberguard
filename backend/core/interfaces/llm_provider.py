from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Mapping

from ..events.event_types import ThreatEvent


class LLMProvider(ABC):
    @abstractmethod
    async def explain(self, context: Mapping[str, object]) -> str:
        """Generate a concise explanation for a threat event."""

    @abstractmethod
    async def recommend(self, threat: ThreatEvent) -> list[str]:
        """Generate recommended response actions for a threat event."""

    @abstractmethod
    async def map_to_mitre(self, threat: ThreatEvent) -> list[str]:
        """Map a threat event to MITRE ATT&CK technique identifiers."""
