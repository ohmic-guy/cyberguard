from abc import ABC, abstractmethod
from agentscope.agents import AgentBase
from agentscope.message import Msg

class BaseCyberAgent(AgentBase, ABC):
    @abstractmethod
    def reply(self, x: Msg | None = None) -> Msg:
        pass

    @abstractmethod
    def subscribes_to(self) -> list[str]:
        pass

    @abstractmethod
    def emits_to(self) -> list[str]:
        pass
