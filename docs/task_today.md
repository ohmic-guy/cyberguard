# CyberGuard — Next Steps
> Data preprocessed. Pipeline not built. Demo day is close.
> This document tells every developer exactly what to build, in what order, today.

---

## Status Check

| Component | Status |
|---|---|
| Datasets preprocessed | ✅ Done |
| Demo samples JSON | ✅ Done |
| Folder structure | ✅ Done |
| Core interfaces | ✅ Done (in repo) |
| ML models trained | ❌ Not started |
| Detectors implemented | ❌ Not started |
| Agents implemented | ❌ Not started |
| container.py wired | ❌ Not started |
| FastAPI routes | ❌ Not started |
| WebSocket | ❌ Not started |
| Frontend dashboard | ❌ Not started |
| LLM provider chosen | ❌ Not decided |

---

## Immediate Decision — Do This Before Writing Code

**Decide your LLM provider right now.** One team call. One vote. Done.

| Provider | Free Tier | Latency | Best For |
|---|---|---|---|
| Groq | Yes — 30 RPM free | Fastest (< 1s) | Hackathon demo |
| OpenAI GPT-4o-mini | Yes — $5 credit | Medium | Best explanations |
| Anthropic Claude Haiku | Yes — $5 credit | Medium | Structured output |

**Recommendation: Groq.** Fastest. Free. No card needed for basic tier.
Get API key at: `console.groq.com` — takes 2 minutes.

Add to `.env`:
```
LLM_PROVIDER=groq
GROQ_API_KEY=your_key_here
```

---

## 5-Day Build Plan

```
Day 1 — Foundations
Day 2 — ML Models + Detectors
Day 3 — Full Pipeline (upload → detect → score → explain → MongoDB)
Day 4 — API + WebSocket + Dashboard
Day 5 — Demo dry run + bug fixes
```

---

## Day 1 — Foundations

### Ommkar — container.py + main.py

This is the most critical file in the project.
`container.py` is the only place concrete implementations are imported.
Everything else depends on interfaces.

**backend/core/container.py**
```python
from core.events.event_bus import event_bus
from core.events.event_types import InputModality
from core.orchestrator import OrchestratorAgent
from scoring.scoring_agent import ThreatScoringAgent
from scoring.threat_scorer import ThreatScorer
from response.response_agent import ResponseAgent
from response.providers.groq_provider import GroqProvider
from db.mongodb import get_db
from db.repositories.threat_repository import ThreatRepository

# ── LLM Provider ──────────────────────────────────────────────────
llm = GroqProvider()

# ── Repository ────────────────────────────────────────────────────
threat_repo = ThreatRepository(get_db())

# ── Scoring ───────────────────────────────────────────────────────
scorer  = ThreatScorer()
scoring_agent = ThreatScoringAgent(bus=event_bus, scorer=scorer)

# ── Response ──────────────────────────────────────────────────────
response_agent = ResponseAgent(bus=event_bus, llm=llm, repository=threat_repo)

# ── Phishing ──────────────────────────────────────────────────────
# Dev 1 fills these in once detectors are ready
from agents.phishing.agent import PhishingAgent
phishing_agent = PhishingAgent(bus=event_bus, detectors={})

# ── Deepfake ──────────────────────────────────────────────────────
# Dev 2 fills these in
from agents.deepfake.agent import DeepfakeAgent
deepfake_agent = DeepfakeAgent(bus=event_bus, detectors={})

# ── Log Analysis ──────────────────────────────────────────────────
# Dev 3 fills these in
from agents.log_analysis.agent import LogAnalysisAgent
log_agent = LogAnalysisAgent(bus=event_bus, detectors={})

# ── Orchestrator ──────────────────────────────────────────────────
orchestrator = OrchestratorAgent(bus=event_bus)
```

