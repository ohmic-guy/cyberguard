# CyberGuard — Product Requirements Document

> **Document role:** Product North Star  
> **Technical source of truth:** CyberGuard Master Developer Documentation v3.0  
> **Rule:** If a proposed feature conflicts with this document or the Master Developer Documentation, stop and ask before implementing it.

---

## 1. Product

**CyberGuard** is an agentic AI cybersecurity platform built on AgentScope 1.0.21.

It detects, classifies, scores, explains, alerts on, and recommends responses to cyber threats through an event-driven multi-agent pipeline.

The system is designed around replaceable components behind interfaces. Concrete implementations must not leak into agents or detectors.

## 2. Core Problem

Security teams need a unified way to inspect multiple threat modalities and receive an understandable, actionable result instead of isolated model predictions.

CyberGuard must turn an incoming security event into a complete threat outcome:

**Detection → Classification → Risk Score → LLM Explanation → Alert → Response Action**

Partial pipelines are not acceptable for the demo.

## 3. Target Users

Primary users:

- Cybersecurity analysts
- Security operations / SOC teams
- Researchers and evaluators
- Hackathon/demo users

The product must make threat results understandable without requiring the user to inspect internal model output.

## 4. MVP / Required Demo Scope

### Scenario 01 — Phishing Detection

Inputs:

- Email
- URL
- SMS
- QR code

Expected capabilities:

- Detect phishing indicators
- Produce classification and confidence
- Produce risk score
- Explain the result
- Recommend response actions
- Map relevant MITRE ATT&CK techniques
- Surface the result on the dashboard

### Scenario 02 — Deepfake Detection

Inputs:

- Image
- Video frame
- Audio

Expected capabilities:

- Detect manipulation indicators
- Produce classification and confidence
- Produce risk score
- Explain the result
- Recommend response actions
- Map relevant MITRE ATT&CK techniques
- Surface the result on the dashboard

### Scenario 03 — Log Anomaly Detection

Inputs:

- Authentication logs
- System logs
- Behavioural/API-related logs as defined by the implementation

Expected capabilities:

- Detect anomalous behaviour
- Produce classification and confidence
- Produce risk score
- Explain the result
- Recommend response actions
- Map relevant MITRE ATT&CK techniques where applicable
- Surface the result on the dashboard

## 5. Core User Experience

The dashboard is the unified monitoring surface.

A completed event should expose, at minimum:

- Event ID
- Category
- Input modality
- Risk level
- Confidence
- Detection label
- Indicators
- Human-readable explanation
- Recommended actions
- MITRE ATT&CK mapping
- Event status

Real-time threat updates are delivered through WebSocket.

## 6. Core Architecture

Every input follows the common event-driven pipeline:

```text
Input
  ↓
Ingestion Layer
  ↓
Redis: cyberguard:raw.input
  ↓
OrchestratorAgent
  ↓
Domain Agent
  ↓
Redis: cyberguard:threat.detected
  ↓
ThreatScoringAgent
  ↓
Redis: cyberguard:threat.scored
  ↓
ResponseAgent
  ↓
MongoDB
  ↓
Redis: cyberguard:threat.complete
  ↓
WebSocket
  ↓
Dashboard
```

Agents must not call other agents directly.

Redis Streams is the inter-agent communication mechanism.

## 7. Design Principles

CyberGuard must preserve:

- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

Concrete implementations are wired through `backend/core/container.py`.

Agents and detectors depend on abstractions.

## 8. MVP Data Contract

`ThreatEvent` is the single event contract across the pipeline.

It contains:

- Identity
- Classification
- Detection outputs
- Scoring outputs
- LLM outputs
- Error/escalation information

Never mutate a `ThreatEvent` in place. Use:

```python
event.model_copy(update={...})
```

## 9. Risk Levels

The documented confidence ranges are:

| Risk | Confidence | Meaning |
|---|---:|---|
| SAFE | 0.00–0.30 | No threat indicators |
| LOW | 0.30–0.55 | Suspicious but inconclusive |
| MEDIUM | 0.55–0.75 | Probable threat |
| HIGH | 0.75–0.90 | Likely threat |
| CRITICAL | 0.90–1.00 | Confirmed threat |

## 10. Error Behaviour

Failures must not disappear silently.

When an agent fails:

```text
Agent Exception
    ↓
cyberguard:threat.escalated
    ↓
Orchestrator DLQ Handler
    ↓
MongoDB escalations
    ↓
WebSocket
    ↓
Dashboard red alert
```

Every agent exception must publish an escalation event.

## 11. Security / Access

API routes require JWT authentication except:

- `/api/v1/auth/login`
- `/api/v1/health`

WebSocket connections use the documented JWT query-parameter mechanism.

Secrets must come from environment configuration.

## 12. Out of Scope

Do **not** expand the MVP into unrelated security products.

Specifically:

- Do not build Voice Cloning before the three primary scenarios are demo-ready.
- Do not add half-integrated features close to demo time.
- Do not replace the event-driven architecture with direct agent-to-agent calls.
- Do not bypass the defined interfaces.
- Do not introduce concrete dependencies into agents/detectors.
- Do not rewrite working modules merely for stylistic reasons.
- Do not add speculative features because an AI coding agent suggests them.

## 13. Definition of Done

A feature is not complete because code was generated.

It is complete only when:

- The implementation follows the architecture.
- The relevant interface contracts are respected.
- Tests pass.
- The feature works through its intended event flow.
- Errors escalate correctly.
- Relevant dashboard behaviour works.
- `audit.md` shows no unresolved architectural violation.
- The corresponding implementation-plan checkbox can be honestly marked complete.
