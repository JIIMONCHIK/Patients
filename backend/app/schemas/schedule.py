from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import time
import uuid

class ScheduleTemplateBase(BaseModel):
    doctor_id: uuid.UUID
    day_of_week: Optional[int] = Field(..., ge=0, le=6)  # 0=Пн, 6=Вс
    start_time: time
    end_time: time
    slot_duration: int = 30  # длительность слота по умолчанию

class ScheduleTemplateCreate(BaseModel):
    doctor_id: uuid.UUID
    days_of_week: Optional[List[int]] = None
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: time
    end_time: time
    slot_duration: int = 30

class ScheduleTemplateUpdate(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration: Optional[int] = None

class ScheduleTemplateInDBBase(ScheduleTemplateBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}

class ScheduleTemplate(ScheduleTemplateInDBBase):
    pass