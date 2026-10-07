from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd

MODEL_DIR = Path(__file__).resolve().parents[3] / "models"
FEATURES = ["user_enc", "device_enc", "act_enc", "hour"]


class LogIsolationModel:
	def __init__(self, model_dir: Path | str = MODEL_DIR) -> None:
		self._model_dir = Path(model_dir)
		self._model = None
		self._encoders: dict[str, object] = {}

	async def load(self) -> None:
		self._model = joblib.load(self._model_dir / "log_isolation_forest.pkl")
		for name in ("user", "device", "activity"):
			self._encoders[name] = joblib.load(self._model_dir / f"log_le_{name}.pkl")

	async def predict(self, input_data: dict) -> dict:
		if self._model is None:
			await self.load()
		row = {
			"user_enc": self._encode("user", input_data.get("user", "")),
			"device_enc": self._encode("device", input_data.get("device", "")),
			"act_enc": self._encode("activity", input_data.get("activity", "")),
			"hour": _hour(input_data.get("timestamp", "")),
		}
		frame = pd.DataFrame([row])[FEATURES]
		prediction = int(self._model.predict(frame)[0])
		anomaly = prediction == -1
		score = float(-self._model.decision_function(frame)[0])
		confidence = min(1.0, max(0.0, 0.5 + score))
		return {
			"label": "anomaly" if anomaly else "normal",
			"confidence": confidence,
			"indicators": ["Isolation Forest anomaly" ] if anomaly else [],
		}

	def _encode(self, name: str, value: object) -> int:
		encoder = self._encoders[name]
		try:
			return int(encoder.transform([str(value)])[0])
		except ValueError:
			return -1

	def is_loaded(self) -> bool:
		return self._model is not None

	def model_name(self) -> str:
		return "log-isolation-forest"


def _hour(timestamp: object) -> int:
	parsed = pd.to_datetime(timestamp, errors="coerce")
	return int(parsed.hour) if not pd.isna(parsed) else 0