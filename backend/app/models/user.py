from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    username: str
    password_hash: str
    role: str = "user"
    created_at: datetime = datetime.utcnow()

    def to_dict(self):
        return {
            "username": self.username,
            "password_hash": self.password_hash,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }
