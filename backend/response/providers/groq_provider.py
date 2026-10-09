from __future__ import annotations

from collections.abc import Mapping

from ...config import settings
from ...core.events.event_types import ThreatEvent
from ...core.interfaces.llm_provider import LLMProvider
from .fallback_provider import FallbackLLMProvider


class GroqProvider(LLMProvider):
	def __init__(self) -> None:
		self._client = None
		self._fallback = FallbackLLMProvider()
		if settings.GROQ_API_KEY:
			from groq import Groq
			self._client = Groq(api_key=settings.GROQ_API_KEY)

	async def explain(self, context: Mapping[str, object]) -> str:
		if self._client is None:
			return await self._fallback.explain(context)
		prompt = (
			"You are a cybersecurity analyst. Explain this threat in 2 concise sentences. "
			f"Category: {context.get('category')}\nModality: {context.get('modality')}\n"
			f"Risk: {context.get('risk_level')}\nConfidence: {context.get('confidence')}\n"
			f"Indicators: {', '.join(context.get('indicators', []))}"
		)
		try:
			return await self._complete(prompt, 180)
		except Exception:
			return await self._fallback.explain(context)

	async def recommend(self, threat: ThreatEvent) -> list[str]:
		if self._client is None:
			return await self._fallback.recommend(threat)
		try:
			text = await self._complete(
				f"List exactly 3 response actions for a {threat.risk_level} {threat.category} threat, one per line.",
				120,
			)
			actions = [line.strip(" -*0123456789.)") for line in text.splitlines() if line.strip()][:3]
			return actions or await self._fallback.recommend(threat)
		except Exception:
			return await self._fallback.recommend(threat)

	async def map_to_mitre(self, threat: ThreatEvent) -> list[str]:
		return await self._fallback.map_to_mitre(threat)

	async def _complete(self, prompt: str, max_tokens: int) -> str:
		response = self._client.chat.completions.create(
			model="qwen/qwen3.8-27b",
			messages=[{"role": "user", "content": prompt}],
			max_tokens=max_tokens,
		)
		return response.choices[0].message.content.strip()
