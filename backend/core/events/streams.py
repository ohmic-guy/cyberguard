"""Canonical Redis Stream names for CyberGuard.

Import these constants instead of writing stream names inline.
"""


RAW_INPUT: str = "cyberguard:raw.input"
PHISHING_INPUT: str = "cyberguard:phishing.input"
DEEPFAKE_INPUT: str = "cyberguard:deepfake.input"
LOG_INPUT: str = "cyberguard:log.input"
THREAT_DETECTED: str = "cyberguard:threat.detected"
THREAT_SCORED: str = "cyberguard:threat.scored"
THREAT_COMPLETE: str = "cyberguard:threat.complete"
THREAT_ESCALATED: str = "cyberguard:threat.escalated"
