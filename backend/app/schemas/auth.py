from pydantic import BaseModel, Field
from typing import Optional


# =========================
# LOGIN REQUEST
# =========================
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)


# =========================
# REGISTER REQUEST
# =========================
class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[str] = "user"


# =========================
# AUTH RESPONSE
# =========================
class AuthResponse(BaseModel):
    status: str
    access_token: str
    token_type: str
    user: str
    role: str


# =========================
# SIMPLE STATUS RESPONSE
# =========================
class AuthStatusResponse(BaseModel):
    status: str
    message: str
