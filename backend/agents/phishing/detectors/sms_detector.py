from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class SmsDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		text = str(payload.get("sms_text", "")).lower()
		indicators = [str(item) for item in prediction.get("indicators", [])]
		if any(term in text for term in ("free", "prize", "claim", "verify")):
			indicators.append("Promotional or verification language")
		if any(char.isdigit() for char in text) and any(term in text for term in ("call", "text", "code")):
			indicators.append("Action requested through message")
		return DetectionResult(
			label=str(prediction.get("label", "unknown")),
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=list(dict.fromkeys(indicators)),
			metadata=dict(prediction.get("metadata", {})),
		)

	def input_type(self) -> str:
		return "sms"
