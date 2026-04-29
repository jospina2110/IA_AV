from fastapi import APIRouter, HTTPException
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
)
from app.core.security import create_access_token
from app.core.config import settings
from app.services.user_service import (
    create_user,
    get_user,
)

router = APIRouter()

# =========================
# ADMIN USER PRINCIPAL
# =========================
fake_admin = {
    "username": settings.ADMIN_USERNAME,
    "password": settings.ADMIN_PASSWORD,
    "role": "admin",
}


# =========================
# LOGIN
# =========================
@router.post("/auth/login")
def login(credentials: LoginRequest):

    print("===== LOGIN DEBUG =====")
    print("INPUT USERNAME:", credentials.username)
    print("=======================")

    # =====================
    # LOGIN ADMIN
    # =====================
    if (
        credentials.username == fake_admin["username"]
        and credentials.password == fake_admin["password"]
    ):

        token = create_access_token(
            {
                "sub": credentials.username,
                "role": "admin",
            }
        )

        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "user": credentials.username,
            "role": "admin",
        }

    # =====================
    # LOGIN USUARIO NORMAL
    # =====================
    user = get_user(credentials.username)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos",
        )

    if credentials.password != user["password"]:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos",
        )

    token = create_access_token(
        {
            "sub": credentials.username,
            "role": user.get("role", "user"),
        }
    )

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": credentials.username,
        "role": user.get("role", "user"),
    }


# =========================
# REGISTRO
# =========================
@router.post("/auth/register")
def register(user_data: RegisterRequest):

    existing_user = get_user(user_data.username)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El usuario ya existe",
        )

    new_user = create_user(
        username=user_data.username,
        password=user_data.password,
        role="user",
    )

    return {
        "status": "success",
        "message": "Usuario registrado correctamente",
        "user": new_user["username"],
        "role": new_user["role"],
    }


# =========================
# AUTH HEALTH
# =========================
@router.get("/auth/health")
def auth_health():
    return {
        "status": "success",
        "message": "Auth system active",
        "admin_user_loaded": settings.ADMIN_USERNAME,
    }
