from typing import Any
from fastapi import APIRouter, Depends, File, UploadFile
from api.routes.auth import get_current_user
from ingestion.file_upload_handler import FileUploadHandler

router = APIRouter(prefix="/api/v1", tags=["upload"])
upload_handler = FileUploadHandler()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, str]:
    """Ingests file upload, passes to FileUploadHandler, and returns event_id and status."""
    event = await upload_handler.handle_upload(file)
    return {"event_id": event.event_id, "status": "received"}
