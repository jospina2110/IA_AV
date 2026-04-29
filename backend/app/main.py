from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# =========================
# ROUTES
# =========================
from app.api.routes.upload import router as upload_router
from app.api.routes.events import router as events_router
from app.api.routes.auth import router as auth_router

# =========================
# CONFIG
# =========================
from app.core.config import settings


# =========================
# APP INIT
# =========================
app = FastAPI(
    title="AV SmartSite",
    version=settings.VERSION,
    description="Sistema inteligente de supervisión de obra con IA + ESP32 + JWT",
)


# =========================
# CORS CONFIG
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# STORAGE DIRS
# =========================
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
os.makedirs("data", exist_ok=True)


# =========================
# STATIC FILES
# =========================
app.mount("/media", StaticFiles(directory=settings.PROCESSED_DIR), name="media")


# =========================
# API ROUTES
# =========================
app.include_router(upload_router, prefix="/api", tags=["ESP32 Upload"])

app.include_router(events_router, prefix="/api", tags=["Events Dashboard"])

app.include_router(auth_router, prefix="/api", tags=["Authentication"])


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "message": "SmartSite backend activo 🚀",
        "features": [
            "ESP32 API Key Security",
            "Dashboard JWT Auth",
            "AI Detection",
            "Telegram Alerts",
            "Live Monitoring",
        ],
    }


# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "upload_dir": settings.UPLOAD_DIR,
        "processed_dir": settings.PROCESSED_DIR,
        "auth": "enabled",
        "media_server": "/media",
    }
