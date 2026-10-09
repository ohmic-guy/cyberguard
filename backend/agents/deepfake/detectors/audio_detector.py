from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class AudioDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		label = str(prediction.get("label", "unknown")).strip().lower()
		fake = label in {"fake", "deepfake", "synthetic", "ai-generated", "1"}
		return DetectionResult(
			label="deepfake" if fake else "real",
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=[str(item) for item in prediction.get("indicators", [])],
		)

	def input_type(self) -> str:
		return "audio"
