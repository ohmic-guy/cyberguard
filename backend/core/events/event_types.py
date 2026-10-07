from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import TypeAlias
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator


EventPayload: TypeAlias = dict[str, object]
EventMetadata: TypeAlias = dict[str, object]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ThreatCategory(str, Enum):
    PHISHING = "phishing"
    DEEPFAKE = "deepfake"
    LOG_ANOMALY = "log_anomaly"
    API_ABUSE = "api_abuse"
    UNKNOWN = "unknown"


class InputModality(str, Enum):
    EMAIL = "email"
    URL = "url"
    SMS = "sms"
    QR = "qr"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    AUTH_LOG = "auth_log"
    SYSTEM_LOG = "system_log"
    API_LOG = "api_log"


class RiskLevel(str, Enum):
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EventStatus(str, Enum):
    RECEIVED = "received"
    PROCESSING = "processing"
    SCORED = "scored"
    COMPLETE = "complete"
    ESCALATED = "escalated"
    FAILED = "failed"


class ThreatEvent(BaseModel):
    """Core event envelope passed between CyberGuard components.

    Treat instances as immutable and use model_copy(update={...}) for state
    transitions so pipeline steps do not mutate shared event references.
    """

    model_config = ConfigDict(extra="forbid", use_enum_values=False)

    event_id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    category: ThreatCategory = ThreatCategory.UNKNOWN
    modality: InputModality
    status: EventStatus = EventStatus.RECEIVED
    source: str
    payload: EventPayload
    label: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    indicators: list[str] = Field(default_factory=list)
    risk_level: RiskLevel | None = None
    score_factors: list[str] = Field(default_factory=list)
    explanation: str | None = None
    recommended_actions: list[str] = Field(default_factory=list)
    mitre_mapping: list[str] = Field(default_factory=list)
    error_message: str | None = None
    failed_agent: str | None = None

    @field_validator("created_at", "updated_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
            raise ValueError("datetime values must be timezone-aware")
        return value
