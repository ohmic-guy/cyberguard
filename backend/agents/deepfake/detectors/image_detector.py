from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class ImageDetector(BaseDetector):
	async def detect(self, payload: dict) -> DetectionResult:
		prediction = await self._model.predict(payload)
		label = str(prediction["label"])
		return DetectionResult(
			label="deepfake" if label in {"fake", "1"} else "real",
			confidence=float(prediction["confidence"]),
			indicators=["Image classifier detected synthetic content"] if label in {"fake", "1"} else [],
		)

	def input_type(self) -> str:
		return "image"# TODO: implement
# Owner: [ assign from master documentation ]