**backend/main.py**
```python
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.events.event_bus import event_bus
from core.container import (
    orchestrator, phishing_agent, deepfake_agent,
    log_agent, scoring_agent, response_agent
)
from db.mongodb import connect_db, create_indexes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await event_bus.connect()
    await connect_db()
    await create_indexes()
    # Start all agent consumers in background
    asyncio.create_task(run_agent(orchestrator,  "cyberguard:raw.input"))
    asyncio.create_task(run_agent(phishing_agent,"cyberguard:phishing.input"))
    asyncio.create_task(run_agent(deepfake_agent,"cyberguard:deepfake.input"))
    asyncio.create_task(run_agent(log_agent,     "cyberguard:log.input"))
    asyncio.create_task(run_agent(scoring_agent, "cyberguard:threat.detected"))
    asyncio.create_task(run_agent(response_agent,"cyberguard:threat.scored"))
    yield
    # Shutdown — nothing needed

async def run_agent(agent, stream: str):
    """Infinite loop — consume from stream and call agent.reply()"""
    from agentscope.message import Msg
    group    = "cyberguard"
    consumer = agent.name
    await event_bus.create_consumer_group(stream, group)
    while True:
        try:
            events = await event_bus.consume(stream, group, consumer, count=5, block_ms=1000)
            for entry_id, threat_event in events:
                msg = Msg(name="system", content=threat_event.model_dump(), role="user")
                agent.reply(msg)
                await event_bus.ack(stream, group, entry_id)
        except Exception as e:
            print(f"[{agent.name}] Error: {e}")
            await asyncio.sleep(1)

app = FastAPI(title="CyberGuard API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
```

---

### Dev 4 — Three FastAPI Routes (Day 1 only)

Build only these three. Nothing else on Day 1.

**1. Health check**
```python
# api/routes/health.py
@router.get("/api/v1/health")
async def health():
    return {
        "status": "ok",
        "redis":   await check_redis(),
        "mongodb": await check_mongodb(),
    }
```

**2. File upload → Redis Stream**
```python
# api/routes/upload.py
@router.post("/api/v1/upload")
async def upload(
    file: UploadFile,
    modality: str = Form(...),   # email | url | image | video | audio | auth_log
):
    content = await file.read()
    event = ThreatEvent(
        modality=InputModality(modality),
        source="upload",
        payload={"filename": file.filename, "content_b64": base64.b64encode(content).decode()}
    )
    entry_id = await event_bus.publish("cyberguard:raw.input", event)
    return {"event_id": event.event_id, "status": "queued", "entry_id": entry_id}
```

**3. Get threats from MongoDB**
```python
# api/routes/threats.py
@router.get("/api/v1/threats")
async def get_threats(limit: int = 20, skip: int = 0):
    return await threat_repo.get_recent(limit=limit, skip=skip)
```

---

### Dev 5 — Dashboard Shell (Day 1 only)

Build layout + components with hardcoded mock data.
No API calls yet. No WebSocket yet.

```tsx
// Mock data to build against
const MOCK_THREAT = {
  event_id: "abc-123",
  category: "phishing",
  modality: "email",
  risk_level: "high",
  confidence: 0.94,
  label: "phishing",
  indicators: ["Domain spoofing", "Urgent language", "Credential request"],
  explanation: "High Risk: Sender domain closely resembles an authorised organisation...",
  recommended_actions: ["Quarantine email", "Warn user", "Block domain"],
  mitre_mapping: ["T1566.001", "T1598"],
}

const MOCK_STATS = {
  total_events: 1847,
  threats_detected: 234,
  by_category: { phishing: 145, deepfake: 61, log_anomaly: 28 },
  by_risk_level: { critical: 12, high: 47, medium: 89, low: 86 },
}
```

Components to build on Day 1:
- [ ] `RiskBadge.tsx` — 5 risk levels with color coding
- [ ] `ThreatCard.tsx` — single threat display
- [ ] `ThreatStats.tsx` — 4 counter cards
- [ ] `ExplainPanel.tsx` — explanation + indicators + actions
- [ ] `MitreBadge.tsx` — MITRE technique ID chip

---

## Day 2 — ML Models + Detectors

### Dev 1 — Phishing Models

Train three models and save them. Then implement detectors.

