INDIA_PATTERNS = {
    "digital_arrest": {
        "keywords": ["aadhaar", "cbi", "ed officer", "digital arrest",
                     "supreme court", "money laundering", "upi transfer",
                     "avoid arrest", "penalty"],
        "risk_boost": 0.30,
        "mitre":      ["T1566.001", "T1657"],
        "indicator":  "Digital Arrest Scam pattern detected — India-specific threat",
    },
    "sim_swap": {
        "keywords": ["kyc update", "sim blocked", "reactivate",
                     "share otp", "bank executive", "verify number"],
        "risk_boost": 0.25,
        "mitre":      ["T1078", "T1111"],
        "indicator":  "SIM Swap social engineering pattern detected",
    },
    "pig_butchering": {
        "keywords": ["investment platform", "uncle introduced",
                     "crypto profit", "processing fee",
                     "withdraw earnings", "private exchange"],
        "risk_boost": 0.35,
        "mitre":      ["T1657", "T1566"],
        "indicator":  "Pig Butchering romance-crypto scam pattern detected",
    },
    "upi_fraud": {
        "keywords": ["upi", "gpay", "phonepe", "paytm",
                     "cashback", "collect request", "pay to receive"],
        "risk_boost": 0.20,
        "mitre":      ["T1657"],
        "indicator":  "UPI payment fraud pattern detected",
    },
}

def scan_india_patterns(text: str) -> list[dict]:
    """Returns list of matched India-specific threat patterns."""
    text_lower = text.lower()
    matches    = []
    for threat_type, config in INDIA_PATTERNS.items():
        hits = [kw for kw in config["keywords"] if kw in text_lower]
        if len(hits) >= 2:    # At least 2 keywords must match
            matches.append({
                "type":      threat_type,
                "hits":      hits,
                "boost":     config["risk_boost"],
                "mitre":     config["mitre"],
                "indicator": config["indicator"],
            })
    return matches
