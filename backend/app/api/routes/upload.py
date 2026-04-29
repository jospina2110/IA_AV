from fastapi import APIRouter, Request, Depends, HTTPException
from app.core.security import verify_device_api_key
from app.services.image_service import save_raw_image, build_image_url
from app.services.detector import detect_objects
from app.services.event_service import save_event
from app.services.telegram_service import send_telegram_alert
from datetime import datetime
from app.models.events import (
    EventData,
    Event,
    UploadResponse,
    DetectionResult,
)

router = APIRouter()


# =========================
# ALERT ENGINE
# =========================
def check_alerts(result: dict) -> list[str]:
    alerts = []

    persons = result.get("persons", 0)
    helmet_status = result.get("helmet_status", "unknown")

    # Persona detectada
    if persons > 0:
        alerts.append("👷 Persona detectada")

    # Alta ocupación
    if persons >= 3:
        alerts.append("🚨 Alta ocupación")

    # Casco no detectado
    if helmet_status == "not_detected":
        alerts.append("⚠️ Casco no detectado")

    return alerts


# =========================
# UPLOAD ENDPOINT
# =========================
@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    request: Request,
    device: dict = Depends(verify_device_api_key),
):
    """
    Endpoint seguro para dispositivos ESP32-CAM

    Headers requeridos:
    - X-API-Key
    - X-Device-ID
    """

    image_bytes = await request.body()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="No se recibió imagen"
        )

    try:
        # =========================
        # GUARDAR IMAGEN ORIGINAL
        # =========================
        file_path = save_raw_image(image_bytes)

        # =========================
        # DETECCIÓN IA
        # =========================
        raw_result = detect_objects(file_path)

        # =========================
        # ALERTAS
        # =========================
        alerts = check_alerts(raw_result)

        # =========================
        # URL IMAGEN PROCESADA
        # =========================
        processed_image_url = build_image_url(
            raw_result.get("processed_image", file_path)
        )

        # =========================
        # RESULTADO NORMALIZADO
        # =========================
        detection_result = DetectionResult(
            persons=raw_result.get("persons", 0),
            helmets=raw_result.get("helmets", 0),
            helmet_status=raw_result.get(
                "helmet_status",
                "not_implemented"
            ),
            processed_image=processed_image_url,
        )

        # =========================
        # EVENT DATA
        # =========================
        event_data = EventData(
            device_id=device["device_id"],
            file=file_path,
            processed_image=processed_image_url,
            result=detection_result,
            alerts=alerts,
        )

        # =========================
        # EVENTO FINAL
        # =========================
        save_event({
            "timestamp": datetime.now().isoformat(),
            "data": event_data.model_dump(),
        })          

        # =========================
        # TELEGRAM
        # =========================
        if alerts:
            send_telegram_alert(
                message=(
                    f"🚨 ALERTA EN OBRA\n"
                    f"📍 Dispositivo: {device['device_id']}\n"
                    f"👷 Personas: {detection_result.persons}\n"
                    f"🪖 Casco: {detection_result.helmet_status}\n"
                    f"⚠️ Alertas: {', '.join(alerts)}"
                ),
                image_path=raw_result.get(
                    "processed_image",
                    file_path
                ),
                key=f"{device['device_id']}_alert",
            )

        # =========================
        # RESPUESTA FRONTEND
        # =========================
        return UploadResponse(
            status="success",
            device_id=device["device_id"],
            persons=detection_result.persons,
            helmet_status=detection_result.helmet_status,
            alerts=alerts,
            processed_image=processed_image_url,
            event_saved=True,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload processing error: {str(e)}"
        )