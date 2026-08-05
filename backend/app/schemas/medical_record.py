from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class MedicalRecordBase(BaseModel):
    appointment_id: uuid.UUID
    diagnosis: Optional[str] = None
    complaints: Optional[str] = None
    prescriptions: Optional[str] = None
    recommendations: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    complaints: Optional[str] = None
    prescriptions: Optional[str] = None
    recommendations: Optional[str] = None

class MedicalRecordInDBBase(MedicalRecordBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class MedicalRecord(MedicalRecordInDBBase):
    pass