from ultralytics import YOLO
from functools import lru_cache
import cv2
import os
from app.core.config import settings

# ==============================
# COLORES
# ==============================
COLOR_HELMET = (0, 255, 0)
COLOR_NO_HELMET = (0, 0, 255)
COLOR_PERSON = (255, 165, 0)


# ==============================
# CARGA LAZY DE MODELOS
# ==============================
@lru_cache(maxsize=1)
def _load_person_model() -> YOLO:
    return YOLO(settings.YOLO_MODEL)


@lru_cache(maxsize=1)
def _load_ppe_model():
    if not settings.YOLO_PPE_MODEL:
        return None
    try:
        model = YOLO(settings.YOLO_PPE_MODEL)
        print("PPE model loaded")
        return model
    except Exception as e:
        print(f"PPE model not loaded: {e}")
        return None


# ==============================
# DETECTOR PRINCIPAL
# ==============================
def detect_objects(image_path: str) -> dict:
    frame = cv2.imread(image_path)

    if frame is None:
        return {
            "persons": 0,
            "helmets": 0,
            "no_helmets": 0,
            "helmet_status": "unknown",
            "processed_image": image_path,
        }

    model_person = _load_person_model()
    model_ppe = _load_ppe_model()

    CONF = settings.YOLO_CONF
    IOU = settings.YOLO_IOU

    # preprocesamiento
    frame = cv2.resize(frame, (640, 640))
    frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=15)

    persons = 0
    helmets = 0
    no_helmets = 0

    # detección de personas
    for r in model_person(frame, conf=CONF, iou=IOU):
        for box in r.boxes:
            if model_person.names[int(box.cls[0])] == "person":
                persons += 1
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), COLOR_PERSON, 2)
                cv2.putText(
                    frame,
                    f"PERSON {conf:.2f}",
                    (x1, max(y1 - 10, 10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    COLOR_PERSON,
                    2,
                )

    # detección PPE
    if model_ppe:
        for r in model_ppe(frame, conf=CONF, iou=IOU):
            for box in r.boxes:
                label = model_ppe.names[int(box.cls[0])].lower()
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                if label in ["helmet", "hard-hat", "hardhat"]:
                    helmets += 1
                    cv2.rectangle(frame, (x1, y1), (x2, y2), COLOR_HELMET, 2)
                    cv2.putText(
                        frame,
                        f"HELMET {conf:.2f}",
                        (x1, max(y1 - 10, 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        COLOR_HELMET,
                        2,
                    )
                elif label in ["head", "no-helmet", "no_helmet"]:
                    no_helmets += 1
                    cv2.rectangle(frame, (x1, y1), (x2, y2), COLOR_NO_HELMET, 2)
                    cv2.putText(
                        frame,
                        f"NO HELMET {conf:.2f}",
                        (x1, max(y1 - 10, 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        COLOR_NO_HELMET,
                        2,
                    )

    # estado cascos
    if persons == 0:
        helmet_status = "no_persons"
    elif model_ppe is None:
        helmet_status = "not_implemented"
    elif helmets >= persons:
        helmet_status = "detected"
    elif helmets > 0:
        helmet_status = "partial"
    else:
        helmet_status = "not_detected"

    # guardar imagen procesada
    processed_name = os.path.basename(image_path).replace(".jpg", "_processed.jpg")
    processed_path = os.path.join(settings.PROCESSED_DIR, processed_name)
    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
    cv2.imwrite(processed_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 75])

    return {
        "persons": persons,
        "helmets": helmets,
        "no_helmets": no_helmets,
        "helmet_status": helmet_status,
        "processed_image": processed_path,
    }
