# CyberGuard — Model Training Guide

> **Status:** Training Phase  
> **Prerequisite:** All datasets are already downloaded and preprocessed.  
> **Goal:** Train baseline models, evaluate them, save model artifacts, and prepare them for integration with CyberGuard detectors.

---

## 1. Training Objective

The training phase has four outputs:

```text
Processed Dataset
       ↓
Train Model
       ↓
Evaluate Model
       ↓
Save Model Artifact
       ↓
Integrate through BaseMLModel
```

Training code must remain separate from the runtime detection code.

The trained model is consumed by a detector:

```text
ThreatEvent
    ↓
Domain Agent
    ↓
Detector
    ↓
BaseMLModel
    ↓
Trained Model
    ↓
DetectionResult
```

The agent must never know which ML framework or model architecture is being used.

---

# 2. Models to Train

| Domain | Model File | Initial Model |
|---|---|---|
| Phishing URL | `url_model.py` | Random Forest baseline |
| Phishing Email | `distilbert_model.py` | DistilBERT |
| Phishing SMS | `distilbert_model.py` | DistilBERT |
| Deepfake Image | `efficientnet_model.py` | EfficientNet |
| Deepfake Video | `video_model.py` | Frame-based deepfake classifier |
| Deepfake Audio | `audio_model.py` | Audio deepfake classifier |
| Log Analysis | `isolation_forest_model.py` | Isolation Forest |
| API Abuse | `api_abuse_model.py` | ML anomaly/classification model |

The project architecture currently places `distilbert_model.py`, `efficientnet_model.py`, and `isolation_forest_model.py` behind the `BaseMLModel` abstraction.

---

# 3. Training Rules

Every model must follow these rules.

### Rule 1 — Never train on test data

```text
TRAIN → model learning
VALIDATION → model selection / tuning
TEST → final evaluation only
```

### Rule 2 — Save preprocessing assumptions

The model artifact must always be paired with the preprocessing configuration.

### Rule 3 — Reproducibility

Use a fixed random seed wherever the framework allows it.

```python
SEED = 42
```

### Rule 4 — Save metadata

Every trained model must have:

```text
model name
version
dataset name
dataset version/date
features
training date
metrics
framework
input format
output labels
```

### Rule 5 — Do not put training code inside agents

Bad:

```python
class PhishingAgent:
    model.fit(...)
```

Correct:

```text
training/
    ↓
model artifact
    ↓
BaseMLModel implementation
    ↓
Detector
    ↓
Agent
```

---

# 4. Directory Structure

Use this structure:

```text
training/
├── phishing/
│   ├── url/
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── config.yaml
│   │
│   ├── email/
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── config.yaml
│   │
│   └── sms/
│       ├── train.py
│       ├── evaluate.py
│       └── config.yaml
│
├── deepfake/
│   ├── image/
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── config.yaml
│   │
│   ├── video/
│   └── audio/
│
├── logs/
│   ├── train.py
│   ├── evaluate.py
│   └── config.yaml
│
└── api_abuse/
    ├── train.py
    ├── evaluate.py
    └── config.yaml
```

Model artifacts should be stored separately:

```text
backend/
└── data/
    └── models/
        ├── phishing/
        ├── deepfake/
        ├── logs/
        └── api_abuse/
```

---

# 5. Training Pipeline

Every model follows this common pipeline:

```text
1. Load processed dataset
2. Validate columns
3. Remove invalid rows
4. Remove duplicates
5. Separate features and labels
6. Load train/validation/test data
7. Train baseline
8. Evaluate
9. Tune if required
10. Evaluate again
11. Save model
12. Save metadata
13. Test inference
```

---

# 6. Phishing URL Model

## 6.1 Objective

Classify a URL as:

```text
0 → legitimate
1 → phishing / malicious
```

The existing project documentation uses a Random Forest baseline with URL structural features before moving to a more advanced transformer approach.

---

## 6.2 Input

Expected columns:

```text
url
domain
label
```

Additional columns may exist.

---

## 6.3 Feature Engineering

Create these features:

```python
url_len
domain_len
dot_count
dash_count
digit_count
at_count
has_ip
has_https
subdomain_count
```

Example:

```python
df["url_len"] = df["url"].str.len()

df["domain_len"] = df["domain"].str.len()

df["dot_count"] = df["url"].str.count(r"\.")

df["dash_count"] = df["url"].str.count("-")

df["digit_count"] = df["url"].str.count(r"\d")

df["at_count"] = df["url"].str.count("@")

df["has_ip"] = (
    df["url"]
    .str.contains(
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",
        regex=True
    )
    .astype(int)
)

df["has_https"] = (
    df["url"]
    .str.startswith("https")
    .astype(int)
)

df["subdomain_count"] = (
    df["domain"].str.count(r"\.") - 1
)
```

Feature list:

```python
FEATURES = [
    "url_len",
    "domain_len",
    "dot_count",
    "dash_count",
    "digit_count",
    "at_count",
    "has_ip",
    "has_https",
    "subdomain_count",
]
```

---

## 6.4 Baseline Training

```python
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

df = pd.read_csv(
    "data/phishing/url/processed/train.csv"
)

df = df.dropna(subset=["url", "label"])

# Feature engineering
df["url_len"] = df["url"].str.len()
df["domain_len"] = df["domain"].str.len()
df["dot_count"] = df["url"].str.count(r"\.")
df["dash_count"] = df["url"].str.count("-")
df["digit_count"] = df["url"].str.count(r"\d")
df["at_count"] = df["url"].str.count("@")

df["has_ip"] = (
    df["url"]
    .str.contains(
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
    )
    .astype(int)
)

df["has_https"] = (
    df["url"]
    .str.startswith("https")
    .astype(int)
)

df["subdomain_count"] = (
    df["domain"].str.count(r"\.") - 1
)

FEATURES = [
    "url_len",
    "domain_len",
    "dot_count",
    "dash_count",
    "digit_count",
    "at_count",
    "has_ip",
    "has_https",
    "subdomain_count",
]

X = df[FEATURES]
y = df["label"]

X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1,
)

model.fit(X_train, y_train)

predictions = model.predict(X_val)

print(
    classification_report(
        y_val,
        predictions
    )
)

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
    },
    "backend/data/models/phishing/url_classifier_v1.pkl",
)
```

---

# 7. Phishing Email Model

## 7.1 Objective

Classify an email as:

```text
0 → legitimate / benign
1 → phishing
```

The project uses a transformer-based phishing model architecture, with `distilbert_model.py` designated as the production model implementation.

---

## 7.2 Input

Use the processed email text.

Recommended input construction:

```text
Subject
+
Sender
+
Body
```

Example:

```python
text = (
    "Subject: " + subject +
    "\nFrom: " + sender +
    "\n\n" +
    body
)
```

---

## 7.3 Training

Use a Hugging Face sequence-classification workflow.

```text
Processed CSV
      ↓
Tokenizer
      ↓
Train Dataset
      ↓
DistilBERT
      ↓
Validation
      ↓
Best Checkpoint
```

Core training requirements:

```text
max_length      = 256
batch_size      = based on available GPU memory
learning_rate   = tune experimentally
epochs          = start with 3
seed            = 42
```

Do not hardcode these values into the detector.

---

# 8. Phishing SMS Model

## 8.1 Objective

```text
0 → legitimate SMS
1 → phishing / scam SMS
```

Training input:

```text
sms_text
label
```

The preprocessing pipeline already produces SMS training and test datasets.

---

## 8.2 Model

Use the same transformer architecture family as email:

```text
SMS
 ↓
Tokenizer
 ↓
DistilBERT
 ↓
Classification Head
 ↓
Phishing / Legitimate
```

The model implementation should remain replaceable.

---

# 9. Deepfake Image Model

## 9.1 Objective

```text
0 → real
1 → fake / AI-generated
```

The project documentation identifies an EfficientNet-based production model implementation for deepfake detection.

---

## 9.2 Input Pipeline

```text
Image
 ↓
RGB conversion
 ↓
Resize
 ↓
Normalization
 ↓
Tensor
 ↓
EfficientNet
 ↓
Real / Fake
```

The current preprocessing pipeline uses:

```text
224 × 224
```

image inputs.

---

## 9.3 Training Strategy

Start with transfer learning:

```text
Pretrained EfficientNet
        ↓
Freeze backbone
        ↓
Train classification head
        ↓
Unfreeze selected layers
        ↓
Fine-tune
```

Save the best validation checkpoint.

---

# 10. Deepfake Video Model

Video is handled as a sequence of frames.

```text
Video
 ↓
Frame Sampling
 ↓
Frame Preprocessing
 ↓
Image Model
 ↓
Frame Predictions
 ↓
Aggregation
 ↓
Video Prediction
```

Example:

