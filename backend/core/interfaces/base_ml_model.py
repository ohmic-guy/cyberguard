from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TypeAlias


ModelInput: TypeAlias = dict[str, object]
ModelPrediction: TypeAlias = dict[str, object]


class BaseMLModel(ABC):
    @abstractmethod
    async def load(self) -> None:
        """Load model resources required for inference."""

    @abstractmethod
    async def predict(self, input_data: ModelInput) -> ModelPrediction:
        """Run inference and return a model-specific prediction payload."""

    @abstractmethod
    def is_loaded(self) -> bool:
        """Return whether the model is ready for inference."""

    @abstractmethod
    def model_name(self) -> str:
        """Return a stable model identifier for observability."""
