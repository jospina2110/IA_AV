import json
import os
from threading import Lock

from app.models.user import User
from app.core.security import hash_password

USERS_FILE = "data/users.json"
_lock = Lock()


# =========================
# FILE INIT
# =========================
def _ensure_file():
    os.makedirs("data", exist_ok=True)

    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


# =========================
# LOAD USERS
# =========================
def load_users():
    _ensure_file()

    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


# =========================
# SAVE USERS
# =========================
def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


# =========================
# FIND USER
# =========================
def get_user(username: str):
    users = load_users()

    for user in users:
        if user["username"] == username:
            return user

    return None


# =========================
# REGISTER USER
# =========================
def register_user(username: str, password: str, role: str = "user"):
    with _lock:
        users = load_users()

        # Verificar si existe
        for user in users:
            if user["username"] == username:
                return None

        new_user = User(
            username=username,
            password_hash=hash_password(password),
            role=role,
        )

        users.append(new_user.to_dict())

        save_users(users)

        return new_user


# =========================
# LIST USERS
# =========================
def list_users():
    return load_users()


# =========================
# DELETE USER
# =========================
def delete_user(username: str):
    with _lock:
        users = load_users()

        filtered_users = [user for user in users if user["username"] != username]

        if len(filtered_users) == len(users):
            return False

        save_users(filtered_users)

        return True
