import json
import os
from threading import Lock
from app.services.image_cleanup import cleanup_old_images

EVENTS_FILE = "data/events.json"
MAX_EVENTS = 100

_lock = Lock()


def _ensure_file():
    os.makedirs("data", exist_ok=True)

    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)


def read_events():
    _ensure_file()

    try:
        with open(EVENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

            if isinstance(data, list):
                return data

            return []

    except Exception:
        # Si el archivo se corrompe, reinicia automáticamente
        return []


def save_event(event: dict):
    with _lock:
        events = read_events()

        # Agregar nuevo evento
        events.append(event)

        # Rotación automática
        if len(events) > MAX_EVENTS:
            events = events[-MAX_EVENTS:]

        # Escritura atómica
        tmp_file = EVENTS_FILE + ".tmp"

        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(
                events,
                f,
                indent=2,
                ensure_ascii=False,
            )

        os.replace(tmp_file, EVENTS_FILE)

    # Limpieza de imágenes después del guardado
    cleanup_old_images()


def clear_events():
    with _lock:
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2, ensure_ascii=False)

    # Limpieza total de imágenes
    cleanup_old_images(force_all=True)