**Step 1: Train URL model**
```python
# backend/agents/phishing/models/train_url.py
import pandas as pd, joblib, os
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("data/phishing/url/processed/train.csv")

# Feature engineering
df["url_len"]     = df["url"].str.len()
df["domain_len"]  = df["domain"].str.len()
df["dot_count"]   = df["url"].str.count("\\.")
df["dash_count"]  = df["url"].str.count("-")
df["digit_count"] = df["url"].str.count(r"\d")
df["at_count"]    = df["url"].str.count("@")
df["has_ip"]      = df["url"].str.contains(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}").astype(int)
df["has_https"]   = df["url"].str.startswith("https").astype(int)
df["subdomain_count"] = df["domain"].str.count("\\.") - 1

FEATURES = ["url_len","domain_len","dot_count","dash_count",
            "digit_count","at_count","has_ip","has_https","subdomain_count"]

X = df[FEATURES]
y = df["label"]

from sklearn.model_selection import train_test_split
X_tr,X_te,y_tr,y_te = train_test_split(X,y,test_size=0.2,random_state=42)

model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
model.fit(X_tr, y_tr)
print(classification_report(y_te, model.predict(X_te)))

os.makedirs("data/models", exist_ok=True)
joblib.dump(model,    "data/models/url_classifier.pkl")
joblib.dump(FEATURES, "data/models/url_features.pkl")
print("Saved.")
```

**Step 2: Implement URLDetector**
```python
# agents/phishing/detectors/url_detector.py
import joblib, re
from urllib.parse import urlparse
from core.interfaces.base_detector import BaseDetector, DetectionResult

class URLDetector(BaseDetector):

    def __init__(self, model) -> None:
        super().__init__(model)
        self._features = joblib.load("data/models/url_features.pkl")

    def input_type(self) -> str:
        return "url"

    async def detect(self, payload: dict) -> DetectionResult:
        url    = payload.get("url","")
        domain = payload.get("domain","")

        feats = {
            "url_len":      len(url),
            "domain_len":   len(domain),
            "dot_count":    url.count("."),
            "dash_count":   url.count("-"),
            "digit_count":  len(re.findall(r"\d", url)),
            "at_count":     url.count("@"),
            "has_ip":       1 if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",url) else 0,
            "has_https":    1 if url.startswith("https") else 0,
            "subdomain_count": max(0, domain.count(".")-1),
        }

        import pandas as pd
        X = pd.DataFrame([feats])[self._features]
        result = await self._model.predict({"X": X})
        pred   = int(result["label"])
        proba  = float(result["confidence"])

        indicators = []
        if feats["has_ip"]:           indicators.append("IP address in URL")
        if feats["dash_count"] > 3:   indicators.append("Excessive dashes in URL")
        if feats["dot_count"] > 5:    indicators.append("Excessive subdomains")
        if not feats["has_https"]:    indicators.append("No HTTPS")
        if feats["at_count"] > 0:     indicators.append("@ symbol in URL")

        return DetectionResult(
            label="phishing" if pred else "safe",
            confidence=proba,
            indicators=indicators,
        )
```

**Repeat for Email and SMS** using same pattern.
Email model: use TF-IDF + Logistic Regression on `raw_text`.
SMS model: use TF-IDF + Naive Bayes on `sms_text`.

---

### Dev 2 — Deepfake Models

**Step 1: Train image model**
```python
# agents/deepfake/models/train_image.py
import torch, torchvision, os
from torchvision import transforms, models
from torch.utils.data import DataLoader, ImageFolder

TRAIN_DIR = "data/deepfake/image"   # has real/ and fake/ subfolders
SAVE_PATH = "data/models/deepfake_image.pth"

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
])

dataset = ImageFolder(TRAIN_DIR, transform=transform)
loader  = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=2)

model = models.efficientnet_b0(pretrained=True)
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 2)

device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model     = model.to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
criterion = torch.nn.CrossEntropyLoss()

for epoch in range(5):
    model.train()
    total_loss = correct = total = 0
    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()
        out  = model(imgs)
        loss = criterion(out, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        correct    += (out.argmax(1)==labels).sum().item()
        total      += labels.size(0)
    print(f"Epoch {epoch+1}: loss={total_loss/len(loader):.3f} acc={correct/total:.3f}")

os.makedirs("data/models", exist_ok=True)
torch.save(model.state_dict(), SAVE_PATH)
print(f"Saved to {SAVE_PATH}")
```

