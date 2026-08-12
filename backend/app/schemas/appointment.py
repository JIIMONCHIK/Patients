from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.models.appointment import AppointmentStatus

class AppointmentBase(BaseModel):
    slot_id: uuid.UUID
    patient_id: Optional[uuid.UUID] = None
    status: Optional[AppointmentStatus] = AppointmentStatus.BOOKED

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None

class AppointmentInDBBase(AppointmentBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}

class Appointment(AppointmentInDBBase):
    pass

class AppointmentResponse(AppointmentInDBBase):
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None