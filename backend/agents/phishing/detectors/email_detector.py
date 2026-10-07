from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class EmailDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		text = f"{payload.get('subject', '')} {payload.get('raw_text', '')}".lower()
		indicators = [str(item) for item in prediction.get("indicators", [])]
		if any(term in text for term in ("urgent", "immediately", "verify your account")):
			indicators.append("Urgent or credential language")
		if "http://" in text or "https://" in text:
			indicators.append("Link in message content")
		return DetectionResult(
			label=str(prediction.get("label", "unknown")),
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=list(dict.fromkeys(indicators)),
			metadata=dict(prediction.get("metadata", {})),
		)

	def input_type(self) -> str:
		return "email"
