from __future__ import annotations

from datetime import datetime, timezone

from agentscope.message import Msg

from ..core.events.event_bus import EventBus
from ..core.events.event_types import EventStatus, ThreatEvent
from ..core.events.streams import THREAT_DETECTED, THREAT_ESCALATED, THREAT_SCORED
from ..core.interfaces.base_agent import BaseCyberAgent
from .threat_scorer import ThreatScorer


class ThreatScoringAgent(BaseCyberAgent):
	def __init__(self, bus: EventBus, scorer: ThreatScorer) -> None:
		self._event_bus = bus
		self._scorer = scorer

	def reply(self, x: Msg | None = None) -> Msg:
		if x is None:
			raise ValueError("ThreatScoringAgent.reply requires an AgentScope message")
		return x

	def subscribes_to(self) -> list[str]:
		return [THREAT_DETECTED]

	def emits_to(self) -> list[str]:
		return [THREAT_SCORED, THREAT_ESCALATED]

	async def process(self, event: ThreatEvent) -> ThreatEvent:
		try:
			risk_level, score = self._scorer.score(event)
			scored = event.model_copy(
				update={
					"status": EventStatus.SCORED,
					"risk_level": risk_level,
					"confidence": score,
					"score_factors": self._scorer.explain_score(event),
					"updated_at": datetime.now(timezone.utc),
				}
			)
			await self._event_bus.publish(THREAT_SCORED, scored)
			return scored
		except Exception as error:
			escalated = event.model_copy(
				update={
					"status": EventStatus.ESCALATED,
					"error_message": str(error),
					"failed_agent": self.__class__.__name__,
					"updated_at": datetime.now(timezone.utc),
				}
			)
			await self._event_bus.publish(THREAT_ESCALATED, escalated)
			return escalated
