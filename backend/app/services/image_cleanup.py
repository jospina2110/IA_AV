import os
from pathlib import Path

IMAGE_DIR = Path("data/images")
MAX_IMAGES = 15


def cleanup_old_images(force_all: bool = False):
    if not IMAGE_DIR.exists():
        return

    files = sorted(
        [f for f in IMAGE_DIR.glob("*.jpg") if f.is_file()],
        key=lambda x: x.stat().st_mtime,
    )

    # ✅ force_all elimina todo, normal solo las más antiguas
    to_delete = files if force_all else files[: max(0, len(files) - MAX_IMAGES)]

    for file_path in to_delete:
        try:
            file_path.unlink()
        except Exception:
            pass
