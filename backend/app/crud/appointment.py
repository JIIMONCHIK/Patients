from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.crud.base import CRUDBase
from app.models.appointment import Appointment, AppointmentStatus
from app.models.slot import AppointmentSlot
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate

class CRUDAppointment(CRUDBase[Appointment, AppointmentCreate, AppointmentUpdate]):
    async def create(self, db: AsyncSession, *, obj_in: AppointmentCreate) -> Appointment:
        # Проверим, что слот существует и доступен
        slot = await db.get(AppointmentSlot, obj_in.slot_id)
        if not slot:
            raise ValueError("Slot not found")
        if not slot.is_available:
            raise ValueError("Slot is not available")
        
        # Проверим, нет ли уже активной записи на этот слот (доп. гарантия)
        existing = await db.execute(
            select(Appointment).where(
                Appointment.slot_id == obj_in.slot_id,
                Appointment.status == AppointmentStatus.BOOKED
            )
        )
        if existing.scalars().first():
            raise ValueError("Slot already booked")
        
        # Создаём запись
        db_obj = Appointment(
            slot_id=obj_in.slot_id,
            patient_id=obj_in.patient_id,
            status=AppointmentStatus.BOOKED,
        )
        db.add(db_obj)
        # Делаем слот недоступным
        slot.is_available = False
        db.add(slot)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def cancel(self, db: AsyncSession, *, appointment_id: str) -> Optional[Appointment]:
        appointment = await self.get(db, appointment_id)
        if not appointment or appointment.status != AppointmentStatus.BOOKED:
            return None
        appointment.status = AppointmentStatus.CANCELLED
        # Освобождаем слот
        slot = await db.get(AppointmentSlot, appointment.slot_id)
        if slot:
            slot.is_available = True
            db.add(slot)
        db.add(appointment)
        await db.commit()
        await db.refresh(appointment)
        return appointment

appointment = CRUDAppointment(Appointment)