from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.medical_record import MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse
from app.crud.medical_record import medical_record
from app.models.appointment import Appointment, AppointmentStatus
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.slot import AppointmentSlot
from app.models.medical_record import MedicalRecord as MedicalRecordModel
from app.models.doctor import Doctor as DoctorModel

router = APIRouter()

@router.get("", response_model=List[MedicalRecordResponse])
async def read_medical_records(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
        select(MedicalRecordModel)
        .options(
            selectinload(MedicalRecordModel.appointment)
            .selectinload(Appointment.patient),
            selectinload(MedicalRecordModel.appointment)
            .selectinload(Appointment.slot)
        )
        .offset(skip)
        .limit(limit)
    )
    records = result.unique().scalars().all()

    response = []
    for rec in records:
        response.append({
            "id": rec.id,
            "appointment_id": rec.appointment_id,
            "diagnosis": rec.diagnosis,
            "complaints": rec.complaints,
            "prescriptions": rec.prescriptions,
            "recommendations": rec.recommendations,
            "created_at": rec.created_at,
            "updated_at": rec.updated_at,
            "patient_name": rec.appointment.patient.full_name if rec.appointment and rec.appointment.patient else None,
            "appointment_start_datetime": rec.appointment.slot.start_datetime if rec.appointment and rec.appointment.slot else None,
        })
    return response

@router.post("", response_model=MedicalRecord, status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_in: MedicalRecordCreate,
    current_user: User = Depends(require_role([UserRole.DOCTOR, UserRole.ADMIN])),
) -> Any:
    # Проверяем, что приём существует
    appt = await db.get(Appointment, record_in.appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.status != AppointmentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Appointment must be completed")

    # Проверяем, что медицинская запись ещё не создана
    existing = await db.scalar(
        select(MedicalRecordModel).where(
            MedicalRecordModel.appointment_id == record_in.appointment_id
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Medical record already exists for this appointment")

    # Если врач, то проверяем, что это его приём
    if current_user.role == UserRole.DOCTOR:
        # Загружаем профиль врача через БД (не через current_user.doctor!)
        doctor = await db.scalar(
            select(DoctorModel).where(DoctorModel.user_id == current_user.id)
        )
        if not doctor:
            raise HTTPException(status_code=403, detail="Doctor profile not found")
        # Загружаем слот приёма
        slot = await db.get(AppointmentSlot, appt.slot_id)
        if not slot or slot.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not your appointment")

    # Создаём медицинскую запись
    record = await medical_record.create(db, obj_in=record_in)
    return record

@router.get("/{record_id}", response_model=MedicalRecordResponse)
async def read_medical_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
        select(MedicalRecordModel)
        .options(
            selectinload(MedicalRecordModel.appointment)
            .selectinload(Appointment.patient),
            selectinload(MedicalRecordModel.appointment)
            .selectinload(Appointment.slot)
        )
        .where(MedicalRecordModel.id == record_id)
    )
    rec = result.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record not found")

    return {
        "id": rec.id,
        "appointment_id": rec.appointment_id,
        "diagnosis": rec.diagnosis,
        "complaints": rec.complaints,
        "prescriptions": rec.prescriptions,
        "recommendations": rec.recommendations,
        "created_at": rec.created_at,
        "updated_at": rec.updated_at,
        "patient_name": rec.appointment.patient.full_name if rec.appointment and rec.appointment.patient else None,
        "appointment_start_datetime": rec.appointment.slot.start_datetime if rec.appointment and rec.appointment.slot else None,
    }

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