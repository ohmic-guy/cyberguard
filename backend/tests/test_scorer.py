from core.events.event_types import ThreatEvent, RiskLevel, InputModality
from scoring.threat_scorer import ThreatScorer

def test_risk_scoring_thresholds():
    scorer = ThreatScorer()
    
    # Test confidence brackets according to Section 19
    test_cases = [
        (0.15, RiskLevel.SAFE),
        (0.40, RiskLevel.LOW),
        (0.65, RiskLevel.MEDIUM),
        (0.85, RiskLevel.HIGH),
        (0.95, RiskLevel.CRITICAL),
    ]
    
    for conf, expected_level in test_cases:
        event = ThreatEvent(
            modality=InputModality.EMAIL,
            source="upload",
            confidence=conf,
            payload={"text": "test"}
        )
        risk, returned_conf = scorer.score(event)
        assert risk == expected_level, f"Failed for conf {conf}: got {risk}, expected {expected_level}"
        assert returned_conf == conf
        
        explanations = scorer.explain_score(event)
        assert len(explanations) >= 1, "Explanations list should not be empty"

if __name__ == "__main__":
    test_risk_scoring_thresholds()
    print("ThreatScorer unit tests passed successfully!")