---

### Dev 3 — Log Anomaly Model

```python
# agents/log_analysis/models/train_log.py
import pandas as pd, joblib, os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("data/logs/auth/processed/logon.csv")

# Encode categorical columns
le_user   = LabelEncoder()
le_device = LabelEncoder()
le_act    = LabelEncoder()

df["user_enc"]   = le_user.fit_transform(df["user"].astype(str))
df["device_enc"] = le_device.fit_transform(df["device"].astype(str))
df["act_enc"]    = le_act.fit_transform(df["activity"].astype(str))

# Time features
df["hour"] = pd.to_datetime(df["timestamp"],errors="coerce").dt.hour.fillna(0)

FEATURES = ["user_enc","device_enc","act_enc","hour"]
X = df[FEATURES].fillna(0)

model = IsolationForest(contamination=0.1, random_state=42, n_jobs=-1)
model.fit(X)

# Score: -1=anomaly → 1, 1=normal → 0
df["pred"] = model.predict(X)
df["pred_label"] = (df["pred"] == -1).astype(int)

if "label" in df.columns:
    from sklearn.metrics import classification_report
    print(classification_report(df["label"], df["pred_label"]))

os.makedirs("data/models", exist_ok=True)
joblib.dump(model,     "data/models/log_isolation_forest.pkl")
joblib.dump(le_user,   "data/models/log_le_user.pkl")
joblib.dump(le_device, "data/models/log_le_device.pkl")
joblib.dump(le_act,    "data/models/log_le_act.pkl")
print("Saved.")
```

---

## Day 3 — Full Pipeline End to End

**Goal:** Upload a file → agent detects → scorer scores → LLM explains → MongoDB saved → event visible in GET /api/v1/threats

### Ommkar — ResponseAgent LLM implementation

```python
# response/providers/groq_provider.py
from groq import Groq
from core.interfaces.llm_provider import LLMProvider
from config import settings

class GroqProvider(LLMProvider):

    def __init__(self):
        self._client = Groq(api_key=settings.GROQ_API_KEY)

    async def explain(self, context: dict) -> str:
        prompt = f"""You are a cybersecurity analyst. Explain this threat in 2-3 sentences.
Category: {context['category']}
Modality: {context['modality']}
Risk Level: {context['risk_level']}
Confidence: {context['confidence']}
Indicators: {', '.join(context['indicators'])}
Score Factors: {', '.join(context['score_factors'])}

Write a clear explanation starting with the risk level. Be specific about why this is suspicious."""

        response = self._client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role":"user","content":prompt}],
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()

    async def recommend(self, threat: dict) -> list[str]:
        prompt = f"""Cybersecurity threat detected:
Category: {threat['category']}
Risk: {threat['risk_level']}
Explanation: {threat['explanation']}

List exactly 3 recommended response actions. One per line. Start each with an action verb."""

        response = self._client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role":"user","content":prompt}],
            max_tokens=150,
        )
        lines = response.choices[0].message.content.strip().splitlines()
        return [l.strip().lstrip("0123456789.-) ") for l in lines if l.strip()][:3]

    async def map_to_mitre(self, threat: dict) -> list[str]:
        MITRE_MAP = {
            "phishing":    ["T1566.001","T1598","T1078"],
            "deepfake":    ["T1566.004","T1036","T1656"],
            "log_anomaly": ["T1078","T1021","T1053"],
            "api_abuse":   ["T1190","T1110","T1059"],
        }
        return MITRE_MAP.get(str(threat.get("category","")), ["T1566"])
```

### Dev 4 — Demo Endpoint (Critical for demo day)

