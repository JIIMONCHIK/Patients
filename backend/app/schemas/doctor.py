from pydantic import BaseModel, Field
from typing import Optional
import uuid

class DoctorBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    specialization_id: Optional[uuid.UUID] = None
    cabinet: Optional[str] = None

class DoctorCreate(DoctorBase):
    user_id: Optional[uuid.UUID] = None  # если создаётся учётка врача

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization_id: Optional[uuid.UUID] = None
    cabinet: Optional[str] = None

class DoctorInDBBase(DoctorBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    specialization_name: Optional[str] = None

    model_config = {"from_attributes": True}

class Doctor(DoctorInDBBase):
    pass