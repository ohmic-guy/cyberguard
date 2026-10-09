from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class ImageDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		label = str(prediction["label"]).strip().lower()
		is_deepfake = label in {"fake", "deepfake", "synthetic", "ai-generated", "1"}
		return DetectionResult(
			label="deepfake" if is_deepfake else "real",
			confidence=float(prediction["confidence"]),
			indicators=["Image classifier detected synthetic content"] if is_deepfake else [],
		)

	def input_type(self) -> str:
		return "image"
