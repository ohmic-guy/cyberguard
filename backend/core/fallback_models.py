from __future__ import annotations

from .interfaces.base_ml_model import BaseMLModel


class RuleBasedModel(BaseMLModel):
	"""Deterministic fallback for modalities without a trained model artifact."""

	def __init__(self, model_name: str, threat_terms: tuple[str, ...], label: str) -> None:
		self._model_name = model_name
		self._threat_terms = threat_terms
		self._label = label

	async def load(self) -> None:
		return None

	async def predict(self, input_data: dict) -> dict:
		text = " ".join(str(value) for value in input_data.values()).lower()
		matches = [term for term in self._threat_terms if term in text]
		confidence = min(0.99, 0.55 + 0.1 * len(matches)) if matches else 0.62
		return {
			"label": self._label if matches else "safe",
			"confidence": confidence,
			"indicators": [f"Rule match: {term}" for term in matches],
		}

	def is_loaded(self) -> bool:
		return True

	def model_name(self) -> str:
		return self._model_name