```text
Frame 1 → 0.91
Frame 2 → 0.86
Frame 3 → 0.93
Frame 4 → 0.88

       ↓

Aggregation

       ↓

Fake = 0.895
```

The exact temporal model is not fixed in the current architecture documentation.

Therefore:

> Implement the first working version using the same image detector/model family with frame aggregation. Keep the implementation replaceable so a temporal model can be introduced later.

---

# 11. Deepfake Audio Model

Audio pipeline:

```text
Audio
 ↓
Resampling
 ↓
Normalization
 ↓
Spectrogram / Audio Features
 ↓
Audio Classifier
 ↓
Real / Fake
```

The current project documentation identifies audio deepfake data sources and an audio detector interface, but does not lock the final audio model architecture. Therefore the team should keep the model implementation behind `BaseMLModel` rather than coupling the detector to a particular architecture.

---

# 12. Log Anomaly Model

## 12.1 Objective

Detect anomalous activity in:

```text
Authentication logs
System logs
User behavior
```

The current architecture places:

```text
isolation_forest_model.py
```

under the Log Analysis agent.

---

## 12.2 Pipeline

```text
Raw Log
 ↓
Parsing
 ↓
Feature Extraction
 ↓
Numerical Feature Vector
 ↓
Isolation Forest
 ↓
Anomaly Score
 ↓
Normal / Anomalous
```

Example features may come from the already-preprocessed log schema:

```text
timestamp
user
device
activity
label
```

Do not pass raw log strings directly into Isolation Forest.

---

## 12.3 Training

```python
from sklearn.ensemble import IsolationForest
import joblib

model = IsolationForest(
    n_estimators=200,
    contamination="auto",
    random_state=42,
    n_jobs=-1,
)

model.fit(X_train)

joblib.dump(
    model,
    "backend/data/models/logs/isolation_forest_v1.pkl"
)
```

---

# 13. API Abuse Model

The API abuse component exists in the architecture, but the current documentation does not prescribe one final ML architecture.

Therefore the implementation must follow:

```text
Processed API Traffic
        ↓
Feature Engineering
        ↓
Model Training
        ↓
Evaluation
        ↓
Saved Artifact
        ↓
api_abuse_model.py
        ↓
PatternDetector
```

Possible training outputs:

```text
normal
suspicious
abusive
```

The final label schema must be agreed upon before integrating the detector.

Do not invent a different schema inside the agent.

---

# 14. Evaluation Metrics

Accuracy alone is **not sufficient** for CyberGuard.

For every classification model report:

```text
Accuracy
Precision
Recall
F1 Score
Confusion Matrix
ROC-AUC (where applicable)
```

For anomaly detection additionally report:

```text
False Positive Rate
False Negative Rate
Precision
Recall
F1
```

Use:

```python
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
```

---

# 15. Security-Oriented Evaluation

CyberGuard is a cybersecurity system.

Therefore the team must pay particular attention to:

```text
False Negatives
```

A phishing detector that incorrectly marks malicious inputs as safe can be more damaging than one that produces occasional false positives.

For every model record:

```text
False Positive Count
False Negative Count
```

Example report:

```text
Model: phishing-url-v1

Accuracy : 0.94
Precision: 0.93
Recall   : 0.96
F1       : 0.94

False Positives: 82
False Negatives: 37
```

---

# 16. Confusion Matrix

Every classifier must generate a confusion matrix.

```text
                    Predicted
                 Legit    Threat
Actual Legit       TN        FP
Actual Threat      FN        TP
```

For CyberGuard:

```text
FP = legitimate input incorrectly flagged
FN = malicious input incorrectly considered safe
```

A high FN rate must trigger investigation before deployment.

---

# 17. Model Acceptance Criteria

A model is not considered complete merely because training finished.

### Required

- [ ] Training completes successfully
- [ ] Validation metrics recorded
- [ ] Test metrics recorded
- [ ] Confusion matrix generated
- [ ] Model artifact saved
- [ ] Model can be loaded independently
- [ ] Inference test succeeds
- [ ] Input/output schema documented
- [ ] Model version assigned
- [ ] Dataset source recorded
- [ ] Random seed recorded

---

# 18. Model Metadata

For every trained model create:

```text
model_metadata.json
```

Example:

