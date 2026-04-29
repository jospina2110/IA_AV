from fastapi import APIRouter, HTTPException
from app.schemas.auth import LoginRequest
from app.core.security import (
    create_access_token,
    verify_password,
    hash_password,
)
from app.core.config import settings

router = APIRouter()

# =========================
# TEMP ADMIN USER
# =========================
fake_admin = {
    "username": settings.ADMIN_USERNAME,
    "password_hash": hash_password(settings.ADMIN_PASSWORD),
}


# =========================
# LOGIN
# =========================
@router.post("/auth/login")
def login(credentials: LoginRequest):

    if credentials.username != fake_admin["username"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(credentials.password, fake_admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": credentials.username, "role": "admin"})

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": credentials.username,
        "role": "admin",
    }


# =========================
# HEALTH
# =========================
@router.get("/auth/health")
def auth_health():
    return {"status": "success", "message": "Auth system active"}
