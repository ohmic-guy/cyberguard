from ....core.interfaces.base_detector import BaseDetector, DetectionResult


from ....core.india_threat_kb import scan_india_patterns

class SmsDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		text = str(payload.get("sms_text", "")).lower()
		indicators = [str(item) for item in prediction.get("indicators", [])]
		confidence = float(prediction.get("confidence", 0.0))
		label = str(prediction.get("label", "unknown"))

		if any(term in text for term in ("free", "prize", "claim", "verify")):
			indicators.append("Promotional or verification language")
		if any(char.isdigit() for char in text) and any(term in text for term in ("call", "text", "code")):
			indicators.append("Action requested through message")
			
		# USP 03: India-Specific Fraud Intelligence
		india_matches = scan_india_patterns(text)
		for match in india_matches:
			indicators.append(match["indicator"])
			confidence = min(0.99, confidence + match["boost"])
			if confidence >= 0.7:
				label = "phishing"

		return DetectionResult(
			label=label,
			confidence=confidence,
			indicators=list(dict.fromkeys(indicators)),
			metadata=dict(prediction.get("metadata", {})),
		)

	def input_type(self) -> str:
		return "sms"
