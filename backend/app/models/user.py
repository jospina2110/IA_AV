from pydantic import BaseModel, Field
from datetime import datetime, timezone


class User(BaseModel):
    username: str
    password_hash: str
    role: str = "user"
    # ✅ se evalúa en cada instancia, no al importar
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "password_hash": self.password_hash,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }


class UserPublic(BaseModel):
    """Para respuestas API — nunca exponer password_hash."""

    username: str
    role: str
    created_at: datetime
