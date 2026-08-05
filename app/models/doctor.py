import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from typing import Optional

class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), unique=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialization_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("specializations.id"), nullable=True)
    cabinet: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="doctor")
    specialization: Mapped[Optional["Specialization"]] = relationship("Specialization", back_populates="doctors")
    slots: Mapped[list["AppointmentSlot"]] = relationship("AppointmentSlot", back_populates="doctor")
    schedule_templates: Mapped[list["ScheduleTemplate"]] = relationship("ScheduleTemplate", back_populates="doctor")