from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query

from ...core.events.event_bus import event_bus
from ...core.events.event_types import InputModality, ThreatEvent
from ...core.events.streams import RAW_INPUT
from .auth import require_user

router = APIRouter(dependencies=[Depends(require_user)])
DEMO_DIR = Path(__file__).resolve().parents[2] / "data" / "demo"
DEMO_FILES = {
	"phishing_url": ("phishing_url_samples.json", InputModality.URL),
	"phishing_email": ("phishing_email_samples.json", InputModality.EMAIL),
	"phishing_sms": ("phishing_sms_samples.json", InputModality.SMS),
	"deepfake_image": ("deepfake_image_samples.json", InputModality.IMAGE),
	"log_anomaly": ("log_anomaly_samples.json", InputModality.AUTH_LOG),
}


@router.post("/api/v1/demo/run")
async def run_demo(scenario: str = Query(default="phishing_url")) -> dict[str, object]:
	definition = DEMO_FILES.get(scenario)
	if definition is None:
		raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario}")
	filename, modality = definition
	with (DEMO_DIR / filename).open(encoding="utf-8") as handle:
		data = json.load(handle)
	event_ids = []
	for sample in data.get("samples", [])[:5]:
		event = ThreatEvent(modality=modality, source="demo", payload=sample["payload"])
		await event_bus.publish(RAW_INPUT, event)
		event_ids.append(event.event_id)
	return {"status": "queued", "scenario": scenario, "events_queued": len(event_ids), "event_ids": event_ids}