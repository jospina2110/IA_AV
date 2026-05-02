# app/core/cache.py
import time
from threading import Lock
from typing import Any


class TTLCache:
    """
    Caché en memoria con tiempo de expiración por key.
    Thread-safe. Sin dependencias externas.
    """

    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = Lock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.time() > expires_at:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any, ttl: int = 5) -> None:
        """ttl en segundos."""
        with self._lock:
            self._store[key] = (value, time.time() + ttl)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()


# instancia global — se importa desde cualquier módulo
cache = TTLCache()
