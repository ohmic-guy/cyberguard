from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from .sklearn_models import MODEL_DIR, URL_FEATURES, train_text_model, url_features

ROOT = Path(__file__).resolve().parents[3]


def train_url_model() -> None:
	data = pd.read_csv(ROOT / "data" / "phishing" / "url" / "processed" / "train.csv").fillna("")
	features = pd.DataFrame([url_features(row.url, row.domain) for row in data.itertuples()])[URL_FEATURES]
	classifier = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
	classifier.fit(features, data["label"].astype(int))
	joblib.dump(classifier, MODEL_DIR / "url_classifier.pkl")


def main() -> None:
	MODEL_DIR.mkdir(parents=True, exist_ok=True)
	train_url_model()
	train_text_model(ROOT / "data" / "phishing" / "email" / "processed" / "train.csv", MODEL_DIR / "email_classifier.pkl", "raw_text", "logistic")
	train_text_model(ROOT / "data" / "phishing" / "sms" / "processed" / "train.csv", MODEL_DIR / "sms_classifier.pkl", "sms_text", "naive_bayes")
	print(f"Saved phishing models to {MODEL_DIR}")


if __name__ == "__main__":
	main()