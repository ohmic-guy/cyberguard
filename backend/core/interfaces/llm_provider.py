from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TypeAlias


LLMContext: TypeAlias = dict[str, object]

class LLMProvider(ABC):
    @abstractmethod
    async def explain(self, context: LLMContext) -> str:
        """Generate a concise explanation for a threat event."""

    @abstractmethod
    async def recommend(self, threat: LLMContext) -> list[str]:
        """Generate recommended response actions for a threat event."""

    @abstractmethod
    async def map_to_mitre(self, threat: LLMContext) -> list[str]:
        """Map a threat event to MITRE ATT&CK technique identifiers."""
