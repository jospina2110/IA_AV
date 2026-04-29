from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =========================
# DEVICE AUTH REQUEST
# Validación para autenticación segura
# =========================
class DeviceAuthRequest(BaseModel):
    device_id: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Identificador único del dispositivo",
        example="CAMARA_OBRA_1",
    )

    api_key: str = Field(
        ...,
        min_length=10,
        max_length=256,
        description="Clave API segura del dispositivo",
        example="secure_api_key_123456789",
    )


# =========================
# DEVICE REGISTER REQUEST
# Registro inicial de nuevos dispositivos
# =========================
class DeviceRegisterRequest(BaseModel):
    device_id: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="ID único del dispositivo",
        example="CAMARA_OBRA_1",
    )

    name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Nombre descriptivo del dispositivo",
        example="Camara Entrada Norte",
    )

    api_key: str = Field(
        ...,
        min_length=10,
        max_length=256,
        description="Clave API para autenticación",
        example="secure_api_key_123456789",
    )

    location: Optional[str] = Field(
        default="Obra principal",
        max_length=150,
        description="Ubicación física del dispositivo",
        example="Piso 3 - Zona de carga",
    )

    enabled: bool = Field(
        default=True,
        description="Estado del dispositivo",
    )


# =========================
# DEVICE UPDATE REQUEST
# Permite modificaciones parciales
# =========================
class DeviceUpdateRequest(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=100,
        description="Nuevo nombre del dispositivo",
    )

    location: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Nueva ubicación",
    )

    enabled: Optional[bool] = Field(
        default=None,
        description="Activar o desactivar dispositivo",
    )

    api_key: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=256,
        description="Actualizar API key",
    )


# =========================
# DEVICE MODEL
# Representación completa
# =========================
class DeviceModel(BaseModel):
    device_id: str
    name: str
    api_key: str
    location: Optional[str] = "Obra principal"
    enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: Optional[datetime] = None


# =========================
# DEVICE RESPONSE
# Respuesta segura (sin exponer api_key)
# =========================
class DeviceResponse(BaseModel):
    status: str
    device_id: str
    name: Optional[str] = None
    location: Optional[str] = None
    enabled: bool = True
    created_at: Optional[datetime] = None
    last_seen: Optional[datetime] = None


# =========================
# DEVICE LIST RESPONSE
# =========================
class DeviceListResponse(BaseModel):
    status: str
    total: int
    devices: list[DeviceResponse]


# =========================
# GENERIC MESSAGE RESPONSE
# =========================
class DeviceMessageResponse(BaseModel):
    status: str
    message: str
