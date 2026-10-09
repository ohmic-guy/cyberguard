from __future__ import annotations

from datetime import datetime, timezone

from agentscope.message import Msg

from ...core.events.event_bus import EventBus
from ...core.events.event_types import EventStatus, ThreatCategory, ThreatEvent
from ...core.events.streams import LOG_INPUT, THREAT_DETECTED, THREAT_ESCALATED
from ...core.interfaces.base_agent import BaseCyberAgent
from ...core.interfaces.base_detector import BaseDetector


class ApiAbuseAgent(BaseCyberAgent):
	def __init__(self, detector: BaseDetector, event_bus: EventBus) -> None:
		self._detector = detector
		self._event_bus = event_bus

	def reply(self, x: Msg | None = None) -> Msg:
		if x is None:
			raise ValueError("ApiAbuseAgent.reply requires an AgentScope message")
		return x

	def subscribes_to(self) -> list[str]:
		return [LOG_INPUT]

	def emits_to(self) -> list[str]:
		return [THREAT_DETECTED, THREAT_ESCALATED]

	async def process(self, event: ThreatEvent) -> ThreatEvent:
		try:
			result = await self._detector.detect(event.payload)
			detected = event.model_copy(update={
				"category": ThreatCategory.API_ABUSE,
				"status": EventStatus.PROCESSING,
				"label": result.label,
				"confidence": result.confidence,
				"indicators": result.indicators,
				"updated_at": datetime.now(timezone.utc),
			})
			await self._event_bus.publish(THREAT_DETECTED, detected)
			return detected
		except Exception as error:
			escalated = event.model_copy(update={
				"category": ThreatCategory.API_ABUSE,
				"status": EventStatus.ESCALATED,
				"error_message": str(error),
				"failed_agent": self.__class__.__name__,
				"updated_at": datetime.now(timezone.utc),
			})
			await self._event_bus.publish(THREAT_ESCALATED, escalated)
			return escalated
