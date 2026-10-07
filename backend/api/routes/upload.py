from __future__ import annotations

import base64

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ...core.events.event_bus import event_bus
from ...core.events.event_types import InputModality, ThreatEvent
from ...core.events.streams import RAW_INPUT
from .auth import require_user

router = APIRouter(dependencies=[Depends(require_user)])


@router.post("/api/v1/upload")
async def upload(file: UploadFile = File(...), modality: str = Form(...)) -> dict[str, str]:
	try:
		input_modality = InputModality(modality)
	except ValueError as error:
		raise HTTPException(status_code=422, detail=f"Unsupported modality: {modality}") from error

	content = await file.read()
	event = ThreatEvent(
		modality=input_modality,
		source="upload",
		payload={
			"filename": file.filename or "upload",
			"content_b64": base64.b64encode(content).decode("ascii"),
		},
	)
	entry_id = await event_bus.publish(RAW_INPUT, event)
	return {"event_id": event.event_id, "status": "queued", "entry_id": entry_id}
