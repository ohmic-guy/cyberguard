from __future__ import annotations

from collections.abc import Mapping

from ..agents.phishing.agent import PhishingAgent
from ..core.events.event_bus import EventBus, event_bus
from ..core.interfaces.base_detector import BaseDetector
from ..scoring.scoring_agent import ThreatScoringAgent
from ..scoring.threat_scorer import ThreatScorer
from .orchestrator import OrchestratorAgent


def build_agents(
	detectors: Mapping[str, BaseDetector],
	bus: EventBus = event_bus,
) -> dict[str, object]:
	phishing_detectors = {
		detector.input_type(): detector
		for detector in detectors.values()
		if detector.input_type() in {"email", "url", "sms", "qr"}
	}
	return {
		"orchestrator": OrchestratorAgent(bus),
		"phishing": PhishingAgent(phishing_detectors, bus),
	}


agents = build_agents({})
orchestrator = agents["orchestrator"]
phishing_agent = agents["phishing"]
scoring_agent = ThreatScoringAgent(bus=event_bus, scorer=ThreatScorer())