```json
{
  "model_name": "phishing-url-v1",
  "version": "1.0.0",
  "task": "binary_classification",
  "labels": {
    "0": "legitimate",
    "1": "phishing"
  },
  "dataset": "URLhaus + legitimate URL dataset",
  "training_date": "YYYY-MM-DD",
  "features": [
    "url_len",
    "domain_len",
    "dot_count",
    "dash_count",
    "digit_count",
    "at_count",
    "has_ip",
    "has_https",
    "subdomain_count"
  ],
  "metrics": {
    "accuracy": 0.0,
    "precision": 0.0,
    "recall": 0.0,
    "f1": 0.0
  }
}
```

Never write fake metric values.

Use the actual evaluation output.

---

# 19. Model Versioning

Use:

```text
<domain>-<task>-v<major>
```

Examples:

```text
phishing-url-v1
phishing-email-v1
phishing-sms-v1

deepfake-image-v1
deepfake-audio-v1

log-anomaly-v1
api-abuse-v1
```

When the model is retrained with a materially different architecture:

```text
v2
```

Example:

```text
phishing-url-v1
        ↓
phishing-url-v2
```

---

# 20. Model Artifact Rules

Store artifacts in:

```text
backend/data/models/
```

Example:

```text
backend/data/models/
├── phishing/
│   ├── url_classifier_v1.pkl
│   ├── email_distilbert_v1/
│   └── sms_distilbert_v1/
│
├── deepfake/
│   ├── image_efficientnet_v1/
│   └── audio_model_v1/
│
├── logs/
│   └── isolation_forest_v1.pkl
│
└── api_abuse/
    └── api_abuse_v1.pkl
```

Large artifacts must not be casually committed to Git.

---

# 21. BaseMLModel Integration

After training, the artifact must be wrapped using the CyberGuard model interface.

The interface requires:

```python
class BaseMLModel(ABC):

    async def load(self) -> None:
        ...

    async def predict(self, input_data: dict) -> dict:
        ...

    def is_loaded(self) -> bool:
        ...

    def model_name(self) -> str:
        ...
```



---

# 22. Example — URL Model Wrapper

```python
import joblib

from core.interfaces.base_ml_model import BaseMLModel


class URLPhishingModel(BaseMLModel):

    def __init__(
        self,
        model_path: str
    ) -> None:
        self._model_path = model_path
        self._model = None
        self._features = []

    async def load(self) -> None:
        artifact = joblib.load(self._model_path)

        self._model = artifact["model"]
        self._features = artifact["features"]

    async def predict(
        self,
        input_data: dict
    ) -> dict:

        features = input_data["features"]

        vector = [
            features[name]
            for name in self._features
        ]

        prediction = self._model.predict([vector])[0]

        probability = (
            self._model
            .predict_proba([vector])[0]
            [1]
        )

        return {
            "label": int(prediction),
            "confidence": float(probability),
        }

    def is_loaded(self) -> bool:
        return self._model is not None

    def model_name(self) -> str:
        return "phishing-url-v1"
```

---

# 23. Detector Integration

The detector receives a `BaseMLModel`.

```python
class URLDetector(BaseDetector):

    async def detect(
        self,
        payload: dict
    ) -> DetectionResult:

        features = self._extract_features(
            payload["url"]
        )

        result = await self._model.predict({
            "features": features
        })

        if result["label"] == 1:
            label = "phishing"
        else:
            label = "safe"

        return DetectionResult(
            label=label,
            confidence=result["confidence"],
            indicators=[],
            metadata=result,
        )
```

The detector interprets model output.

The model should not know about `ThreatEvent`.

---

# 24. SOLID Requirement

This architecture follows Dependency Inversion.

Correct:

```text
URLDetector
    ↓
BaseMLModel
    ↑
URLPhishingModel
```

Incorrect:

```python
class URLDetector:

    def __init__(self):
        self.model = URLPhishingModel(...)
```

Concrete model creation belongs in:

```text
backend/core/container.py
```

The project documentation explicitly requires concrete model wiring to remain in `container.py`.

---

# 25. Inference Smoke Test

Before connecting a model to an agent, run a standalone test.

Example:

```python
import asyncio

from agents.phishing.models.url_model import URLPhishingModel


async def main():

    model = URLPhishingModel(
        "backend/data/models/phishing/url_classifier_v1.pkl"
    )

    await model.load()

    assert model.is_loaded()

    result = await model.predict({
        "features": {
            "url_len": 80,
            "domain_len": 30,
            "dot_count": 4,
            "dash_count": 3,
            "digit_count": 5,
            "at_count": 0,
            "has_ip": 0,
            "has_https": 1,
            "subdomain_count": 3,
        }
    })

    print(result)


if __name__ == "__main__":
    asyncio.run(main())
```

