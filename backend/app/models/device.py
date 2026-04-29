from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =========================
# REQUEST REGISTRO DISPOSITIVO
# =========================
class DeviceRegisterRequest(BaseModel):
    device_id: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    location: Optional[str] = None
    enabled: bool = True


# =========================
# REQUEST UPDATE DISPOSITIVO
# =========================
class DeviceUpdateRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    enabled: Optional[bool] = None


# =========================
# RESPONSE INFO DISPOSITIVO
# =========================
class DeviceResponse(BaseModel):
    device_id: str
    api_key: str
    name: str
    location: Optional[str] = None
    enabled: bool
    created_at: datetime


# =========================
# RESPONSE SIMPLE STATUS
# =========================
class DeviceStatusResponse(BaseModel):
    status: str
    message: str


# =========================
# MODELO INTERNO DISPOSITIVO
# =========================
class Device(BaseModel):
    device_id: str
    api_key: str = "ESP32_SECURE_KEY_AV_2026_X9"
    name: str
    location: Optional[str] = None
    enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def to_dict(self):
        return {
            "device_id": self.device_id,
            "api_key": self.api_key,
            "name": self.name,
            "location": self.location,
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat(),
        }
