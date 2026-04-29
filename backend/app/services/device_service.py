import json
import os
from threading import Lock

DEVICES_FILE = "data/devices.json"

_lock = Lock()


# =========================
# INIT
# =========================
def _ensure_file():
    os.makedirs("data", exist_ok=True)

    if not os.path.exists(DEVICES_FILE):
        with open(DEVICES_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


# =========================
# LOAD
# =========================
def load_devices():
    _ensure_file()

    try:
        with open(DEVICES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


# =========================
# SAVE
# =========================
def save_devices(devices):
    with _lock:
        with open(DEVICES_FILE, "w", encoding="utf-8") as f:
            json.dump(devices, f, indent=2, ensure_ascii=False)


# =========================
# REGISTER
# =========================
def register_device(device_data):
    devices = load_devices()

    for d in devices:
        if d["device_id"] == device_data["device_id"]:
            raise ValueError("Device already exists")

    devices.append(device_data)
    save_devices(devices)

    return device_data


# =========================
# GET ONE
# =========================
def get_device(device_id):
    devices = load_devices()

    for d in devices:
        if d["device_id"] == device_id:
            return d

    return None


# =========================
# UPDATE
# =========================
def update_device(device_id, update_data):
    devices = load_devices()

    for d in devices:
        if d["device_id"] == device_id:
            d.update(update_data)
            save_devices(devices)
            return d

    return None


# =========================
# DELETE
# =========================
def delete_device(device_id):
    devices = load_devices()

    updated = [d for d in devices if d["device_id"] != device_id]

    save_devices(updated)


# =========================
# ENABLE / DISABLE
# =========================
def set_device_status(device_id, enabled: bool):
    devices = load_devices()

    for d in devices:
        if d["device_id"] == device_id:
            d["enabled"] = enabled
            save_devices(devices)
            return d

    return None


# =========================
# ACTIVE DEVICES
# =========================
def list_active_devices():
    devices = load_devices()

    return [d for d in devices if d.get("enabled", False)]
