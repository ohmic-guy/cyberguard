from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class QrDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		indicators = [str(item) for item in prediction.get("indicators", [])]
		if payload.get("decoded_url") or payload.get("url"):
			indicators.append("QR code contains a URL")
		return DetectionResult(
			label=str(prediction.get("label", "unknown")),
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=list(dict.fromkeys(indicators)),
			metadata=dict(prediction.get("metadata", {})),
		)

	def input_type(self) -> str:
		return "qr"
