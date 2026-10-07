from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class AuthLogDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		return DetectionResult(
			label=str(prediction["label"]),
			confidence=float(prediction["confidence"]),
			indicators=[str(item) for item in prediction.get("indicators", [])],
		)

	def input_type(self) -> str:
		return "auth_log"
