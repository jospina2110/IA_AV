from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


class DeviceRegisterRequest(BaseModel):
    device_id: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    location: Optional[str] = None
    enabled: bool = True


class DeviceUpdateRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    enabled: Optional[bool] = None


class DeviceResponse(BaseModel):
    device_id: str
    api_key: str
    name: str
    location: Optional[str] = None
    enabled: bool
    created_at: datetime


class DeviceStatusResponse(BaseModel):
    status: str
    message: str


class Device(BaseModel):
    device_id: str
    api_key: str = Field(default="ESP32_SECURE_KEY_AV_2026_X9")
    name: str
    location: Optional[str] = None
    enabled: bool = True
    # ✅ default_factory evalúa en cada instancia, no al importar
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "device_id": self.device_id,
            "api_key": self.api_key,
            "name": self.name,
            "location": self.location,
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat(),
        }
