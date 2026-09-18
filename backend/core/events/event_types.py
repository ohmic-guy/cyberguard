from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
import uuid

class ThreatCategory(str, Enum):
    PHISHING    = "phishing"
    DEEPFAKE    = "deepfake"
    LOG_ANOMALY = "log_anomaly"
    API_ABUSE   = "api_abuse"
    UNKNOWN     = "unknown"

class InputModality(str, Enum):
    EMAIL      = "email"
    URL        = "url"
    SMS        = "sms"
    QR         = "qr"
    IMAGE      = "image"
    VIDEO      = "video"
    AUDIO      = "audio"
    AUTH_LOG   = "auth_log"
    SYSTEM_LOG = "system_log"
    API_LOG    = "api_log"

class RiskLevel(str, Enum):
    SAFE     = "safe"
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"

class EventStatus(str, Enum):
    RECEIVED   = "received"
    PROCESSING = "processing"
    SCORED     = "scored"
    COMPLETE   = "complete"
    ESCALATED  = "escalated"
    FAILED     = "failed"

class ThreatEvent(BaseModel):
    event_id:   str      = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    category:   ThreatCategory = ThreatCategory.UNKNOWN
    modality:   InputModality
    status:     EventStatus    = EventStatus.RECEIVED
    source:     str
    payload:    dict
    label:               str | None   = None
    confidence:          float | None = None
    indicators:          list[str]    = []
    risk_level:          RiskLevel | None = None
    score_factors:       list[str]    = []
    explanation:         str | None   = None
    recommended_actions: list[str]    = []
    mitre_mapping:       list[str]    = []
    error_message:       str | None   = None
    failed_agent:        str | None   = None
