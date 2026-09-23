# CyberGuard — Current Task

> Replace this file for each focused development session.

## Current Task

**Title:** Complete Ommkar orchestration and Dev 1 phishing foundations

## Goal

Implement the shared orchestration boundary and the phishing detection path using the existing ThreatEvent, BaseDetector, BaseMLModel, EventBus, and canonical stream contracts.

## Context

Read:

- `@prd.md`
- `@ai_rules.md`
- `@implementation_plan.md`
- CyberGuard Master Developer Documentation v3.0
- Relevant source files

## Allowed Files

Only modify:

- 

## Required Behaviour

- [ ] Route supported input modalities to the correct canonical stream and escalate unknown modalities.
- [ ] Implement phishing detectors for email, URL, SMS, and QR inputs through injected BaseMLModel instances.
- [ ] Process phishing events into immutable detected events and escalate detector failures.

## Acceptance Criteria

- [ ] No agent-to-agent calls or inline Redis stream names are introduced.
- [ ] Valid phishing events produce label, confidence, and indicators on `threat.detected`.
- [ ] Operational failures produce `threat.escalated` events with the failed agent and error message.

## Tests / Verification

- [ ] Run Python compilation/static validation for changed backend files.
- [ ] Run focused detector and routing checks with injected fake dependencies.

## Forbidden Changes

- Do not modify unrelated modules.
- Do not change public contracts without approval.
- Do not add unrequested features.
- Do not bypass dependency injection.
- Do not bypass Redis Streams.

## Completion Report

When finished, report:

1. Files changed
2. What changed
3. Tests actually run
4. Test results
5. Remaining issues
6. Whether this task is safe to mark complete
