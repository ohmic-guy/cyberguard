from datetime import datetime

import pytest
from pydantic import ValidationError

from backend.core.events.event_types import EventStatus, InputModality, ThreatCategory, ThreatEvent
from backend.core.events.streams import (
    DEEPFAKE_INPUT,
    LOG_INPUT,
    PHISHING_INPUT,
    THREAT_ESCALATED,
)
from backend.core.orchestrator import OrchestratorAgent


class FakeEventBus:
    def __init__(self) -> None:
        self.published: list[tuple[str, ThreatEvent]] = []

    async def publish(self, stream: str, event: ThreatEvent) -> None:
        self.published.append((stream, event))


class FailingOrchestrator(OrchestratorAgent):
    def route(self, modality: InputModality) -> tuple[str, ThreatCategory]:
        raise ValueError("unsupported")


def make_event(modality: InputModality) -> ThreatEvent:
    return ThreatEvent(modality=modality, source="test", payload={})


@pytest.mark.parametrize(
    ("modality", "stream", "category"),
    [
        (InputModality.EMAIL, PHISHING_INPUT, ThreatCategory.PHISHING),
        (InputModality.IMAGE, DEEPFAKE_INPUT, ThreatCategory.DEEPFAKE),
        (InputModality.API_LOG, LOG_INPUT, ThreatCategory.LOG_ANOMALY),
    ],
)
def test_orchestrator_routes_supported_modalities(
    modality: InputModality,
    stream: str,
    category: ThreatCategory,
) -> None:
    orchestrator = OrchestratorAgent(FakeEventBus())

    assert orchestrator.route(modality) == (stream, category)


@pytest.mark.asyncio
async def test_orchestrator_publishes_processing_event() -> None:
    event_bus = FakeEventBus()
    event = make_event(InputModality.URL)

    result = await OrchestratorAgent(event_bus).process(event)

    assert result is not event
    assert result.status is EventStatus.PROCESSING
    assert result.category is ThreatCategory.PHISHING
    assert event_bus.published == [(PHISHING_INPUT, result)]


def test_threat_event_rejects_naive_timestamp() -> None:
    with pytest.raises(ValidationError):
        ThreatEvent(
            modality=InputModality.EMAIL,
            source="test",
            payload={},
            created_at=datetime(2026, 1, 1),
        )


def test_threat_event_rejects_invalid_confidence() -> None:
    with pytest.raises(ValidationError):
        ThreatEvent(
            modality=InputModality.EMAIL,
            source="test",
            payload={},
            confidence=1.1,
        )


@pytest.mark.asyncio
async def test_orchestrator_escalates_route_failure() -> None:
    event_bus = FakeEventBus()
    event = make_event(InputModality.EMAIL)

    result = await FailingOrchestrator(event_bus).process(event)

    assert result.status is EventStatus.ESCALATED
    assert result.failed_agent == "FailingOrchestrator"
    assert event_bus.published[0] == (THREAT_ESCALATED, result)