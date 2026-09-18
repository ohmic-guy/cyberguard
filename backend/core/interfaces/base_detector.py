from abc import ABC, abstractmethod
from dataclasses import dataclass, field

@dataclass
class DetectionResult:
    label:      str
    confidence: float
    indicators: list[str] = field(default_factory=list)
    metadata:   dict      = field(default_factory=dict)

class BaseDetector(ABC):
    def __init__(self, model) -> None:
        self._model = model

    @abstractmethod
    async def detect(self, payload: dict) -> DetectionResult:
        pass

    @abstractmethod
    def input_type(self) -> str:
        pass
