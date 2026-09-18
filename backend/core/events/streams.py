from enum import Enum


class StreamName(str, Enum):
    """Canonical Redis stream names used by CyberGuard."""

    RAW_INPUT = "cyberguard:raw.input"
    PHISHING_INPUT = "cyberguard:phishing.input"
    DEEPFAKE_INPUT = "cyberguard:deepfake.input"
    LOG_INPUT = "cyberguard:log.input"
    THREAT_DETECTED = "cyberguard:threat.detected"
    THREAT_SCORED = "cyberguard:threat.scored"
    THREAT_COMPLETE = "cyberguard:threat.complete"
    THREAT_ESCALATED = "cyberguard:threat.escalated"


RAW_INPUT = StreamName.RAW_INPUT.value
PHISHING_INPUT = StreamName.PHISHING_INPUT.value
DEEPFAKE_INPUT = StreamName.DEEPFAKE_INPUT.value
LOG_INPUT = StreamName.LOG_INPUT.value
THREAT_DETECTED = StreamName.THREAT_DETECTED.value
THREAT_SCORED = StreamName.THREAT_SCORED.value
THREAT_COMPLETE = StreamName.THREAT_COMPLETE.value
THREAT_ESCALATED = StreamName.THREAT_ESCALATED.value
