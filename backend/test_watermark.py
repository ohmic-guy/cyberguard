import asyncio, json, base64
from PIL import Image
import io

# Create a dummy test image
def make_test_image_b64():
    img = Image.new("RGB", (512, 512), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, "JPEG")
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

async def test_all():
    from backend.agents.deepfake.detectors.c2pa_detector import C2PADetector
    from backend.agents.deepfake.detectors.invisible_watermark_detector import InvisibleWatermarkDetector
    from backend.agents.deepfake.detectors.exif_analyzer import EXIFAnalyzer
    from backend.agents.deepfake.detectors.watermark_aggregator import WatermarkAggregator

    payload = {"image_base64": make_test_image_b64()}

    print("Testing C2PADetector...")
    r = await C2PADetector(None).detect(payload)
    print(f"  label={r.label} conf={r.confidence}")
    print(f"  indicators={r.indicators}")

    print("\nTesting InvisibleWatermarkDetector...")
    r = await InvisibleWatermarkDetector(None).detect(payload)
    print(f"  label={r.label} conf={r.confidence}")
    print(f"  indicators={r.indicators}")

    print("\nTesting EXIFAnalyzer...")
    r = await EXIFAnalyzer(None).detect(payload)
    print(f"  label={r.label} conf={r.confidence}")
    print(f"  indicators={r.indicators}")

    print("\nTesting WatermarkAggregator (all three combined)...")
    r = await WatermarkAggregator(None).detect(payload)
    print(f"  FINAL label={r.label} conf={r.confidence}")
    print(f"  indicators:")
    for i in r.indicators:
        print(f"    {i}")

asyncio.run(test_all())
