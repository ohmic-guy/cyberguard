from ....core.interfaces.base_detector import BaseDetector, DetectionResult


from ....core.india_threat_kb import scan_india_patterns

class EmailDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		text = f"{payload.get('subject', '')} {payload.get('raw_text', '')}".lower()
		indicators = [str(item) for item in prediction.get("indicators", [])]
		confidence = float(prediction.get("confidence", 0.0))
		label = str(prediction.get("label", "unknown"))

		if any(term in text for term in ("urgent", "immediately", "verify your account")):
			indicators.append("Urgent or credential language")
		if "http://" in text or "https://" in text:
			indicators.append("Link in message content")
			
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
		return "email"
