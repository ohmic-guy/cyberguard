from __future__ import annotations

from datetime import datetime, timezone

from agentscope.message import Msg

from ..core.events.event_bus import EventBus
from ..core.events.event_types import EventStatus, ThreatEvent
from ..core.events.streams import THREAT_COMPLETE, THREAT_ESCALATED, THREAT_SCORED
from ..core.interfaces.base_agent import BaseCyberAgent
from ..core.interfaces.llm_provider import LLMProvider
from ..core.runtime_store import save_event
from ..db.repositories.threat_repository import ThreatRepository


class ResponseAgent(BaseCyberAgent):
	def __init__(self, bus: EventBus, llm: LLMProvider, repository: ThreatRepository | None = None) -> None:
		self._event_bus = bus
		self._llm = llm
		self._repository = repository

	def reply(self, x: Msg | None = None) -> Msg:
		if x is None:
			raise ValueError("ResponseAgent.reply requires an AgentScope message")
		return x

	def subscribes_to(self) -> list[str]:
		return [THREAT_SCORED, THREAT_ESCALATED]

	def emits_to(self) -> list[str]:
		return [THREAT_COMPLETE, THREAT_ESCALATED]

	def attach_repository(self, repository: ThreatRepository) -> None:
		self._repository = repository

	async def process(self, event: ThreatEvent) -> ThreatEvent:
		try:
			if event.status == EventStatus.ESCALATED:
				save_event(event.model_dump(mode="json"))
				if self._repository is not None:
					await self._repository.save(event.model_dump(mode="json"))
				return event

			context = event.model_dump(mode="json")
			completed = event.model_copy(update={
				"status": EventStatus.COMPLETE,
				"explanation": await self._llm.explain(context),
				"recommended_actions": await self._llm.recommend(event),
				"mitre_mapping": await self._llm.map_to_mitre(event),
				"updated_at": datetime.now(timezone.utc),
			})
			save_event(completed.model_dump(mode="json"))
			if self._repository is not None:
				await self._repository.save(completed.model_dump(mode="json"))
			await self._event_bus.publish(THREAT_COMPLETE, completed)
			return completed
		except Exception as error:
			escalated = event.model_copy(update={
				"status": EventStatus.ESCALATED,
				"error_message": str(error),
				"failed_agent": self.__class__.__name__,
				"updated_at": datetime.now(timezone.utc),
			})
			await self._event_bus.publish(THREAT_ESCALATED, escalated)
			return escalated
