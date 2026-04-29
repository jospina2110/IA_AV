import json
import os
from threading import Lock
from typing import List, Dict, Optional

# =========================
# PATHS
# =========================
DATA_DIR = "data"
DEVICES_FILE = os.path.join(DATA_DIR, "devices.json")
DEVICES_TMP = DEVICES_FILE + ".tmp"

# =========================
# LOCK GLOBAL
# El lock protege TODO el ciclo leer→modificar→escribir,
# no solo el json.dump individual.
# =========================
_lock = Lock()

# =========================
# INIT
# =========================
os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(DEVICES_FILE):
    with open(DEVICES_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)


# =========================
# HELPERS INTERNOS (sin lock — el caller los adquiere)
# =========================
def _read() -> List[Dict]:
    try:
        with open(DEVICES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def _write(devices: List[Dict]) -> None:
    """Escritura atómica: tmp → rename. Lanza excepción si falla."""
    with open(DEVICES_TMP, "w", encoding="utf-8") as f:
        json.dump(devices, f, indent=2, ensure_ascii=False)
    os.replace(DEVICES_TMP, DEVICES_FILE)


# =========================
# API PÚBLICA
# =========================
def get_device(device_id: str) -> Optional[Dict]:
    with _lock:
        devices = _read()
    return next((d for d in devices if d.get("device_id") == device_id), None)


def register_device(device_data: Dict) -> bool:
    """Retorna False si el device_id ya existe."""
    with _lock:
        devices = _read()
        if any(d.get("device_id") == device_data["device_id"] for d in devices):
            return False
        devices.append(device_data)
        _write(devices)
    return True


def update_device(device_id: str, updates: Dict) -> bool:
    """Retorna False si el device_id no existe."""
    with _lock:
        devices = _read()
        for device in devices:
            if device.get("device_id") == device_id:
                device.update(updates)
                _write(devices)
                return True
    return False


def delete_device(device_id: str) -> bool:
    """Retorna False si el device_id no existía."""
    with _lock:
        devices = _read()
        original_len = len(devices)
        filtered = [d for d in devices if d.get("device_id") != device_id]
        if len(filtered) == original_len:
            return False  # no encontrado
        _write(filtered)
    return True


def list_active_devices() -> List[Dict]:
    with _lock:
        devices = _read()
    return [d for d in devices if d.get("enabled", True)]
