from __future__ import annotations

from abc import ABC, abstractmethod

from pydantic import BaseModel, ConfigDict, Field

from ..events.event_types import EventMetadata, EventPayload, InputModality, ThreatCategory
from .base_ml_model import BaseMLModel


class DetectionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    category: ThreatCategory = ThreatCategory.UNKNOWN
    indicators: list[str] = Field(default_factory=list)
    metadata: EventMetadata = Field(default_factory=dict)


class BaseDetector(ABC):
    def __init__(self, model: BaseMLModel) -> None:
        self._model = model

    @abstractmethod
    async def detect(self, payload: EventPayload) -> DetectionResult:
        """Detect threats in the supplied event payload."""

    @abstractmethod
    def input_type(self) -> InputModality:
        """Return the input modality supported by this detector."""
