from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import UserRole
import uuid
from datetime import datetime

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=255)
     # Дополнительные поля для пациента
    phone: Optional[str] = None
    birth_date: Optional[datetime] = None
    # Для врача
    specialization_id: Optional[uuid.UUID] = None
    cabinet: Optional[str] = None

    role: UserRole = UserRole.PATIENT  # по умолчанию пациент

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDBBase(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass