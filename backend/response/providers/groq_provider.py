from __future__ import annotations

from collections.abc import Mapping

from ...config import settings
from ...core.events.event_types import ThreatEvent
from ...core.interfaces.llm_provider import LLMProvider


class GroqProvider(LLMProvider):
	def __init__(self) -> None:
		self._client = None
		if settings.GROQ_API_KEY:
			from groq import Groq
			self._client = Groq(api_key=settings.GROQ_API_KEY)

	async def explain(self, context: Mapping[str, object]) -> str:
		default_expl = (
			f"{context.get('risk_level', 'Unknown').capitalize()} risk: "
			f"the {context.get('category', 'threat')} detector reported "
			f"{context.get('confidence', 0):.0%} confidence with "
			f"{len(context.get('indicators', []))} supporting indicator(s)."
		)
		if self._client is None:
			return default_expl
		prompt = (
			"You are a cybersecurity analyst. Explain this threat in 2 concise sentences. "
			f"Category: {context.get('category')}\nModality: {context.get('modality')}\n"
			f"Risk: {context.get('risk_level')}\nConfidence: {context.get('confidence')}\n"
			f"Indicators: {', '.join(context.get('indicators', []))}"
		)
		try:
			return await self._complete(prompt, 180)
		except Exception as e:
			return default_expl

	async def recommend(self, threat: ThreatEvent) -> list[str]:
		if self._client is None:
			return _default_actions(threat)
		try:
			text = await self._complete(
				f"List exactly 3 response actions for a {threat.risk_level} {threat.category} threat, one per line.",
				120,
			)
			return [line.strip(" -*0123456789.)") for line in text.splitlines() if line.strip()][:3]
		except Exception as e:
			return _default_actions(threat)

	async def map_to_mitre(self, threat: ThreatEvent) -> list[str]:
		return {
			"phishing": ["T1566.001", "T1598"],
			"deepfake": ["T1566.004", "T1656"],
			"log_anomaly": ["T1078", "T1021"],
		}.get(threat.category.value, ["T1566"])

	async def _complete(self, prompt: str, max_tokens: int) -> str:
		response = self._client.chat.completions.create(
			model="qwen/qwen3.8-27b",
			messages=[{"role": "user", "content": prompt}],
			max_tokens=max_tokens,
		)
		return response.choices[0].message.content.strip()


def _default_actions(threat: ThreatEvent) -> list[str]:
	if threat.category.value == "phishing":
		return ["Quarantine the message", "Warn the recipient", "Block the sender or domain"]
	if threat.category.value == "deepfake":
		return ["Restrict the media", "Verify the source independently", "Preserve the original evidence"]
	return ["Review the related activity", "Verify the account or device", "Preserve relevant logs"]
