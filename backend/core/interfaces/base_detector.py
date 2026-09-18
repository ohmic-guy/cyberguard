from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from .base_ml_model import BaseMLModel


@dataclass
class DetectionResult:
    label: str
    confidence: float
    indicators: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0 and 1")


class BaseDetector(ABC):
    def __init__(self, model: BaseMLModel) -> None:
        self._model = model

    @abstractmethod
    async def detect(self, payload: dict) -> DetectionResult:
        """Detect threats in the supplied event payload."""

    @abstractmethod
    def input_type(self) -> str:
        """Return the input modality supported by this detector."""
