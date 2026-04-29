from fastapi import Header, HTTPException
from app.core.config import settings


def verify_device(x_api_key: str = Header(...), x_device_id: str = Header(...)):
    if x_api_key != settings.DEVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid device API key")

    return x_device_id
