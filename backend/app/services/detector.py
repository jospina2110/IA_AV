from ultralytics import YOLO
import cv2
import os
from app.core.config import settings

# ==============================
# MODELO YOLO
# ==============================
model = YOLO(settings.YOLO_MODEL)

CONF_THRESHOLD = settings.YOLO_CONF
IOU_THRESHOLD = settings.YOLO_IOU


# ==============================
# DETECTOR PRINCIPAL
# ==============================
def detect_objects(image_path: str) -> dict:
    """
    Detecta personas en imágenes de obra.

    Retorna:
        persons
        helmets
        helmet_status
        processed_image
    """

    frame = cv2.imread(image_path)

    if frame is None:
        return {
            "persons": 0,
            "helmets": 0,
            "helmet_status": "unknown",
            "processed_image": image_path,
        }

    # ==========================
    # PREPROCESAMIENTO
    # ==========================
    frame = cv2.resize(frame, (640, 640))
    frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=15)

    # ==========================
    # INFERENCIA
    # ==========================
    results = model(
        frame,
        conf=CONF_THRESHOLD,
        iou=IOU_THRESHOLD
    )

    persons = 0
    helmets = 0

    # ==========================
    # DETECCIÓN
    # ==========================
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names[cls_id]

            # PERSONAS
            if label == "person" and conf >= CONF_THRESHOLD:
                persons += 1

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # Bounding box
                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                # Label
                cv2.putText(
                    frame,
                    f"PERSON {conf:.2f}",
                    (x1, max(y1 - 10, 10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2,
                )

    # ==========================
    # HELMET STATUS (placeholder)
    # ==========================
    if persons > 0:
        helmet_status = "not_implemented"
    else:
        helmet_status = "not_implemented"

    # ==========================
    # GUARDAR IMAGEN PROCESADA
    # ==========================
    base_name = os.path.basename(image_path)
    processed_name = base_name.replace(".jpg", "_processed.jpg")
    processed_path = os.path.join(
        settings.PROCESSED_DIR,
        processed_name
    )

    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)

    cv2.imwrite(processed_path, frame)

    # ==========================
    # RETURN NORMALIZADO
    # ==========================
    return {
        "persons": persons,
        "helmets": helmets,
        "helmet_status": helmet_status,
        "processed_image": processed_path,
    }