```python
# api/routes/demo.py
import json
from fastapi import APIRouter
from core.events.event_bus import event_bus
from core.events.event_types import ThreatEvent, InputModality

router = APIRouter()

DEMO_FILES = {
    "phishing_url":   "data/demo/phishing_url_samples.json",
    "phishing_email": "data/demo/phishing_email_samples.json",
    "phishing_sms":   "data/demo/phishing_sms_samples.json",
    "deepfake_image": "data/demo/deepfake_image_samples.json",
    "log_anomaly":    "data/demo/log_anomaly_samples.json",
}

MODALITY_MAP = {
    "phishing_url":   InputModality.URL,
    "phishing_email": InputModality.EMAIL,
    "phishing_sms":   InputModality.SMS,
    "deepfake_image": InputModality.IMAGE,
    "log_anomaly":    InputModality.AUTH_LOG,
}

@router.post("/api/v1/demo/run")
async def run_demo(scenario: str = "phishing_url"):
    """
    Loads demo samples and pushes them through the full pipeline.
    This is your demo day fallback button.
    """
    path = DEMO_FILES.get(scenario)
    if not path:
        return {"error": f"Unknown scenario: {scenario}"}

    with open(path) as f:
        data = json.load(f)

    samples = data.get("samples", [])[:5]  # Push 5 samples max
    event_ids = []

    for sample in samples:
        event = ThreatEvent(
            modality=MODALITY_MAP[scenario],
            source="demo",
            payload=sample["payload"],
        )
        await event_bus.publish("cyberguard:raw.input", event)
        event_ids.append(event.event_id)

    return {
        "status": "queued",
        "scenario": scenario,
        "events_queued": len(event_ids),
        "event_ids": event_ids,
    }
```

---

## Day 4 — WebSocket + Dashboard Live Data

### Dev 4 — WebSocket broadcaster

```python
# api/websocket.py
import asyncio, json
from fastapi import WebSocket, Query
from core.events.event_bus import event_bus
from api.routes.auth import get_current_user

connected_clients: list[WebSocket] = []

async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        await get_current_user(token)
    except Exception:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == '{"type":"ping"}':
                await websocket.send_text('{"type":"pong"}')
    except Exception:
        connected_clients.remove(websocket)

async def broadcast_completed_threats():
    """Background task — reads threat.complete stream and broadcasts."""
    group    = "websocket_broadcaster"
    consumer = "broadcaster_1"
    stream   = "cyberguard:threat.complete"
    await event_bus.create_consumer_group(stream, group)

    while True:
        try:
            events = await event_bus.consume(stream, group, consumer, count=10, block_ms=500)
            for entry_id, threat in events:
                msg = json.dumps({
                    "type":       "threat.complete",
                    "event_id":   threat.event_id,
                    "category":   threat.category,
                    "modality":   threat.modality,
                    "risk_level": threat.risk_level,
                    "confidence": threat.confidence,
                    "label":      threat.label,
                    "indicators": threat.indicators,
                    "explanation": threat.explanation,
                    "recommended_actions": threat.recommended_actions,
                    "mitre_mapping": threat.mitre_mapping,
                    "timestamp":  str(threat.created_at),
                })
                dead = []
                for client in connected_clients:
                    try:
                        await client.send_text(msg)
                    except Exception:
                        dead.append(client)
                for d in dead:
                    connected_clients.remove(d)
                await event_bus.ack(stream, group, entry_id)
        except Exception as e:
            await asyncio.sleep(1)
```

### Dev 5 — Connect dashboard to WebSocket

Replace mock data with real WebSocket stream.
Use the `useThreatStream` hook already defined in the master doc.

```tsx
// pages/index.tsx
import { useThreatStream } from '@/hooks/useThreatStream'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function Dashboard() {
  const token  = localStorage.getItem('token') ?? ''
  const { threats, connected } = useThreatStream(token)
  const { stats } = useDashboardStats(token)

  return (
    <main>
      <ThreatStats stats={stats} connected={connected} />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <AttackTimeline threats={threats} />
        <div className="space-y-3">
          {threats.map(t => <ThreatCard key={t.event_id} threat={t} />)}
        </div>
      </div>
    </main>
  )
}
```

