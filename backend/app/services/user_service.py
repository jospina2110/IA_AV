import json
import os
from threading import Lock

from app.models.user import User
from app.core.security import hash_password, verify_password

USERS_FILE = "data/users.json"
USERS_TMP = USERS_FILE + ".tmp"
_lock = Lock()


def _ensure_file():
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def _read() -> list[dict]:
    _ensure_file()
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def _write(users: list[dict]) -> None:
    with open(USERS_TMP, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)
    os.replace(USERS_TMP, USERS_FILE)


def get_user(username: str) -> dict | None:
    with _lock:
        users = _read()
    return next((u for u in users if u.get("username") == username), None)


def authenticate_user(username: str, password: str) -> dict | None:
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user


def create_user(username: str, password: str, role: str = "user") -> dict:
    with _lock:
        users = _read()
        if any(u.get("username") == username for u in users):
            raise ValueError(f"Usuario '{username}' ya existe")
        new_user = User(
            username=username,
            password_hash=hash_password(password),
            role=role,
        )
        users.append(new_user.to_dict())
        _write(users)
    return new_user.to_dict()


register_user = create_user


def list_users() -> list[dict]:
    with _lock:
        return _read()


def delete_user(username: str) -> bool:
    with _lock:
        users = _read()
        filtered = [u for u in users if u.get("username") != username]
        if len(filtered) == len(users):
            return False
        _write(filtered)
    return True
