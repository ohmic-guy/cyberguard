import base64, io
from PIL import Image
from PIL.ExifTags import TAGS
from ....core.interfaces.base_detector import BaseDetector, DetectionResult

# AI tools that embed their name in EXIF Software field
KNOWN_AI_TOOLS = [
    "stable diffusion", "midjourney", "dall-e", "dall·e",
    "adobe firefly", "imagen", "gemini", "runway",
    "pika", "kling", "sora", "leonardo", "nightcafe",
    "civitai", "automatic1111", "comfyui", "invokeai",
]


class EXIFAnalyzer(BaseDetector):
    """
    Analyzes image EXIF metadata for AI generation signatures.
    Genuine camera photos carry rich EXIF (camera make, model, GPS, lens).
    AI-generated images typically have stripped or absent EXIF.
    """

    def input_type(self) -> str:
        return "image"

    async def detect(self, payload: dict) -> DetectionResult:
        b64 = payload.get("image_base64", "").split(",")[-1]
        if not b64:
            return DetectionResult(
                label="unknown", confidence=0.5,
                indicators=["No image data"])

        try:
            img_bytes = base64.b64decode(b64)
            img       = Image.open(io.BytesIO(img_bytes))

            # Extract EXIF
            raw_exif = img._getexif() or {}
            exif     = {TAGS.get(k, str(k)): v
                        for k, v in raw_exif.items()}

            indicators  = []
            confidence  = 0.3
            label       = "unknown"

            # ── Check 1: No EXIF at all ───────────────────────────────
            if not exif:
                indicators.append("No EXIF metadata (could be AI generated or stripped by social media)")
                confidence += 0.25
            else:
                # ── Check 2: Known AI tool in Software field ──────────────
                software = str(exif.get("Software", "")).lower()
                for tool in KNOWN_AI_TOOLS:
                    if tool in software:
                        indicators.append(f"AI tool signature in EXIF Software field: {software}")
                        confidence = 0.97
                        label      = "ai_generated"
                        break

                # ── Check 3: No camera Make / Model ───────────────────────
                if not exif.get("Make") and not exif.get("Model"):
                    indicators.append("No camera make/model — genuine photos usually have this")
                    confidence += 0.15

                # ── Check 4: No GPS data (weak signal, but noted) ─────────
                if not exif.get("GPSInfo"):
                    indicators.append("No GPS metadata embedded")

                # ── Check 5: No DateTime ──────────────────────────────────
                if not exif.get("DateTime") and not exif.get("DateTimeOriginal"):
                    indicators.append("No capture timestamp in EXIF")
                    confidence += 0.10

            # ── Check 6: Suspicious image dimensions ──────────────────
            w, h = img.size
            common_ai_sizes = [
                (512,512),(768,768),(1024,1024),
                (512,768),(768,512),(1024,768),(768,1024),
                (1024,1536),(1536,1024),
            ]
            if (w, h) in common_ai_sizes:
                indicators.append(
                    f"Image dimensions {w}x{h} match common AI generation sizes")
                confidence += 0.10

            # ── Summarise ─────────────────────────────────────────────
            confidence = min(confidence, 0.97)

            if confidence >= 0.65 and label != "ai_generated":
                label = "suspicious"
            elif confidence < 0.45:
                label = "likely_authentic"
                indicators.append(
                    "EXIF metadata appears consistent with authentic image")

            if not indicators:
                indicators.append("EXIF metadata analysis inconclusive")

            return DetectionResult(
                label=label,
                confidence=confidence,
                indicators=indicators,
                metadata={
                    "exif_fields_found": len(exif),
                    "has_camera": bool(exif.get("Make")),
                    "software": str(exif.get("Software", "")),
                    "dimensions": f"{w}x{h}",
                },
            )

        except Exception as e:
            return DetectionResult(
                label="unknown", confidence=0.5,
                indicators=[f"EXIF analysis failed: {str(e)[:100]}"])