---

## Day 5 — Demo Dry Run

Run the full demo three times. Fix everything that breaks.

### Demo Script (exactly what you do on demo day)

```
1. Open dashboard in browser
2. Open Postman / curl in second window
3. Hit POST /api/v1/demo/run?scenario=phishing_url
4. Watch dashboard — threat card should appear within 5 seconds
5. Hit POST /api/v1/demo/run?scenario=phishing_email
6. Watch dashboard — second threat card appears
7. Hit POST /api/v1/demo/run?scenario=log_anomaly
8. Watch dashboard — third threat card appears
9. Click any card — explanation panel opens
10. Show MITRE badge, risk score, recommended actions
```

### What to verify on Day 5

- [ ] All 3 demo scenarios show detection on dashboard
- [ ] Risk score appears on every card (not null)
- [ ] LLM explanation appears (not empty)
- [ ] MITRE mapping appears
- [ ] Recommended actions appear
- [ ] Dashboard stats counters update live
- [ ] WebSocket reconnects if browser tab is closed and reopened
- [ ] `/api/v1/health` returns ok for Redis and MongoDB
- [ ] `/api/v1/threats` returns last 20 events

---

## Ownership Matrix

| File | Owner | Due |
|---|---|---|
| `core/container.py` | Ommkar | Day 1 |
| `core/orchestrator.py` | Ommkar | Day 1 |
| `main.py` (lifespan + run_agent) | Ommkar | Day 1 |
| `response/providers/groq_provider.py` | Ommkar | Day 3 |
| `response/response_agent.py` | Ommkar | Day 3 |
| `agents/phishing/` (model + detector + agent) | Dev 1 | Day 2 |
| `agents/deepfake/` (model + detector + agent) | Dev 2 | Day 2 |
| `agents/log_analysis/` (model + detector + agent) | Dev 3 | Day 2 |
| `scoring/threat_scorer.py` | Dev 4 | Day 2 |
| `api/routes/` (upload, health, threats) | Dev 4 | Day 1 |
| `api/routes/demo.py` | Dev 4 | Day 3 |
| `api/websocket.py` | Dev 4 | Day 4 |
| `db/mongodb.py` + `db/repositories/` | Ommkar | Day 2 |
| `frontend/` shell + components | Dev 5 | Day 1 |
| `frontend/` live WebSocket integration | Dev 5 | Day 4 |

---

## Rules For The Next 5 Days

1. **Commit after every working feature.** Not after every file. After every feature that runs.
2. **Never push broken code to `dev` branch.** Your feature branch stays broken as long as needed. `dev` must always run.
3. **If blocked for more than 2 hours — message Ommkar.** Not tomorrow. Same day.
4. **Do not add features not in this document.** Voice cloning, graph analysis, extra ML models — all cut until Day 5 demo passes.
5. **Day 3 is the most important day.** End-to-end pipeline must work by end of Day 3. Everything else depends on it.

---

## Quick Test After Each Day

### After Day 1
```bash
cd backend
uvicorn main:app --reload
curl http://localhost:8000/api/v1/health
# Must return: {"status":"ok","redis":"ok","mongodb":"ok"}
```

### After Day 2
```bash
python -c "
from agents.phishing.agent import PhishingAgent
print('Phishing agent imports OK')
"
```

### After Day 3
```bash
curl -X POST http://localhost:8000/api/v1/demo/run?scenario=phishing_url
# Must return event_ids and status=queued
# Wait 5 seconds
curl http://localhost:8000/api/v1/threats
# Must return at least 1 completed threat with explanation
```

### After Day 4
```bash
# Open browser: http://localhost:3000
# Hit demo endpoint
# Watch threat card appear on dashboard without refresh
```

### After Day 5
```
All 3 demo scenarios run clean.
All dashboard elements populate.
Zero console errors.
You are ready.
```

---