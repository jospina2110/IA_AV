from fastapi import APIRouter
from app.services.event_service import read_events, clear_events

router = APIRouter()


# =========================
# GET ALL EVENTS
# =========================
@router.get("/events")
def get_events(limit: int = 30):
    events = read_events()

    return {
        "status": "success",
        "total": len(events),
        "events": events[-limit:],
    }


# =========================
# GET LATEST EVENT
# =========================
@router.get("/events/latest")
def get_latest():
    events = read_events()
    latest = events[-1] if events else None

    return {
        "status": "success",
        "event": latest,
    }


# =========================
# DASHBOARD STATS
# =========================
@router.get("/events/stats")
def stats():
    events = read_events()

    total_events = len(events)

    total_persons = sum(
        (
            e.get("data", {})
             .get("result", {})
             .get("persons", 0)
        )
        for e in events
    )

    total_alerts = sum(
        len(
            e.get("data", {})
             .get("alerts", [])
        )
        for e in events
    )

    latest = events[-1] if events else None

    return {
        "status": "success",
        "total_events": total_events,
        "total_persons_detected": total_persons,
        "total_alerts": total_alerts,
        "latest_event": latest,
    }


# =========================
# CLEAR EVENTS
# =========================
@router.delete("/events")
def clear():
    clear_events()

    return {
        "status": "success",
        "message": "Eventos eliminados",
    }