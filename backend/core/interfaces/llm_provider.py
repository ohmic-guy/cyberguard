from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    async def explain(self, context: dict) -> str:
        pass

    @abstractmethod
    async def recommend(self, threat: dict) -> list[str]:
        pass

    @abstractmethod
    async def map_to_mitre(self, threat: dict) -> list[str]:
        pass
