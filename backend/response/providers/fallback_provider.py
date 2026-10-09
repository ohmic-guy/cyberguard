from ...core.interfaces.llm_provider import LLMProvider

EXPLANATION_TEMPLATES = {
    "phishing": "High Risk: The detected content exhibits {n} phishing indicators "
                "including {top_indicators}. Immediate action is recommended.",
    "deepfake": "High Risk: Visual/audio analysis detected {n} manipulation indicators. "
                "Content authenticity cannot be verified.",
    "log_anomaly": "High Risk: Behavioral analysis flagged {n} anomalous patterns "
                   "in the activity logs consistent with {attack_type} activity.",
}

class FallbackLLMProvider(LLMProvider):
    """Used when primary LLM provider is unavailable."""

    async def explain(self, context: dict) -> str:
        category = context.get("category", "")
        if hasattr(category, "value"):
            category = category.value
        
        tmpl = EXPLANATION_TEMPLATES.get(
            category, 
            "Threat detected with {n} indicators."
        )
        indicators = context.get("indicators", []) or []
        top_indicators = ", ".join([str(i) for i in indicators[:2]]) if indicators else "none"
        
        return tmpl.format(
            n=len(indicators),
            top_indicators=top_indicators,
            attack_type=category or "unknown",
        )

    async def recommend(self, threat: dict) -> list[str]:
        category = threat.category
        if hasattr(category, "value"):
            category = category.value
            
        DEFAULTS = {
            "phishing":    ["Quarantine message", "Block sender domain", "Warn user"],
            "deepfake":    ["Flag for manual review", "Do not share content", "Report to admin"],
            "log_anomaly": ["Revoke active session", "Reset credentials", "Notify SOC"],
        }
        return DEFAULTS.get(category, ["Escalate to security team"])

    async def map_to_mitre(self, threat: dict) -> list[str]:
        category = threat.category
        if hasattr(category, "value"):
            category = category.value
            
        MAP = {
            "phishing":    ["T1566.001"],
            "deepfake":    ["T1566.004"],
            "log_anomaly": ["T1078"],
        }
        return MAP.get(category, ["T1566"])
