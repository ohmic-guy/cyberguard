from __future__ import annotations

from datetime import datetime, timezone

from ..core.events.event_bus import EventBus
from ..core.events.event_types import EventStatus, InputModality, ThreatCategory, ThreatEvent
from ..core.events.streams import (
	DEEPFAKE_INPUT,
	LOG_INPUT,
	PHISHING_INPUT,
	RAW_INPUT,
	THREAT_ESCALATED,
)


class OrchestratorAgent:
	def __init__(self, event_bus: EventBus) -> None:
		self._event_bus = event_bus

	def route(self, modality: InputModality) -> tuple[str, ThreatCategory]:
		if modality in {InputModality.EMAIL, InputModality.URL, InputModality.SMS, InputModality.QR}:
			return PHISHING_INPUT, ThreatCategory.PHISHING
		if modality in {InputModality.IMAGE, InputModality.VIDEO, InputModality.AUDIO}:
			return DEEPFAKE_INPUT, ThreatCategory.DEEPFAKE
		if modality in {InputModality.AUTH_LOG, InputModality.SYSTEM_LOG, InputModality.API_LOG}:
			return LOG_INPUT, ThreatCategory.LOG_ANOMALY
		raise ValueError(f"Unsupported input modality: {modality.value}")

	async def process(self, event: ThreatEvent) -> ThreatEvent:
		try:
			stream, category = self.route(event.modality)
			routed = event.model_copy(
				update={
					"category": category,
					"status": EventStatus.PROCESSING,
					"updated_at": datetime.now(timezone.utc),
				},
			)
			await self._event_bus.publish(stream, routed)
			return routed
		except Exception as error:
			escalated = event.model_copy(
				update={
					"status": EventStatus.ESCALATED,
					"error_message": str(error),
					"failed_agent": self.__class__.__name__,
					"updated_at": datetime.now(timezone.utc),
				},
			)
			await self._event_bus.publish(THREAT_ESCALATED, escalated)
			return escalated

	def subscribes_to(self) -> list[str]:
		return [RAW_INPUT]

	def emits_to(self) -> list[str]:
		return [PHISHING_INPUT, DEEPFAKE_INPUT, LOG_INPUT, THREAT_ESCALATED]
