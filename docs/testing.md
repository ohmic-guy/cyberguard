# CyberGuard — Testing & QA Checklist

> A feature is not complete until its intended behaviour is verified.

---

# 1. Infrastructure

- [ ] MongoDB starts.
- [ ] Redis starts.
- [ ] Backend starts.
- [ ] Frontend starts.
- [ ] `/api/v1/health` works.
- [ ] Required environment variables are present.

# 2. Authentication

- [ ] Valid credentials return JWT.
- [ ] Invalid credentials are rejected.
- [ ] Protected REST routes reject missing token.
- [ ] Invalid/expired JWT is rejected.
- [ ] WebSocket authentication rejects invalid token.

# 3. Event Bus

- [ ] Event serializes correctly.
- [ ] Event deserializes correctly.
- [ ] Consumer group can consume.
- [ ] Message acknowledgement works.
- [ ] Unknown/invalid event handling is tested.

# 4. Orchestrator

- [ ] Email routes to phishing.
- [ ] URL routes to phishing.
- [ ] SMS routes to phishing.
- [ ] QR routes to phishing.
- [ ] Image routes to deepfake.
- [ ] Video routes to deepfake.
- [ ] Audio routes to deepfake.
- [ ] Auth log routes to log analysis.
- [ ] System log routes to log analysis.
- [ ] API log routes to log analysis.
- [ ] Unknown modality escalates.

# 5. Phishing E2E

- [ ] Email input accepted.
- [ ] URL input accepted.
- [ ] SMS input accepted.
- [ ] QR input accepted.
- [ ] Detector produces label.
- [ ] Confidence is produced.
- [ ] Indicators are produced.
- [ ] `threat.detected` is published.
- [ ] Risk score is produced.
- [ ] Explanation is produced.
- [ ] Recommended actions are produced.
- [ ] MITRE mapping is produced.
- [ ] Event is persisted.
- [ ] `threat.complete` is published.
- [ ] Dashboard receives event.

# 6. Deepfake E2E

- [ ] Image input accepted.
- [ ] Video input accepted.
- [ ] Audio input accepted.
- [ ] Detector produces label.
- [ ] Confidence is produced.
- [ ] Indicators are produced.
- [ ] Risk score is produced.
- [ ] Explanation is produced.
- [ ] Recommended actions are produced.
- [ ] MITRE mapping is produced.
- [ ] Event is persisted.
- [ ] Dashboard receives event.

# 7. Log Anomaly E2E

- [ ] Auth log accepted.
- [ ] System log accepted.
- [ ] Behaviour/API-related log accepted where supported.
- [ ] Anomaly label is produced.
- [ ] Confidence is produced.
- [ ] Indicators are produced.
- [ ] Risk score is produced.
- [ ] Explanation is produced.
- [ ] Recommended actions are produced.
- [ ] Event is persisted.
- [ ] Dashboard receives event.

# 8. Risk Scoring

Test threshold boundaries:

- [ ] 0.00
- [ ] 0.30
- [ ] 0.55
- [ ] 0.75
- [ ] 0.90
- [ ] 1.00

Verify the implementation follows the documented risk ranges.

# 9. Error / Escalation Testing

For each agent:

- [ ] Force a controlled exception.
- [ ] Exception publishes `cyberguard:threat.escalated`.
- [ ] Failed agent is recorded.
- [ ] Error message is recorded.
- [ ] Escalation is persisted.
- [ ] Dashboard receives escalation.
- [ ] No silent failure occurs.

# 10. WebSocket

- [ ] Authenticated connection works.
- [ ] `threat.complete` received.
- [ ] `threat.escalated` received.
- [ ] `stats.update` received where implemented.
- [ ] Ping sent every 30 seconds.
- [ ] Pong handled.
- [ ] Connection cleanup works.

# 11. Database

- [ ] Threat saved.
- [ ] Event ID unique.
- [ ] Required indexes exist.
- [ ] Threat query works.
- [ ] Single-threat query works.
- [ ] Escalation saved.
- [ ] TTL behaviour verified.

# 12. Frontend

- [ ] Threat stream renders.
- [ ] Risk badge renders all levels.
- [ ] Explanation renders.
- [ ] Indicators render.
- [ ] Recommended actions render.
- [ ] MITRE mapping renders.
- [ ] Escalation state renders.
- [ ] No TypeScript `any`.
- [ ] No browser console errors during normal flow.

# 13. Regression

Before a demo build:

- [ ] Backend tests pass.
- [ ] Frontend checks pass.
- [ ] E2E tests pass.
- [ ] Three primary scenarios pass.
- [ ] Error path passes.
- [ ] WebSocket passes.
- [ ] Dashboard passes.
- [ ] Architecture audit passes.

# 14. Demo Run

## Scenario 1 — Phishing

- [ ] Prepare known demo input.
- [ ] Submit.
- [ ] Show detection.
- [ ] Show risk.
- [ ] Show explanation.
- [ ] Show recommended action.
- [ ] Show MITRE mapping.
- [ ] Show dashboard event.

## Scenario 2 — Deepfake

- [ ] Prepare known demo input.
- [ ] Submit.
- [ ] Show result.
- [ ] Show explanation/action.
- [ ] Show dashboard event.

## Scenario 3 — Log Anomaly

- [ ] Prepare known demo input.
- [ ] Submit.
- [ ] Show anomaly.
- [ ] Show risk.
- [ ] Show explanation/action.
- [ ] Show dashboard event.
