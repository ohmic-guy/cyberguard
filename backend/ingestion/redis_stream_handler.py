from typing import Any
from core.events.event_bus import EventBus, event_bus as global_event_bus
from core.events.event_types import ThreatEvent, InputModality, ThreatCategory, EventStatus
from core.events.streams import RAW_INPUT, THREAT_ESCALATED


class RedisStreamHandler:
    """Handles direct JSON stream ingestion, validates payload modality, and publishes to raw input stream."""

    def __init__(self, bus: EventBus | None = None) -> None:
        self._bus = bus or global_event_bus

    def infer_modality_and_category(self, payload: dict[str, Any]) -> tuple[InputModality, ThreatCategory]:
        """Infers modality and category from incoming JSON keys or explicit payload fields."""
        explicit_modality = payload.get("modality")
        if explicit_modality:
            try:
                modality = InputModality(str(explicit_modality).lower())
                explicit_cat = payload.get("category")
                if explicit_cat:
                    try:
                        category = ThreatCategory(str(explicit_cat).lower())
                        return modality, category
                    except ValueError:
                        pass

                # Infer category from modality
                if modality in (InputModality.EMAIL, InputModality.URL, InputModality.SMS, InputModality.QR):
                    return modality, ThreatCategory.PHISHING
                elif modality in (InputModality.IMAGE, InputModality.VIDEO, InputModality.AUDIO):
                    return modality, ThreatCategory.DEEPFAKE
                elif modality == InputModality.API_LOG:
                    return modality, ThreatCategory.API_ABUSE
                else:
                    return modality, ThreatCategory.LOG_ANOMALY
            except ValueError:
                pass

        # Key-based heuristics
        if "url" in payload or "domain" in payload:
            return InputModality.URL, ThreatCategory.PHISHING
        elif "sms_text" in payload or "phone_number" in payload:
            return InputModality.SMS, ThreatCategory.PHISHING
        elif "qr_code" in payload:
            return InputModality.QR, ThreatCategory.PHISHING
        elif "email" in payload or "subject" in payload or "body" in payload:
            return InputModality.EMAIL, ThreatCategory.PHISHING
        elif "auth_event" in payload or "failed_logins" in payload or "user_id" in payload:
            return InputModality.AUTH_LOG, ThreatCategory.LOG_ANOMALY
        elif "api_endpoint" in payload or "http_status" in payload:
            return InputModality.API_LOG, ThreatCategory.API_ABUSE

        return InputModality.SYSTEM_LOG, ThreatCategory.LOG_ANOMALY

    async def handle_stream(self, payload: dict[str, Any]) -> ThreatEvent:
        """Validates payload, creates ThreatEvent, publishes to cyberguard:raw.input, handles errors with escalation."""
        modality, category = self.infer_modality_and_category(payload)

        event = ThreatEvent(
            source="stream",
            modality=modality,
            category=category,
            payload=payload,
            status=EventStatus.RECEIVED,
        )

        try:
            await self._bus.publish(RAW_INPUT, event)
            return event
        except Exception as exc:
            escalated_event = event.model_copy(
                update={
                    "status": EventStatus.ESCALATED,
                    "error_message": str(exc),
                    "failed_agent": "RedisStreamHandler",
                }
            )
            await self._bus.publish(THREAT_ESCALATED, escalated_event)
            raise exc
