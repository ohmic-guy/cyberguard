from ....core.interfaces.base_detector import BaseDetector, DetectionResult


from ....core.threat_intel_feed import feed

class UrlDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		url = str(payload.get("url", ""))
		
		# USP 06: Threat Intel Feed
		await feed.refresh()
		if feed.is_known_malicious(url):
			return DetectionResult(
				label="phishing",
				confidence=0.99,
				indicators=["URL confirmed in live threat intelligence feed",
							"Matched in URLhaus / OpenPhish real-time database"],
			)
			
		prediction = await self._model.predict(payload)
		url = str(payload.get("url", ""))
		domain = str(payload.get("domain", ""))
		indicators = [str(item) for item in prediction.get("indicators", [])]
		if not url.lower().startswith("https://"):
			indicators.append("No HTTPS")
		if "@" in url:
			indicators.append("@ symbol in URL")
		if domain and domain.replace(".", "").replace(":", "").isdigit():
			indicators.append("IP address in URL")
		return DetectionResult(
			label=str(prediction.get("label", "unknown")),
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=list(dict.fromkeys(indicators)),
			metadata=dict(prediction.get("metadata", {})),
		)

	def input_type(self) -> str:
		return "url"
