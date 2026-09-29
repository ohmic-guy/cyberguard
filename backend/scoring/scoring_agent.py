import asyncio
from typing import Any
from agentscope.message import Msg
from core.interfaces.base_agent import BaseCyberAgent
from core.interfaces.base_scorer import BaseScorer
from core.events.event_bus import EventBus
from core.events.event_types import ThreatEvent, EventStatus
from core.events.streams import THREAT_DETECTED, THREAT_SCORED, THREAT_ESCALATED


class ThreatScoringAgent(BaseCyberAgent):
    """AgentScope cyber agent responsible for scoring threats emitted from detection domain agents."""

    def __init__(
        self,
        name: str = "threat_scoring_agent",
        bus: EventBus | None = None,
        scorer: BaseScorer | None = None,
    ) -> None:
        super().__init__(name=name)
        self._bus = bus
        self._scorer = scorer

    def subscribes_to(self) -> list[str]:
        return [THREAT_DETECTED]

    def emits_to(self) -> list[str]:
        return [THREAT_SCORED, THREAT_ESCALATED]

    def reply(self, x: Msg | None = None) -> Msg:
        if x is None or x.content is None:
            return Msg(name=self.name, content={"status": "empty_input"}, role="assistant")

        if isinstance(x.content, ThreatEvent):
            event = x.content
        elif isinstance(x.content, dict):
            event = ThreatEvent.model_validate(x.content)
        else:
            event = ThreatEvent.model_validate_json(x.content)

        asyncio.create_task(self._score(event))
        return Msg(name=self.name, content={"status": "scoring", "event_id": event.event_id}, role="assistant")

    async def _score(self, event: ThreatEvent) -> None:
        try:
            if self._scorer is None:
                raise ValueError("BaseScorer interface instance was not injected into ThreatScoringAgent")

            risk_level, confidence = self._scorer.score(event)
            score_factors = self._scorer.explain_score(event)

            scored_event = event.model_copy(
                update={
                    "risk_level": risk_level,
                    "confidence": confidence,
                    "score_factors": score_factors,
                    "status": EventStatus.SCORED,
                }
            )

            if self._bus:
                await self._bus.publish(THREAT_SCORED, scored_event)

        except Exception as exc:
            if self._bus:
                await self._bus.publish(
                    THREAT_ESCALATED,
                    event.model_copy(
                        update={
                            "status": EventStatus.ESCALATED,
                            "error_message": str(exc),
                            "failed_agent": self.name,
                        }
                    ),
                )


export_agent = ThreatScoringAgent
