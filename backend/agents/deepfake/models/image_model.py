from __future__ import annotations

import base64
import io
from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms

from ....core.interfaces.base_ml_model import BaseMLModel

MODEL_PATH = Path(__file__).resolve().parents[3] / "data" / "models" / "deepfake_image.pth"


class ImageModel(BaseMLModel):
	def __init__(self, path: Path | str = MODEL_PATH) -> None:
		self._path = Path(path)
		self._model = None
		self._classes: list[str] = []
		self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
		self._transform = transforms.Compose([
			transforms.Resize((224, 224)),
			transforms.ToTensor(),
			transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
		])

	async def load(self) -> None:
		checkpoint = torch.load(self._path, map_location=self._device, weights_only=False)
		self._classes = checkpoint["classes"]
		model = models.efficientnet_b0(weights=None)
		model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(self._classes))
		model.load_state_dict(checkpoint["state_dict"])
		self._model = model.to(self._device).eval()

	async def predict(self, input_data: dict) -> dict:
		if self._model is None:
			await self.load()
		image = _image_from_payload(input_data)
		with torch.inference_mode():
			output = self._model(self._transform(image).unsqueeze(0).to(self._device))
		probabilities = torch.softmax(output, dim=1)[0]
		index = int(probabilities.argmax())
		return {"label": self._classes[index], "confidence": float(probabilities[index])}

	def is_loaded(self) -> bool:
		return self._model is not None

	def model_name(self) -> str:
		return "deepfake-image-efficientnet"


def _image_from_payload(payload: dict) -> Image.Image:
	if payload.get("content_b64"):
		return Image.open(io.BytesIO(base64.b64decode(str(payload["content_b64"])))).convert("RGB")
	return Image.open(str(payload["path"])).convert("RGB")