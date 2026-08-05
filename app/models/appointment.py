import uuid
from sqlalchemy import ForeignKey, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
import enum
from typing import Optional
from datetime import date, datetime, time


class AppointmentStatus(str, enum.Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("appointment_slots.id"), unique=True, nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patient_profiles.id"), nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(SAEnum(AppointmentStatus), default=AppointmentStatus.BOOKED)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    slot: Mapped["AppointmentSlot"] = relationship("AppointmentSlot", back_populates="appointment")
    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="appointments")
    medical_record: Mapped[Optional["MedicalRecord"]] = relationship("MedicalRecord", back_populates="appointment", uselist=False)