from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from backend.app.models.user import UserRole

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
    role: UserRole = UserRole.PATIENT  # по умолчанию пациент

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDBBase(BaseModel):
    id: str
    email: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass