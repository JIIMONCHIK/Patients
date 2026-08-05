from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from backend.app.models.appointment import AppointmentStatus

class AppointmentBase(BaseModel):
    slot_id: uuid.UUID
    patient_id: uuid.UUID
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