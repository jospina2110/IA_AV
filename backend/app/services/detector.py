from ultralytics import YOLO
import cv2
import os
from app.core.config import settings

# ==============================
# MODELOS
# ==============================
# Modelo general — personas
model_person = YOLO(settings.YOLO_MODEL)

# Modelo PPE opcional
model_ppe = None

if settings.YOLO_PPE_MODEL:
    try:
        model_ppe = YOLO(settings.YOLO_PPE_MODEL)
        print("✅ PPE model loaded")
    except Exception as e:
        print(f"⚠ PPE model not loaded: {e}")

CONF_THRESHOLD = settings.YOLO_CONF
IOU_THRESHOLD = settings.YOLO_IOU

# ==============================
# COLORES
# ==============================
COLOR_HELMET = (0, 255, 0)
COLOR_NO_HELMET = (0, 0, 255)
COLOR_PERSON = (255, 165, 0)


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

    # ==========================
    # PREPROCESAMIENTO
    # ==========================
    frame = cv2.resize(frame, (640, 640))
    frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=15)

    persons = 0
    helmets = 0
    no_helmets = 0

    # ==========================
    # PERSONAS
    # ==========================
    results_person = model_person(
        frame,
        conf=CONF_THRESHOLD,
        iou=IOU_THRESHOLD,
    )

    for r in results_person:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model_person.names[cls_id]

            if label == "person":
                persons += 1

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    COLOR_PERSON,
                    2,
                )

                cv2.putText(
                    frame,
                    f"PERSON {conf:.2f}",
                    (x1, max(y1 - 10, 10)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    COLOR_PERSON,
                    2,
                )

    # ==========================
    # PPE
    # ==========================
    if model_ppe:
        results_ppe = model_ppe(
            frame,
            conf=CONF_THRESHOLD,
            iou=IOU_THRESHOLD,
        )

        for r in results_ppe:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                label = model_ppe.names[cls_id].lower()

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # Con casco
                if label in ["helmet", "hard-hat", "hardhat"]:
                    helmets += 1

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        COLOR_HELMET,
                        2,
                    )

                    cv2.putText(
                        frame,
                        f"HELMET {conf:.2f}",
                        (x1, max(y1 - 10, 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        COLOR_HELMET,
                        2,
                    )

                # Sin casco
                elif label in ["head", "no-helmet", "no_helmet"]:
                    no_helmets += 1

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        COLOR_NO_HELMET,
                        2,
                    )

                    cv2.putText(
                        frame,
                        f"NO HELMET {conf:.2f}",
                        (x1, max(y1 - 10, 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        COLOR_NO_HELMET,
                        2,
                    )

    # ==========================
    # ESTADO CASCOS
    # ==========================
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

    # ==========================
    # GUARDAR IMAGEN
    # ==========================
    base_name = os.path.basename(image_path)
    processed_name = base_name.replace(".jpg", "_processed.jpg")
    processed_path = os.path.join(
        settings.PROCESSED_DIR,
        processed_name,
    )

    os.makedirs(settings.PROCESSED_DIR, exist_ok=True)

    cv2.imwrite(
        processed_path,
        frame,
        [cv2.IMWRITE_JPEG_QUALITY, 75],
    )

    return {
        "persons": persons,
        "helmets": helmets,
        "no_helmets": no_helmets,
        "helmet_status": helmet_status,
        "processed_image": processed_path,
    }
