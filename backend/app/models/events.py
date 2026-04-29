from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# =========================
# DETECCIÓN
# =========================
class DetectionResult(BaseModel):
    persons: int = Field(default=0, ge=0)
    helmets: int = Field(default=0, ge=0)
    helmet_status: str = Field(default="unknown")
    processed_image: Optional[str] = Field(default=None)


# =========================
# EVENTO COMPLETO
# =========================
class EventData(BaseModel):
    device_id: str
    file: str
    processed_image: Optional[str] = None
    result: DetectionResult
    alerts: list[str] = Field(default_factory=list)


class Event(BaseModel):
    # isoformat() para que json.dump lo serialice sin TypeError
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    data: EventData

    def to_json_dict(self) -> dict:
        """Serialización segura para json.dump."""
        return self.model_dump()


# =========================
# RESPUESTA DEL ENDPOINT
# =========================
class UploadResponse(BaseModel):
    status: str = "success"
    device_id: str
    persons: int
    helmet_status: str
    alerts: list[str]
    processed_image: Optional[str]
    event_saved: bool
