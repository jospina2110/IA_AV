import os
from datetime import datetime
from app.core.config import settings

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)


def save_raw_image(image_bytes: bytes) -> str:
    filename = datetime.now().strftime("%Y%m%d_%H%M%S") + ".jpg"
    path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(image_bytes)

    return path


def build_image_url(file_path: str) -> str:
    filename = os.path.basename(file_path)
    return f"{settings.BACKEND_URL}/media/{filename}"
