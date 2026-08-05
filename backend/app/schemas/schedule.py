from pydantic import BaseModel, Field
from typing import Optional
from datetime import time
import uuid

class ScheduleTemplateBase(BaseModel):
    doctor_id: uuid.UUID
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Пн, 6=Вс
    start_time: time
    end_time: time

class ScheduleTemplateCreate(ScheduleTemplateBase):
    pass

class ScheduleTemplateUpdate(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class ScheduleTemplateInDBBase(ScheduleTemplateBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}

class ScheduleTemplate(ScheduleTemplateInDBBase):
    pass