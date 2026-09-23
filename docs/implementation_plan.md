# CyberGuard — Implementation Plan

> Execute one phase at a time. Do not ask the AI to build the whole application in one pass.

---

## Phase 0 — Repository and Contract Baseline

### Goal
Establish the repository structure and architecture contracts before feature implementation.

### Tasks

- [ ] Confirm backend/frontend folder structure.
- [ ] Create core interfaces.
- [ ] Create event schema definitions.
- [ ] Create canonical Redis stream constants.
- [ ] Create configuration layer.
- [ ] Establish dependency-injection boundary in `core/container.py`.

### Acceptance Criteria

- All base interfaces exist.
- `ThreatEvent` exists and validates.
- No concrete implementations are required by interfaces.
- Stream names have one canonical source.

---

## Phase 1 — Infrastructure

### Goal
Make local infrastructure reproducible.

### Tasks

- [ ] Docker Compose for MongoDB.
- [ ] Docker Compose for Redis.
- [ ] Backend environment configuration.
- [ ] Frontend environment configuration.
- [ ] Health checks.
- [ ] Basic startup verification.

### Acceptance Criteria

- MongoDB starts.
- Redis starts.
- Backend starts.
- `/api/v1/health` reports infrastructure status.

---

## Phase 2 — Event System

### Goal
Build the Redis Streams event backbone.

### Tasks

- [ ] Implement `EventBus`.
- [ ] Connect/disconnect Redis asynchronously.
- [ ] Implement publish.
- [ ] Implement consumer-group consumption.
- [ ] Implement acknowledgement.
- [ ] Implement consumer-group creation.
- [ ] Add tests for serialization/deserialization.

### Acceptance Criteria

- `ThreatEvent` can travel through Redis Streams.
- Consumer groups work.
- Messages can be acknowledged.
- Stream constants are used everywhere.

---

## Phase 3 — Orchestrator

### Goal
Route raw events to the correct domain agent.

### Tasks

- [ ] Implement `OrchestratorAgent`.
- [ ] Implement modality routing.
- [ ] Handle unknown modality.
- [ ] Implement escalation/DLQ handling.
- [ ] Persist escalations through the repository boundary.

### Acceptance Criteria

- Email/URL/SMS/QR → phishing stream.
- Image/video/audio → deepfake stream.
- Auth/system/API logs → log stream.
- Unknown routes escalate.

---

## Phase 4 — Phishing Pipeline

### Goal
Complete the primary phishing scenario.

### Tasks

- [ ] Implement `PhishingAgent`.
- [ ] Implement detector interfaces/adapters.
- [ ] Implement email detector.
- [ ] Implement URL detector.
- [ ] Implement SMS detector.
- [ ] Implement QR detector.
- [ ] Integrate selected demo ML models.
- [ ] Add dataset/preprocessing workflow.
- [ ] Add unit tests.

### Acceptance Criteria

A phishing event produces:

- [ ] Label
- [ ] Confidence
- [ ] Indicators
- [ ] `threat.detected` event
- [ ] Escalation on failure

---

## Phase 5 — Threat Scoring

### Goal
Convert detection output into risk.

### Tasks

- [ ] Implement `ThreatScorer`.
- [ ] Implement documented risk thresholds.
- [ ] Implement score-factor generation.
- [ ] Implement `ThreatScoringAgent`.
- [ ] Add tests around threshold boundaries.

### Acceptance Criteria

Every valid detection produces:

- [ ] Risk level
- [ ] Risk confidence
- [ ] Score factors
- [ ] `threat.scored` event

---

## Phase 6 — Response / LLM

### Goal
Generate explanation, response actions, and MITRE mapping.

### Tasks

- [ ] Implement `LLMProvider`.
- [ ] Implement selected provider.
- [ ] Keep provider behind interface.
- [ ] Implement `ResponseAgent`.
- [ ] Generate explanation.
- [ ] Generate recommended actions.
- [ ] Generate MITRE mapping.

### Acceptance Criteria

A scored event receives all three LLM outputs and is passed onward as complete.

---

## Phase 7 — MongoDB Persistence

### Goal
Persist complete threats and escalations.

### Tasks

- [ ] Implement MongoDB connection.
- [ ] Implement indexes.
- [ ] Implement threat repository.
- [ ] Implement session repository.
- [ ] Implement escalation persistence.

