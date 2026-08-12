from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class ProfileBase(BaseModel):
    email: EmailStr

class ProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    policy_number: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None
    specialization_id: Optional[str] = None
    cabinet: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str  # UUID пользователя
    role: str
    # Пациент
    patient_full_name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    policy_number: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None
    # Врач
    doctor_full_name: Optional[str] = None
    specialization_id: Optional[str] = None
    specialization_name: Optional[str] = None
    cabinet: Optional[str] = None