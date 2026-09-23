# CyberGuard — AI Development Rules

These rules apply to every AI coding session.

## 1. Source of Truth

Read these before making architectural changes:

1. `prd.md`
2. `implementation_plan.md`
3. `ai_rules.md`
4. The CyberGuard Master Developer Documentation v3.0
5. `task_today.md` for the current task

If two requirements appear to conflict, **STOP and ask**. Do not silently choose one.

## 2. Scope Control

- Work only on the current task.
- Do not modify unrelated modules.
- Do not perform opportunistic refactors.
- Do not add features outside the PRD.
- Do not create new architecture without approval.
- Before changing a file outside the task's allowed files, explain why it is necessary.

## 3. Architecture Rules

- Agents communicate through Redis Streams only.
- Agents must not call other agents directly.
- Concrete dependencies are wired in `backend/core/container.py`.
- Agents depend on interfaces, not concrete ML/LLM implementations.
- Detectors receive `BaseMLModel` through dependency injection.
- ResponseAgent receives `LLMProvider`.
- ThreatScoringAgent receives `BaseScorer`.
- Use the canonical stream constants from `core/events/streams.py`.
- Never hardcode Redis stream names inline.

## 4. ThreatEvent Rules

- `ThreatEvent` is the pipeline data contract.
- Never mutate a `ThreatEvent` in place.
- Always use `event.model_copy(update={...})`.
- Validate events at module boundaries.
- Do not pass arbitrary unvalidated dictionaries between core modules.

## 5. Async Rules

- Backend I/O is asynchronous.
- Use `async/await` for I/O.
- Never use `time.sleep()` in async code.
- Do not introduce blocking operations into async request/agent paths.

## 6. Error Rules

Every agent must escalate failures.

Never:

```python
except Exception:
    pass
```

Never silently log an exception and continue as if the event succeeded.

Expected pattern:

```text
Exception
  ↓
cyberguard:threat.escalated
  ↓
DLQ handling
```

## 7. Frontend Rules

- TypeScript strict mode.
- No `any`.
- Shared threat types must mirror backend contracts.
- WebSocket message handling must follow the finalized protocol.
- Do not invent frontend fields that are not part of the contract.

## 8. Database Rules

- Agents/detectors do not call MongoDB directly.
- Use injected repository objects.
- Do not modify collection schemas casually.
- Schema changes require documentation updates.

## 9. Coding Style

- Type hints on every function and method.
- Python files use `snake_case`.
- Python classes use `PascalCase`.
- Constants use `SCREAMING_SNAKE_CASE`.
- TypeScript components use `PascalCase`.
- Hooks use `useSomething` naming.
- One class per file unless classes are trivial related dataclasses.

## 10. AI Behaviour

Before writing code for a non-trivial task:

1. Inspect the relevant existing files.
2. Identify the interface/contract being implemented.
3. Explain the intended change briefly.
4. Make the smallest compatible implementation.
5. Run relevant tests/checks.
6. Report exactly what changed and what was verified.

Never claim a test passed unless it was actually run.

## 11. Verification

After a major phase:

- Update `testing.md` status.
- Run the relevant tests.
- Run an architecture audit.
- Update `audit.md`.
- Update `implementation_plan.md` only after verification.

## 12. Bug Fixing

When `bugs.md` contains a new bug:

**First diagnose. Then modify.**

The AI must identify:

- Reproduction
- Evidence
- Likely failure boundary
- Root cause hypothesis
- Smallest safe fix
- Verification method

Do not blindly change multiple files until the bug disappears.

## 13. Forbidden AI Behaviour

Do not:

- Rewrite the project from scratch.
- Replace Redis Streams with another communication pattern without approval.
- Remove interfaces to make implementation easier.
- Instantiate concrete ML models inside detectors.
- Instantiate concrete LLM providers inside ResponseAgent.
- Add direct database access to agents.
- Ignore failing tests.
- Delete tests because they are inconvenient.
- Mark tasks complete without verification.
