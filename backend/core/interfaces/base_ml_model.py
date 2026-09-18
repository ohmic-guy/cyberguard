from abc import ABC, abstractmethod


class BaseMLModel(ABC):
    @abstractmethod
    async def load(self) -> None:
        """Load model resources required for inference."""

    @abstractmethod
    async def predict(self, input_data: dict) -> dict:
        """Run inference and return a model-specific prediction payload."""

    @abstractmethod
    def is_loaded(self) -> bool:
        """Return whether the model is ready for inference."""

    @abstractmethod
    def model_name(self) -> str:
        """Return a stable model identifier for observability."""
