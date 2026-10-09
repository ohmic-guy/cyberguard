from __future__ import annotations

from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class PatternDetector(BaseDetector):
	"""Classify API logs using the prediction supplied by an abuse model."""

	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		label = str(prediction.get("label", "benign")).strip().lower()
		abusive = label in {"abuse", "abusive", "attack", "malicious", "1", "true"}
		return DetectionResult(
			label="api_abuse" if abusive else "benign",
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=[str(item) for item in prediction.get("indicators", [])],
			metadata={"model_label": label},
		)

	def input_type(self) -> str:
		return "api_log"
