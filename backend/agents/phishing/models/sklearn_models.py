from __future__ import annotations

import re
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB

MODEL_DIR = Path(__file__).resolve().parents[3] / "data" / "models"


def url_features(url: str, domain: str) -> dict[str, int]:
	return {
		"url_len": len(url),
		"domain_len": len(domain),
		"dot_count": url.count("."),
		"dash_count": url.count("-"),
		"digit_count": len(re.findall(r"\d", url)),
		"at_count": url.count("@"),
		"has_ip": int(bool(re.search(r"\d{1,3}(?:\.\d{1,3}){3}", url))),
		"has_https": int(url.lower().startswith("https")),
		"subdomain_count": max(0, domain.count(".") - 1),
	}


URL_FEATURES = list(url_features("", ""))


class UrlModel:
	def __init__(self, path: Path | str = MODEL_DIR / "url_classifier.pkl") -> None:
		self._path = Path(path)
		self._model = None

	async def load(self) -> None:
		self._model = joblib.load(self._path)

	async def predict(self, input_data: dict) -> dict:
		if self._model is None:
			await self.load()
		features = url_features(str(input_data.get("url", "")), str(input_data.get("domain", "")))
		frame = pd.DataFrame([features])[URL_FEATURES]
		return _prediction(self._model, frame)

	def is_loaded(self) -> bool:
		return self._model is not None

	def model_name(self) -> str:
		return "url-random-forest"


class TextModel:
	def __init__(self, path: Path | str, field: str, name: str) -> None:
		self._path = Path(path)
		self._field = field
		self._name = name
		self._model = None

	async def load(self) -> None:
		self._model = joblib.load(self._path)

	async def predict(self, input_data: dict) -> dict:
		if self._model is None:
			await self.load()
		text = str(input_data.get(self._field, ""))
		vectorizer, classifier = self._model
		return _prediction(classifier, vectorizer.transform([text]))

	def is_loaded(self) -> bool:
		return self._model is not None

	def model_name(self) -> str:
		return self._name


def _prediction(model: object, values: object) -> dict:
	prediction = int(model.predict(values)[0])
	probabilities = model.predict_proba(values)[0]
	confidence = float(max(probabilities))
	return {"label": "phishing" if prediction else "safe", "confidence": confidence}


def train_text_model(input_path: Path, output_path: Path, field: str, algorithm: str) -> None:
	data = pd.read_csv(input_path).fillna("")
	vectorizer = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), sublinear_tf=True)
	features = vectorizer.fit_transform(data[field].astype(str))
	classifier = LogisticRegression(max_iter=1000) if algorithm == "logistic" else MultinomialNB()
	classifier.fit(features, data["label"].astype(int))
	joblib.dump((vectorizer, classifier), output_path)