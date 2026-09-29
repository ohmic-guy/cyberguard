import base64
import os
from typing import Any
from fastapi import UploadFile
from core.events.event_bus import EventBus, event_bus as global_event_bus
from core.events.event_types import ThreatEvent, InputModality, ThreatCategory, EventStatus
from core.events.streams import RAW_INPUT, THREAT_ESCALATED


class FileUploadHandler:
    """Handles file ingestion, file type parsing, modality detection, and publishes to raw input stream."""

    def __init__(self, bus: EventBus | None = None) -> None:
        self._bus = bus or global_event_bus

    def detect_modality_and_category(
        self, filename: str, content_type: str | None = None
    ) -> tuple[InputModality, ThreatCategory]:
        """Maps filename extension and MIME content type to canonical InputModality and ThreatCategory."""
        ext = os.path.splitext(filename)[1].lower()
        content_type = (content_type or "").lower()

        # Email
        if ext in (".eml", ".msg") or "message/rfc822" in content_type:
            return InputModality.EMAIL, ThreatCategory.PHISHING

        # Image
        if ext in (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp") or "image/" in content_type:
            return InputModality.IMAGE, ThreatCategory.DEEPFAKE

        # Video
        if ext in (".mp4", ".avi", ".mov", ".mkv", ".webm") or "video/" in content_type:
            return InputModality.VIDEO, ThreatCategory.DEEPFAKE

        # Audio
        if ext in (".wav", ".mp3", ".flac", ".ogg", ".m4a") or "audio/" in content_type:
            return InputModality.AUDIO, ThreatCategory.DEEPFAKE

        # Log & text formats
        if ext in (".csv", ".log", ".txt", ".json"):
            filename_lower = filename.lower()
            if "auth" in filename_lower or "login" in filename_lower:
                return InputModality.AUTH_LOG, ThreatCategory.LOG_ANOMALY
            elif "api" in filename_lower or "access" in filename_lower or "http" in filename_lower:
                return InputModality.API_LOG, ThreatCategory.API_ABUSE
            else:
                return InputModality.SYSTEM_LOG, ThreatCategory.LOG_ANOMALY

        # Default fallback
        return InputModality.EMAIL, ThreatCategory.PHISHING

    async def handle_upload(self, file: UploadFile) -> ThreatEvent:
        """Reads file, builds ThreatEvent, publishes to cyberguard:raw.input, and handles errors with escalation."""
        filename = file.filename or "unknown_file"
        content_bytes = await file.read()

        modality, category = self.detect_modality_and_category(filename, file.content_type)

        # Parse text content or base64 encode binary content
        is_binary = modality in (InputModality.IMAGE, InputModality.VIDEO, InputModality.AUDIO)
        if is_binary:
            data_content = base64.b64encode(content_bytes).decode("utf-8")
        else:
            try:
                data_content = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                data_content = base64.b64encode(content_bytes).decode("utf-8")

        payload: dict[str, Any] = {
            "filename": filename,
            "content_type": file.content_type,
            "file_size": len(content_bytes),
            "data": data_content,
        }

        event = ThreatEvent(
            source="upload",
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
                    "failed_agent": "FileUploadHandler",
                }
            )
            await self._bus.publish(THREAT_ESCALATED, escalated_event)
            raise exc
