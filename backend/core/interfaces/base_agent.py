from __future__ import annotations

from abc import ABC, ABCMeta, abstractmethod

from agentscope.agent import AgentBase
from agentscope.message import Msg


class CyberAgentMeta(type(AgentBase), ABCMeta):
    """Metaclass bridge for AgentScope agents with abstract methods."""


class BaseCyberAgent(AgentBase, ABC, metaclass=CyberAgentMeta):
    """Base AgentScope contract for all CyberGuard agents."""

    @abstractmethod
    def reply(self, x: Msg | None = None) -> Msg:
        """AgentScope entry point. Heavy work should run in async tasks."""

    @abstractmethod
    def subscribes_to(self) -> list[str]:
        """Redis stream keys this agent consumes."""

    @abstractmethod
    def emits_to(self) -> list[str]:
        """Redis stream keys this agent publishes to."""
