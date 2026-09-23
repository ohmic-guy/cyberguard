from __future__ import annotations

from datetime import datetime, timezone

from agentscope.message import Msg

from ...core.events.event_bus import EventBus
from ...core.events.event_types import EventStatus, InputModality, ThreatCategory, ThreatEvent
from ...core.events.streams import PHISHING_INPUT, THREAT_DETECTED, THREAT_ESCALATED
from ...core.interfaces.base_detector import BaseDetector
from ...core.interfaces.base_agent import BaseCyberAgent


class PhishingAgent(BaseCyberAgent):
	def __init__(self, detectors: dict[InputModality, BaseDetector], event_bus: EventBus) -> None:
		self._detectors = detectors
		self._event_bus = event_bus

	def reply(self, x: Msg | None = None) -> Msg:
		if x is None:
			raise ValueError("PhishingAgent.reply requires an AgentScope message")
		return x

	def subscribes_to(self) -> list[str]:
		return [PHISHING_INPUT]

	def emits_to(self) -> list[str]:
		return [THREAT_DETECTED, THREAT_ESCALATED]

	async def process(self, event: ThreatEvent) -> ThreatEvent:
		detector = self._detectors.get(event.modality)
		if detector is None:
			return await self._escalate(event, f"Unsupported phishing modality: {event.modality.value}")

		try:
			result = await detector.detect(event.payload)
			detected = event.model_copy(
				update={
					"category": ThreatCategory.PHISHING,
					"status": EventStatus.PROCESSING,
					"label": result.label,
					"confidence": result.confidence,
					"indicators": result.indicators,
					"updated_at": datetime.now(timezone.utc),
				},
			)
			await self._event_bus.publish(THREAT_DETECTED, detected)
			return detected
		except Exception as error:
			return await self._escalate(event, str(error))

	async def _escalate(self, event: ThreatEvent, message: str) -> ThreatEvent:
		escalated = event.model_copy(
			update={
				"category": ThreatCategory.PHISHING,
				"status": EventStatus.ESCALATED,
				"error_message": message,
				"failed_agent": self.__class__.__name__,
				"updated_at": datetime.now(timezone.utc),
			},
		)
		await self._event_bus.publish(THREAT_ESCALATED, escalated)
		return escalated
