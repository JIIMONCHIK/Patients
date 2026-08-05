import uuid
from sqlalchemy import ForeignKey, Time, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base
from datetime import date, datetime, time


class ScheduleTemplate(Base):
    __tablename__ = "schedule_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    doctor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("doctors.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Пн, 6=Вс
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="schedule_templates")