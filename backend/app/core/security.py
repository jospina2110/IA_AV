from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Header, HTTPException

from app.core.config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# =========================
# ESP32 API KEY ✅ añadida
# =========================
def verify_device_api_key(x_api_key: str = Header(...)):
    if not settings.DEVICE_API_KEY:
        raise HTTPException(status_code=500, detail="DEVICE_API_KEY no configurada")

    if x_api_key != settings.DEVICE_API_KEY:
        raise HTTPException(status_code=403, detail="API Key inválida")

    return {"device_id": "ESP32_CAM_01"}
