from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date
import uuid

class PatientBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    policy_number: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    # Все поля необязательные для обновления
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)

class PatientInDBBase(PatientBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None

    model_config = {"from_attributes": True}

class Patient(PatientInDBBase):
    pass