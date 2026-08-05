from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class AppointmentSlotBase(BaseModel):
    doctor_id: uuid.UUID
    start_datetime: datetime
    end_datetime: datetime
    is_available: bool = True

class AppointmentSlotCreate(AppointmentSlotBase):
    pass

class AppointmentSlotUpdate(BaseModel):
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    is_available: Optional[bool] = None

class AppointmentSlotInDBBase(AppointmentSlotBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}

class AppointmentSlot(AppointmentSlotInDBBase):
    pass