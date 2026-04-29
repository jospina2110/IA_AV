import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "IA_AV"
    VERSION: str = "1.0.0"

    # =========================
    # STORAGE
    # =========================
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "data/images")
    PROCESSED_DIR: str = os.getenv("PROCESSED_DIR", "data/processed")
    EVENTS_FILE: str = os.getenv("EVENTS_FILE", "data/events.json")

    # =========================
    # YOLO
    # =========================
    YOLO_MODEL: str = os.getenv("YOLO_MODEL", "yolov8n.pt")
    YOLO_CONF: float = float(os.getenv("YOLO_CONF", "0.35"))
    YOLO_IOU: float = float(os.getenv("YOLO_IOU", "0.5"))
    YOLO_PPE_MODEL: str = os.getenv("YOLO_PPE_MODEL", "app/models/best.pt")

    # =========================
    # ESP32 AUTH
    # =========================
    DEVICE_API_KEY: str = os.getenv("DEVICE_API_KEY", "")

    # =========================
    # JWT AUTH
    # =========================
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # =========================
    # ADMIN
    # =========================
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")

    # =========================
    # TELEGRAM
    # =========================
    TG_BOT_TOKEN: str = os.getenv("TG_BOT_TOKEN", "")
    TG_CHAT_ID: str = os.getenv("TG_CHAT_ID", "")
    TG_ANTI_SPAM_SECONDS: int = int(os.getenv("TG_ANTI_SPAM_SECONDS", "10"))

    # =========================
    # URLS
    # =========================
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")  # ✅ añadido


settings = Settings()
