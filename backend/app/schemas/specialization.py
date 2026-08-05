from pydantic import BaseModel, Field
import uuid
from typing import Optional

class SpecializationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class SpecializationCreate(SpecializationBase):
    pass

class SpecializationUpdate(SpecializationBase):
    name: Optional[str] = Field(None, min_length=1, max_length=100)

class SpecializationInDBBase(SpecializationBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}

class Specialization(SpecializationInDBBase):
    pass