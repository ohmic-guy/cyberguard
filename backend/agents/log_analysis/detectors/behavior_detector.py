from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class BehaviorDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		return DetectionResult(
			label=str(prediction.get("label", "unknown")),
			confidence=float(prediction.get("confidence", 0.0)),
			indicators=[str(item) for item in prediction.get("indicators", [])],
		)

	def input_type(self) -> str:
		return "api_log"
