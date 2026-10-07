import pytest

from backend.agents.phishing.detectors.email_detector import EmailDetector
from backend.agents.phishing.detectors.sms_detector import SmsDetector
from backend.agents.phishing.detectors.url_detector import UrlDetector
from backend.agents.phishing.detectors.qr_detector import QrDetector


class FakeModel:
	async def predict(self, input_data: dict) -> dict:
		return {"label": "phishing", "confidence": 0.9}


@pytest.mark.asyncio
async def test_url_detector_adds_url_indicators() -> None:
	result = await UrlDetector(FakeModel()).detect({"url": "http://192.168.1.1/login", "domain": "192.168.1.1"})

	assert "No HTTPS" in result.indicators
	assert "IP address in URL" in result.indicators


@pytest.mark.asyncio
async def test_email_detector_adds_content_indicators() -> None:
	result = await EmailDetector(FakeModel()).detect({"subject": "Urgent verification", "raw_text": "Click https://example.com"})

	assert result.indicators == ["Urgent or credential language", "Link in message content"]


@pytest.mark.asyncio
async def test_sms_detector_adds_action_indicators() -> None:
	result = await SmsDetector(FakeModel()).detect({"sms_text": "Claim your free prize, text code 1234"})

	assert "Promotional or verification language" in result.indicators
	assert "Action requested through message" in result.indicators


@pytest.mark.asyncio
async def test_qr_detector_adds_url_indicator() -> None:
	result = await QrDetector(FakeModel()).detect({"decoded_url": "https://example.com"})

	assert result.indicators == ["QR code contains a URL"]