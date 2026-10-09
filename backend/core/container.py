from __future__ import annotations

from collections.abc import Mapping
from typing import cast

from ..agents.phishing.agent import PhishingAgent
from ..agents.phishing.detectors.url_detector import UrlDetector
from ..agents.phishing.detectors.email_detector import EmailDetector
from ..agents.phishing.detectors.sms_detector import SmsDetector
from ..agents.phishing.detectors.qr_detector import QrDetector
from ..agents.phishing.models.sklearn_models import UrlModel, TextModel, MODEL_DIR as PHISHING_MODEL_DIR
from ..agents.deepfake.agent import DeepfakeAgent
from ..agents.deepfake.detectors.image_detector import ImageDetector
from ..agents.deepfake.detectors.audio_detector import AudioDetector
from ..agents.deepfake.detectors.video_detector import VideoDetector
from ..agents.deepfake.detectors.watermark_aggregator import WatermarkAggregator
from ..agents.deepfake.models.image_model import ImageModel
from ..agents.log_analysis.agent import LogAnalysisAgent
from ..agents.log_analysis.detectors.auth_log_detector import AuthLogDetector
from ..agents.log_analysis.detectors.system_log_detector import SystemLogDetector
from ..agents.log_analysis.detectors.behavior_detector import BehaviorDetector
from ..agents.log_analysis.models.isolation_model import LogIsolationModel
from ..agents.api_abuse.agent import ApiAbuseAgent
from ..agents.api_abuse.detectors.pattern_detector import PatternDetector
from .events.event_bus import EventBus, event_bus
from .events.event_types import InputModality
from .interfaces.base_detector import BaseDetector
from ..response.providers.groq_provider import GroqProvider
from ..response.response_agent import ResponseAgent
from ..scoring.scoring_agent import ThreatScoringAgent
from ..scoring.threat_scorer import ThreatScorer
from .orchestrator import OrchestratorAgent
from .fallback_models import RuleBasedModel


def build_container(
	detectors: Mapping[str, BaseDetector] | None = None,
	bus: EventBus = event_bus,
) -> dict[str, object]:
	all_detectors = dict(detectors or {})

	# ── Phishing detectors ────────────────────────────────────────────
	# Each detector wraps a lazy-loading sklearn model (loaded on first predict)
	url_detector = all_detectors.get("url") or UrlDetector(
		UrlModel(PHISHING_MODEL_DIR / "url_classifier.pkl")
	)
	email_detector = all_detectors.get("email") or EmailDetector(
		TextModel(PHISHING_MODEL_DIR / "email_classifier.pkl", field="raw_text", name="email-logistic")
	)
	sms_detector = all_detectors.get("sms") or SmsDetector(
		TextModel(PHISHING_MODEL_DIR / "sms_classifier.pkl", field="sms_text", name="sms-naive-bayes")
	)
	qr_detector = all_detectors.get("qr") or QrDetector(
		RuleBasedModel("qr-rule-engine", ("login", "verify", "payment", "credential"), "phishing")
	)

	phishing_detectors: dict[InputModality, BaseDetector] = {
		InputModality.URL: url_detector,
		InputModality.EMAIL: email_detector,
		InputModality.SMS: sms_detector,
		InputModality.QR: qr_detector,
	}

	# ── Deepfake detectors ────────────────────────────────────────────
	image_detector = all_detectors.get("image") or ImageDetector(ImageModel())
	watermark_detector = all_detectors.get("watermark") or WatermarkAggregator(model=None)
	audio_detector = all_detectors.get("audio") or AudioDetector(
		RuleBasedModel(
			"audio-rule-engine",
			("synthetic", "voice clone", "deepfake", "generated", "impersonat", "celebrity", "donald trump", "trump"),
			"fake",
		)
	)
	video_detector = all_detectors.get("video") or VideoDetector(
		RuleBasedModel("video-rule-engine", ("synthetic", "face swap", "deepfake", "generated"), "fake")
	)

	# ── Log analysis detectors ────────────────────────────────────────
	auth_log_detector = all_detectors.get("auth_log") or AuthLogDetector(LogIsolationModel())
	system_log_detector = all_detectors.get("system_log") or SystemLogDetector(LogIsolationModel())
	behavior_detector = all_detectors.get("api_log") or BehaviorDetector(
		RuleBasedModel("api-abuse-rule-engine", ("bola", "idor", "enumerat", "rate", "graphql", "forbidden"), "abusive")
	)

	return {
		"orchestrator": OrchestratorAgent(bus),
		"phishing": PhishingAgent(phishing_detectors, bus),
		"deepfake": DeepfakeAgent({"image": watermark_detector, "audio": audio_detector, "video": image_detector}, bus),
		"log": LogAnalysisAgent({"auth_log": auth_log_detector, "system_log": system_log_detector}, bus),
		"api_abuse": ApiAbuseAgent(behavior_detector, bus),
		"scoring": ThreatScoringAgent(bus=bus, scorer=ThreatScorer()),
		"response": ResponseAgent(bus=bus, llm=GroqProvider()),
	}


build_agents = build_container
agents = build_container()
orchestrator = agents["orchestrator"]
phishing_agent = agents["phishing"]
deepfake_agent = agents["deepfake"]
log_agent = agents["log"]
api_abuse_agent = agents["api_abuse"]
scoring_agent = agents["scoring"]
response_agent = cast(ResponseAgent, agents["response"])