Expected structure:

```json
{
  "label": 1,
  "confidence": 0.94
}
```

The actual confidence will depend on the trained model.

---

# 26. Training Completion Checklist

## Phishing

### URL

- [ ] Feature engineering complete
- [ ] Random Forest baseline trained
- [ ] Metrics generated
- [ ] Test set evaluated
- [ ] Artifact saved
- [ ] `URLPhishingModel` implemented
- [ ] Smoke test passed

### Email

- [ ] Dataset loaded
- [ ] Tokenizer configured
- [ ] DistilBERT trained
- [ ] Validation performed
- [ ] Test metrics recorded
- [ ] Best checkpoint saved
- [ ] Wrapper implemented
- [ ] Smoke test passed

### SMS

- [ ] Dataset loaded
- [ ] Tokenizer configured
- [ ] DistilBERT trained
- [ ] Validation performed
- [ ] Test metrics recorded
- [ ] Checkpoint saved
- [ ] Wrapper implemented
- [ ] Smoke test passed

---

## Deepfake

### Image

- [ ] Images validated
- [ ] Input pipeline verified
- [ ] EfficientNet trained
- [ ] Validation performed
- [ ] Test metrics recorded
- [ ] Best checkpoint saved
- [ ] Wrapper implemented
- [ ] Smoke test passed

### Video

- [ ] Frame extraction verified
- [ ] Frame model tested
- [ ] Frame aggregation implemented
- [ ] Video-level evaluation completed
- [ ] Artifact saved

### Audio

- [ ] Audio preprocessing verified
- [ ] Model trained
- [ ] Validation completed
- [ ] Test metrics recorded
- [ ] Artifact saved

---

## Logs

- [ ] Feature matrix validated
- [ ] Isolation Forest trained
- [ ] Anomaly threshold documented
- [ ] False-positive analysis completed
- [ ] Artifact saved
- [ ] Wrapper implemented
- [ ] Smoke test passed

---

## API Abuse

- [ ] Feature schema finalized
- [ ] Labels finalized
- [ ] Baseline model trained
- [ ] Evaluation completed
- [ ] Artifact saved
- [ ] Wrapper implemented
- [ ] Smoke test passed

---

# 27. Final Handoff

A model is ready for integration only when this exists:

```text
model artifact
      +
model_metadata.json
      +
training script
      +
evaluation script
      +
BaseMLModel implementation
      +
standalone smoke test
```

Then the integration order is:

```text
TRAIN
 ↓
EVALUATE
 ↓
SAVE ARTIFACT
 ↓
IMPLEMENT BaseMLModel
 ↓
IMPLEMENT Detector
 ↓
REGISTER IN container.py
 ↓
START AGENT
 ↓
SEND TEST ThreatEvent
 ↓
VERIFY threat.detected
```

The domain agent itself should only receive the detector map and publish the resulting `ThreatEvent`; it should not contain the ML implementation.

---

# 28. Definition of Done

The training phase is complete when:

```text
✅ All required models trained
✅ Metrics documented
✅ Test datasets untouched during training
✅ Artifacts saved
✅ Metadata saved
✅ BaseMLModel wrappers implemented
✅ Standalone inference verified
✅ Detectors can consume the models
✅ Models registered through dependency injection
```

Only after this should the team move to:

```text
Model
  ↓
Detector
  ↓
Agent
  ↓
Redis Stream
  ↓
ThreatScoringAgent
  ↓
ResponseAgent
```

---

# 29. Recommended Execution Order

Do not train everything simultaneously.

Use this order:

```text
1. URL Phishing
2. Email Phishing
3. SMS Phishing
4. Deepfake Image
5. Log Anomaly
6. Deepfake Audio
7. Deepfake Video
8. API Abuse
```

The first milestone is:

```text
URL Model
   ↓
URLPhishingModel
   ↓
URLDetector
   ↓
PhishingAgent
   ↓
cyberguard:threat.detected
```

Once this works end-to-end, replicate the same pattern for the remaining models.

---

# 30. Training Phase Deliverables

Each developer must submit:

```text
/training/<domain>/train.py
/training/<domain>/evaluate.py
/training/<domain>/config.yaml

/backend/data/models/<domain>/*
/backend/data/models/<domain>/model_metadata.json

/backend/agents/<domain>/models/<model>.py

/tests/models/test_<model>.py
```

No model should be considered integrated until all four layers exist:

```text
Training
Evaluation
Model Wrapper
Smoke Test
```