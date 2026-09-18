from abc import ABC, abstractmethod

class BaseMLModel(ABC):
    @abstractmethod
    async def load(self) -> None:
        pass

    @abstractmethod
    async def predict(self, input_data: dict) -> dict:
        pass

    @abstractmethod
    def is_loaded(self) -> bool:
        pass

    @abstractmethod
    def model_name(self) -> str:
        pass
