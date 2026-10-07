from __future__ import annotations

from collections.abc import Mapping
from typing import cast

from ..agents.phishing.agent import PhishingAgent
from ..agents.deepfake.agent import DeepfakeAgent
from ..agents.deepfake.detectors.image_detector import ImageDetector
from ..agents.deepfake.models.image_model import ImageModel
from ..agents.log_analysis.agent import LogAnalysisAgent
from ..agents.log_analysis.detectors.auth_log_detector import AuthLogDetector
from ..agents.log_analysis.models.isolation_model import LogIsolationModel
from ..core.events.event_bus import EventBus, event_bus
from ..core.events.event_types import InputModality
from ..core.interfaces.base_detector import BaseDetector
from ..response.providers.groq_provider import GroqProvider
from ..response.response_agent import ResponseAgent
from ..scoring.scoring_agent import ThreatScoringAgent
from ..scoring.threat_scorer import ThreatScorer
from .orchestrator import OrchestratorAgent


def build_container(
	detectors: Mapping[str, BaseDetector] | None = None,
	bus: EventBus = event_bus,
) -> dict[str, object]:
	all_detectors = dict(detectors or {})
	all_detectors.setdefault("image", ImageDetector(ImageModel()))
	all_detectors.setdefault("auth_log", AuthLogDetector(LogIsolationModel()))
	phishing_detectors = {
		InputModality(detector.input_type()): detector
		for detector in all_detectors.values()
		if detector.input_type() in {"email", "url", "sms", "qr"}
	}
	return {
		"orchestrator": OrchestratorAgent(bus),
		"phishing": PhishingAgent(phishing_detectors, bus),
		"deepfake": DeepfakeAgent({"image": all_detectors["image"]}, bus),
		"log": LogAnalysisAgent({"auth_log": all_detectors["auth_log"]}, bus),
		"scoring": ThreatScoringAgent(bus=bus, scorer=ThreatScorer()),
		"response": ResponseAgent(bus=bus, llm=GroqProvider()),
	}


build_agents = build_container
agents = build_container()
orchestrator = agents["orchestrator"]
phishing_agent = agents["phishing"]
deepfake_agent = agents["deepfake"]
log_agent = agents["log"]
scoring_agent = agents["scoring"]
response_agent = cast(ResponseAgent, agents["response"])
