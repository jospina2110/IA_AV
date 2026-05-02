import json
import os
from datetime import datetime
from threading import Lock

from app.core.config import settings

EVENTS_FILE = settings.EVENTS_FILE
MAX_EVENTS = 100
_lock = Lock()


def _ensure_file():
    os.makedirs(os.path.dirname(EVENTS_FILE), exist_ok=True)
    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def load_events() -> list:
    _ensure_file()
    try:
        with open(EVENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def save_event(event: dict):
    with _lock:
        _ensure_file()
        events = load_events()
        events.append(event)

        if len(events) > MAX_EVENTS:
            events = events[-MAX_EVENTS:]

        tmp = EVENTS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        os.replace(tmp, EVENTS_FILE)


def get_latest_event() -> dict | None:
    events = load_events()
    return events[-1] if events else None


def clear_events():
    with _lock:
        tmp = EVENTS_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump([], f)
        os.replace(tmp, EVENTS_FILE)


def get_stats() -> dict:
    events = load_events()
    total = len(events)
    alerts = sum(1 for e in events if e.get("data", {}).get("alerts"))
    persons_list = [
        e.get("data", {}).get("result", {}).get("persons", 0) for e in events
    ]
    return {
        "total_events": total,
        "total_alerts": alerts,
        "total_persons_detected": sum(persons_list),
        "max_persons_in_frame": max(persons_list) if persons_list else 0,
    }


read_events = load_events
