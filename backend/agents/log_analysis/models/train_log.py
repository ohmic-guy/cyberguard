from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

from .isolation_model import FEATURES, MODEL_DIR

ROOT = Path(__file__).resolve().parents[3]


def main() -> None:
	data = pd.read_csv(ROOT / "data" / "logs" / "auth" / "processed" / "logon.csv").fillna("")
	encoders: dict[str, LabelEncoder] = {}
	for source, target in (("user", "user_enc"), ("device", "device_enc"), ("activity", "act_enc")):
		encoder = LabelEncoder()
		data[target] = encoder.fit_transform(data[source].astype(str))
		encoders[source] = encoder
	data["hour"] = pd.to_datetime(data["timestamp"], errors="coerce").dt.hour.fillna(0)
	model = IsolationForest(contamination=0.1, random_state=42, n_jobs=-1)
	model.fit(data[FEATURES])
	MODEL_DIR.mkdir(parents=True, exist_ok=True)
	joblib.dump(model, MODEL_DIR / "log_isolation_forest.pkl")
	for name, encoder in encoders.items():
		joblib.dump(encoder, MODEL_DIR / f"log_le_{name}.pkl")
	print(f"Saved log model to {MODEL_DIR}")


if __name__ == "__main__":
	main()