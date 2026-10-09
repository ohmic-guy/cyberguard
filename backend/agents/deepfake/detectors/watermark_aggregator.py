import asyncio, base64, io
from PIL import Image
from ....core.interfaces.base_detector import BaseDetector, DetectionResult
from .c2pa_detector import C2PADetector
from .invisible_watermark_detector import InvisibleWatermarkDetector
from .exif_analyzer import EXIFAnalyzer


# Weight of each detector in final score
WEIGHTS = {
    "c2pa":       0.40,   # Highest weight — cryptographic proof
    "watermark":  0.30,   # Medium — pattern-based
    "exif":       0.30,   # Medium — metadata heuristics
}

# If C2PA says "authentic" with high confidence — trust it
C2PA_TRUST_THRESHOLD = 0.90


class WatermarkAggregator(BaseDetector):
    """
    Runs C2PA, InvisibleWatermark, and EXIF detectors in parallel.
    Aggregates results into a single weighted DetectionResult.
    This is the entry point for all image provenance checks.
    """

    def __init__(self, model) -> None:
        super().__init__(model)
        # Sub-detectors do not need a model — pass None
        self._c2pa      = C2PADetector(model=None)
        self._watermark = InvisibleWatermarkDetector(model=None)
        self._exif      = EXIFAnalyzer(model=None)

    def input_type(self) -> str:
        return "image"

    async def detect(self, payload: dict) -> DetectionResult:

        # ── Run all three in parallel ─────────────────────────────────
        c2pa_res, wm_res, exif_res = await asyncio.gather(
            self._c2pa.detect(payload),
            self._watermark.detect(payload),
            self._exif.detect(payload),
            return_exceptions=True,
        )

        # Handle any exceptions from sub-detectors
        def safe(result, name):
            if isinstance(result, Exception):
                return DetectionResult(
                    label="unknown", confidence=0.5,
                    indicators=[f"{name} sub-detector error: {str(result)[:80]}"])
            return result

        c2pa_res = safe(c2pa_res, "C2PA")
        wm_res   = safe(wm_res,   "InvisibleWatermark")
        exif_res = safe(exif_res, "EXIF")

        # ── C2PA override: if authentic with high confidence — trust it
        if (c2pa_res.label == "authentic"
                and c2pa_res.confidence >= C2PA_TRUST_THRESHOLD):
            return DetectionResult(
                label="authentic",
                confidence=c2pa_res.confidence,
                indicators=(
                    ["[C2PA] " + i for i in c2pa_res.indicators] +
                    ["C2PA cryptographic verification overrides other signals"]
                ),
                metadata={"override": "c2pa_authentic",
                          **c2pa_res.metadata},
            )

        # ── Label voting ──────────────────────────────────────────────
        FAKE_LABELS = {"ai_generated", "suspicious", "deepfake"}
        votes = {
            "c2pa":      c2pa_res.label in FAKE_LABELS,
            "watermark": wm_res.label in FAKE_LABELS,
            "exif":      exif_res.label in FAKE_LABELS,
        }

        # ── Weighted confidence score ─────────────────────────────────
        def conf_toward_fake(result, is_fake_vote):
            """Returns confidence oriented toward fake (1.0 = definitely fake)."""
            c = result.confidence
            if is_fake_vote:
                return c
            if result.label in {"authentic", "likely_authentic"}:
                return 1.0 - c   # Invert: high authentic confidence = low fake
            return 0.5           # Unknown — neutral

        weighted_conf = sum(
            WEIGHTS[name] * conf_toward_fake(res, votes[name])
            for name, res in [
                ("c2pa", c2pa_res),
                ("watermark", wm_res),
                ("exif", exif_res),
            ]
        )

        # ── Final label ───────────────────────────────────────────────
        fake_votes = sum(votes.values())
        if weighted_conf >= 0.75 or fake_votes >= 2:
            final_label = "ai_generated"
        elif weighted_conf > 0.55 or fake_votes == 1:
            final_label = "suspicious"
        elif 0.45 <= weighted_conf <= 0.55 and fake_votes == 0:
            final_label = "unknown"
        else:
            final_label = "likely_authentic"

        # ── Combine all indicators ────────────────────────────────────
        all_indicators = (
            [f"[C2PA]      {i}" for i in c2pa_res.indicators] +
            [f"[Watermark] {i}" for i in wm_res.indicators] +
            [f"[EXIF]      {i}" for i in exif_res.indicators]
        )

        return DetectionResult(
            label=final_label,
            confidence=round(weighted_conf, 3),
            indicators=all_indicators,
            metadata={
                "c2pa_label":      c2pa_res.label,
                "watermark_label": wm_res.label,
                "exif_label":      exif_res.label,
                "fake_votes":      fake_votes,
                "weighted_score":  round(weighted_conf, 3),
            },
        )
