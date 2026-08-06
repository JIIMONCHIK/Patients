from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.medical_record import MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate
from app.crud.medical_record import medical_record
from app.models.appointment import Appointment, AppointmentStatus

router = APIRouter()

@router.get("", response_model=List[MedicalRecord])
async def read_medical_records(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    # В реальности нужно фильтровать по врачу или пациенту
    return await medical_record.get_multi(db, skip=skip, limit=limit)

@router.post("", response_model=MedicalRecord, status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_in: MedicalRecordCreate,
    current_user: User = Depends(require_role([UserRole.DOCTOR, UserRole.ADMIN])),
) -> Any:
    # Проверяем, что запись на приём существует и её статус BOOKED
    appt = await db.get(Appointment, record_in.appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=400, detail="Appointment is not in booked status")
    
    # Врач может создавать запись только для своих приёмов (если роль DOCTOR)
    if current_user.role == UserRole.DOCTOR:
        if not current_user.doctor or appt.slot.doctor_id != current_user.doctor.id:
            raise HTTPException(status_code=403, detail="Not your appointment")
    
    # Создаём медицинскую запись
    record = await medical_record.create(db, obj_in=record_in)
    # Меняем статус приёма на COMPLETED
    appt.status = AppointmentStatus.COMPLETED
    db.add(appt)
    await db.commit()
    await db.refresh(record)
    return record

@router.get("/{record_id}", response_model=MedicalRecord)
async def read_medical_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    rec = await medical_record.get(db, id=record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return rec

@router.put("/{record_id}", response_model=MedicalRecord)
async def update_medical_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: UUID,
    record_in: MedicalRecordUpdate,
    current_user: User = Depends(require_role([UserRole.DOCTOR, UserRole.ADMIN])),
) -> Any:
    rec = await medical_record.get(db, id=record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record not found")
    # Только врач, создавший запись, или админ может редактировать
    if current_user.role == UserRole.DOCTOR:
        if not current_user.doctor or rec.appointment.slot.doctor_id != current_user.doctor.id:
            raise HTTPException(status_code=403, detail="Not your record")
    return await medical_record.update(db, db_obj=rec, obj_in=record_in)

@router.delete("/{record_id}", response_model=MedicalRecord)
async def delete_medical_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: UUID,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
) -> Any:
    rec = await medical_record.remove(db, id=record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return rec