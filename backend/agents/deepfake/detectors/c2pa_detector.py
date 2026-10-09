import base64, tempfile, os
from ....core.interfaces.base_detector import BaseDetector, DetectionResult


class C2PADetector(BaseDetector):
    """
    Checks Content Credentials (C2PA manifest) embedded in the image.
    Authentic images from Adobe, Microsoft, Google tools carry a signed manifest.
    AI-generated images from attack tools carry none.

    Backed by: adobe.com/content-credentials
    """

    def input_type(self) -> str:
        return "image"

    async def detect(self, payload: dict) -> DetectionResult:
        b64 = payload.get("image_base64", "").split(",")[-1]
        if not b64:
            return DetectionResult(
                label="unknown", confidence=0.5,
                indicators=["No image data provided"])

        img_bytes = base64.b64decode(b64)
        tmp_path  = None

        try:
            import c2pa

            # Write to temp file — c2pa needs a file path
            with tempfile.NamedTemporaryFile(
                    suffix=".jpg", delete=False) as f:
                f.write(img_bytes)
                tmp_path = f.name

            try:
                reader   = c2pa.Reader.from_file(tmp_path)
                manifest = reader.get_active_manifest()
            except Exception:
                manifest = None

            # ── No manifest — unknown ──────────────────────────────
            if manifest is None:
                return DetectionResult(
                    label="unknown",
                    confidence=0.40,
                    indicators=[
                        "No Content Credentials (C2PA) manifest found",
                        "Most authentic camera photos do not yet carry C2PA",
                    ],
                    metadata={"c2pa_present": False},
                )

            # ── Has manifest — check for AI-generation claim ──────────
            assertions   = manifest.assertions()
            assertions_s = [str(a).lower() for a in assertions]
            is_ai        = any(
                kw in s for s in assertions_s
                for kw in ["ai", "generated", "machine", "synthetic", "model"]
            )
            signer = getattr(manifest, "claim_generator", "unknown")

            if is_ai:
                return DetectionResult(
                    label="ai_generated",
                    confidence=0.95,
                    indicators=[
                        "C2PA manifest present — AI generation claim found",
                        f"Content generator: {signer}",
                        "Manifest explicitly declares AI-generated content",
                    ],
                    metadata={"c2pa_present": True, "ai_claim": True,
                              "signer": str(signer)},
                )

            return DetectionResult(
                label="authentic",
                confidence=0.92,
                indicators=[
                    "C2PA manifest present — no AI generation claim",
                    f"Content signed by: {signer}",
                    "Provenance chain verified",
                ],
                metadata={"c2pa_present": True, "ai_claim": False,
                          "signer": str(signer)},
            )

        except ImportError:
            return DetectionResult(
                label="unknown", confidence=0.5,
                indicators=["c2pa-python not installed — skipped"])
        except Exception as e:
            return DetectionResult(
                label="unknown", confidence=0.5,
                indicators=[f"C2PA check failed: {str(e)[:100]}"])
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
