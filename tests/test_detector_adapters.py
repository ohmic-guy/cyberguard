import pytest

from backend.agents.deepfake.detectors.audio_detector import AudioDetector
from backend.agents.deepfake.detectors.video_detector import VideoDetector
from backend.agents.log_analysis.detectors.behavior_detector import BehaviorDetector
from backend.agents.log_analysis.detectors.system_log_detector import SystemLogDetector


class FakeModel:
	async def predict(self, input_data: dict) -> dict:
		return {"label": "fake", "confidence": 0.8, "indicators": ["synthetic artifact"]}


@pytest.mark.asyncio
@pytest.mark.parametrize("detector_type", [AudioDetector, VideoDetector])
async def test_deepfake_adapters_normalize_fake_label(detector_type: type) -> None:
	result = await detector_type(FakeModel()).detect({})

	assert result.label == "deepfake"
	assert result.confidence == 0.8
	assert result.indicators == ["synthetic artifact"]


@pytest.mark.asyncio
@pytest.mark.parametrize("detector_type", [BehaviorDetector, SystemLogDetector])
async def test_log_adapters_preserve_model_result(detector_type: type) -> None:
	result = await detector_type(FakeModel()).detect({})

	assert result.label == "fake"
	assert result.confidence == 0.8