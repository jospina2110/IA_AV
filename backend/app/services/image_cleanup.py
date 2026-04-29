import os
from pathlib import Path

IMAGE_DIR = Path("data/images")
MAX_IMAGES = 15


def cleanup_old_images(force_all=False):
    if not IMAGE_DIR.exists():
        return

    files = sorted(
        [f for f in IMAGE_DIR.glob("*.jpg") if f.is_file()],
        key=lambda x: x.stat().st_mtime
    )

    # Si excede límite, borrar más antiguas
    if len(files) > MAX_IMAGES:
        to_delete = files[: len(files) - MAX_IMAGES]

        for file_path in to_delete:
            try:
                file_path.unlink()
            except Exception:
                pass