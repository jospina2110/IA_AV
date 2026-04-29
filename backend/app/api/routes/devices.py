from fastapi import APIRouter, HTTPException
from typing import List

from app.models.device import (
    Device,
    DeviceRegisterRequest,
    DeviceUpdateRequest,
    DeviceResponse,
    DeviceStatusResponse,
)

from app.services.device_service import (
    register_device,
    get_device,
    update_device,
    delete_device,
    list_active_devices,
)

router = APIRouter()


# =========================
# REGISTER DEVICE
# =========================
@router.post("/devices/register", response_model=DeviceResponse)
def register_new_device(device_data: DeviceRegisterRequest):
    """
    Registra un nuevo dispositivo ESP32-CAM
    """

    device = Device(
        device_id=device_data.device_id,
        name=device_data.name,
        location=device_data.location,
        enabled=device_data.enabled,
    )

    success = register_device(device.to_dict())

    if not success:
        raise HTTPException(status_code=400, detail="Device ID already exists")

    return DeviceResponse(**device.to_dict())


# =========================
# GET ALL ACTIVE DEVICES
# =========================
@router.get("/devices", response_model=List[DeviceResponse])
def get_all_devices():
    """
    Lista todos los dispositivos activos
    """

    devices = list_active_devices()

    return [DeviceResponse(**device) for device in devices]


# =========================
# GET SINGLE DEVICE
# =========================
@router.get("/devices/{device_id}", response_model=DeviceResponse)
def get_single_device(device_id: str):
    """
    Obtiene información de un dispositivo
    """

    device = get_device(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return DeviceResponse(**device)


# =========================
# UPDATE DEVICE
# =========================
@router.put("/devices/{device_id}", response_model=DeviceStatusResponse)
def update_existing_device(device_id: str, updates: DeviceUpdateRequest):
    """
    Actualiza nombre, ubicación o estado
    """

    success = update_device(
        device_id,
        updates.dict(exclude_unset=True),
    )

    if not success:
        raise HTTPException(status_code=404, detail="Device not found")

    return DeviceStatusResponse(status="success", message="Device updated successfully")


# =========================
# DELETE DEVICE
# =========================
@router.delete("/devices/{device_id}", response_model=DeviceStatusResponse)
def delete_existing_device(device_id: str):
    """
    Elimina un dispositivo registrado
    """

    success = delete_device(device_id)

    if not success:
        raise HTTPException(status_code=404, detail="Device not found")

    return DeviceStatusResponse(status="success", message="Device deleted successfully")


# =========================
# HEALTH CHECK
# =========================
@router.get("/devices/health", response_model=DeviceStatusResponse)
def devices_health():
    """
    Estado del sistema de dispositivos
    """

    return DeviceStatusResponse(
        status="success", message="Device management system active"
    )