### Acceptance Criteria

- Complete events are persisted.
- Escalated events are persisted.
- Required indexes exist.
- TTL indexes behave as documented.

---

## Phase 8 — FastAPI and Ingestion

### Goal
Expose authenticated API entry points.

### Tasks

- [ ] JWT authentication.
- [ ] `/api/v1/upload`.
- [ ] `/api/v1/stream/ingest`.
- [ ] `/api/v1/threats`.
- [ ] `/api/v1/threats/{event_id}`.
- [ ] `/api/v1/dashboard/stats`.
- [ ] `/api/v1/health`.

### Acceptance Criteria

- Protected routes reject unauthenticated requests.
- Login issues a JWT.
- Upload/stream ingestion creates valid events.
- Threat queries return persisted data.

---

## Phase 9 — WebSocket

### Goal
Deliver completed/escalated events to the dashboard in real time.

### Tasks

- [ ] Finalize WebSocket contract between Dev 4 and Dev 5.
- [ ] Implement authenticated connection.
- [ ] Implement `threat.complete`.
- [ ] Implement `threat.escalated`.
- [ ] Implement `stats.update`.
- [ ] Implement ping/pong.
- [ ] Add reconnect handling where appropriate.

### Acceptance Criteria

- Dashboard receives completed events.
- Dashboard receives escalations.
- Keep-alive works.
- Backend/frontend message schema agrees.

---

## Phase 10 — Dashboard

### Goal
Build the unified threat monitoring interface.

### Tasks

- [ ] Shared TypeScript threat types.
- [ ] WebSocket provider.
- [ ] Threat stream hook.
- [ ] Threat cards.
- [ ] Risk badges.
- [ ] Explain panel.
- [ ] MITRE badge.
- [ ] Threat statistics.
- [ ] Attack timeline.
- [ ] Action panel.
- [ ] Phishing panel.
- [ ] Deepfake panel.
- [ ] Log panel.

### Acceptance Criteria

- Real-time events appear.
- Risk levels are visually distinguishable.
- Explanations and actions are readable.
- Escalations are clearly surfaced.
- No TypeScript `any`.

---

## Phase 11 — Deepfake Pipeline

### Goal
Complete the primary deepfake scenario.

### Tasks

- [ ] DeepfakeAgent.
- [ ] Image detector.
- [ ] Video detector.
- [ ] Audio detector.
- [ ] Model adapter.
- [ ] Dataset/demo preprocessing.
- [ ] Tests.

### Acceptance Criteria

Image/video/audio events complete the common pipeline.

---

## Phase 12 — Log Analysis Pipeline

### Goal
Complete the primary log anomaly scenario.

### Tasks

- [ ] LogAnalysisAgent.
- [ ] Auth log detector.
- [ ] System log detector.
- [ ] Behaviour detector.
- [ ] Isolation Forest/model adapter.
- [ ] Dataset/demo preprocessing.
- [ ] Tests.

### Acceptance Criteria

Log events complete the common pipeline.

---

## Phase 13 — End-to-End Integration

### Goal
Verify all three primary scenarios as complete pipelines.

### Tasks

- [ ] Phishing E2E.
- [ ] Deepfake E2E.
- [ ] Log anomaly E2E.
- [ ] Escalation E2E.
- [ ] MongoDB verification.
- [ ] WebSocket verification.
- [ ] Dashboard verification.

### Acceptance Criteria

No primary scenario stops before the six required outputs.

---

## Phase 14 — Demo Hardening

### Goal
Make the system reliable for the demonstration.

### Tasks

- [ ] Remove dead/orphan files.
- [ ] Verify environment variables.
- [ ] Verify startup sequence.
- [ ] Verify sample datasets.
- [ ] Verify demo inputs.
- [ ] Verify error paths.
- [ ] Verify dashboard state.
- [ ] Run complete test checklist.
- [ ] Run architecture audit.

### Acceptance Criteria

- `main` contains only demo-ready code.
- All three primary scenarios are demonstrable.
- No known critical architectural violation remains.
- No half-integrated feature is presented.

---

## Phase 15 — Optional Features

Only start this phase if:

1. All three primary scenarios are demo-ready.
2. Testing is complete.
3. Audit is clean.
4. Sufficient time remains.

### Voice Cloning

Voice Cloning is explicitly secondary. Do not begin it while any primary scenario is incomplete.
