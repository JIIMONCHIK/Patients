from typing import Any, List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.crud.appointment import appointment
from app.models.patient import PatientProfile
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.slot import AppointmentSlot
from app.models.appointment import Appointment as AppointmentModel
from app.models.doctor import Doctor as DoctorModel
from app.models.appointment import AppointmentStatus

router = APIRouter()

@router.get("", response_model=List[AppointmentResponse])
async def read_appointments(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[UUID] = None,
    doctor_id: Optional[UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    specialization_id: Optional[UUID] = None,
    status: Optional[AppointmentStatus] = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    query = select(AppointmentModel)

    if current_user.role == UserRole.PATIENT:
        patient_profile = await db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == current_user.id)
        )
        if not patient_profile:
            raise HTTPException(status_code=400, detail="Patient profile not found")
        patient_id = patient_profile.id  # принудительный фильтр

    if current_user.role == UserRole.DOCTOR:
        doctor = await db.scalar(
            select(DoctorModel).where(DoctorModel.user_id == current_user.id)
        )
        if not doctor:
            raise HTTPException(status_code=400, detail="Doctor profile not found")
        doctor_id = doctor.id
        
    if patient_id:
        query = query.where(AppointmentModel.patient_id == patient_id)

    slot_joined = False
    doctor_joined = False

    if doctor_id or date_from or date_to or specialization_id:
        query = query.join(AppointmentModel.slot)
        slot_joined = True

        if doctor_id:
            query = query.where(AppointmentSlot.doctor_id == doctor_id)
        if date_from:
            query = query.where(AppointmentSlot.start_datetime >= date_from)
        if date_to:
            query = query.where(AppointmentSlot.start_datetime <= date_to)

    if specialization_id:
        if not slot_joined:
            query = query.join(AppointmentModel.slot)
        if not doctor_joined:
            query = query.join(AppointmentSlot.doctor)
        query = query.where(DoctorModel.specialization_id == specialization_id)

    if status:
        query = query.where(AppointmentModel.status == status)

    query = query.order_by(AppointmentModel.created_at.desc())

    query = query.options(
        selectinload(AppointmentModel.slot).selectinload(AppointmentSlot.doctor),
        selectinload(AppointmentModel.patient)
    ).offset(skip).limit(limit)
    result = await db.execute(query)
    appointments = result.unique().scalars().all()

    response = []
    for a in appointments:
        response.append({
            "id": a.id,
            "slot_id": a.slot_id,
            "patient_id": a.patient_id,
            "status": a.status,
            "created_at": a.created_at,
            "patient_name": a.patient.full_name if a.patient else None,
            "doctor_name": a.slot.doctor.full_name if a.slot and a.slot.doctor else None,
            "start_datetime": a.slot.start_datetime if a.slot else None,
            "end_datetime": a.slot.end_datetime if a.slot else None,
        })
    return response

@router.post("", response_model=Appointment, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_in: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    if current_user.role == UserRole.PATIENT:
        patient_profile = await db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == current_user.id)
        )
        if not patient_profile:
            raise HTTPException(status_code=400, detail="Patient profile not found")
        appointment_in.patient_id = patient_profile.id
    else:
        # Админ/регистратор: patient_id обязателен
        if not appointment_in.patient_id:
            raise HTTPException(status_code=400, detail="patient_id is required")
        # Проверка существования пациента
        patient = await db.get(PatientProfile, appointment_in.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
    try:
        return await appointment.create(db, obj_in=appointment_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def read_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
        select(AppointmentModel)
        .options(
            selectinload(AppointmentModel.slot).selectinload(AppointmentSlot.doctor),
            selectinload(AppointmentModel.patient)
        )
        .where(AppointmentModel.id == appointment_id)
    )
    a = result.scalars().first()
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {
        "id": a.id,
        "slot_id": a.slot_id,
        "patient_id": a.patient_id,
        "status": a.status,
        "created_at": a.created_at,
        "patient_name": a.patient.full_name if a.patient else None,
        "doctor_name": a.slot.doctor.full_name if a.slot and a.slot.doctor else None,
        "start_datetime": a.slot.start_datetime if a.slot else None,
        "end_datetime": a.slot.end_datetime if a.slot else None,
    }

@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_id: UUID,
    appointment_in: AppointmentUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    appt = await appointment.get(db, id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return await appointment.update(db, db_obj=appt, obj_in=appointment_in)

@router.delete("/{appointment_id}/cancel", response_model=Appointment)
async def cancel_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    appt = await appointment.get(db, id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    # Проверка прав: отменить может только пациент, чья запись, или админ/регистратор
    if current_user.role == UserRole.PATIENT:
        patient_profile = await db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == current_user.id)
        )
        if not patient_profile or patient_profile.id != appt.patient_id:
            raise HTTPException(status_code=403, detail="Not your appointment")
    elif current_user.role not in [UserRole.ADMIN, UserRole.REGISTRAR]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    cancelled = await appointment.cancel(db, appointment_id=appointment_id)
    if not cancelled:
        raise HTTPException(status_code=400, detail="Appointment cannot be cancelled")
    return cancelled

@router.post("/{appointment_id}/complete", response_model=AppointmentResponse)
async def complete_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    appt = await db.get(AppointmentModel, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.DOCTOR:
        # Проверяем, что это приём данного врача
        doctor = await db.scalar(
            select(DoctorModel).where(DoctorModel.user_id == current_user.id)
        )
        if not doctor:
            raise HTTPException(status_code=400, detail="Doctor profile not found")
        slot = await db.get(AppointmentSlot, appt.slot_id)
        if not slot or slot.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not your appointment")
    elif current_user.role not in [UserRole.ADMIN, UserRole.REGISTRAR]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Меняем статус на completed
    appt.status = AppointmentStatus.COMPLETED
    db.add(appt)
    await db.commit()
    await db.refresh(appt)

    # Формируем ответ с дополнительными полями (как в read)
    result = await db.execute(
        select(AppointmentModel)
        .options(
            selectinload(AppointmentModel.slot).selectinload(AppointmentSlot.doctor),
            selectinload(AppointmentModel.patient)
        )
        .where(AppointmentModel.id == appointment_id)
    )
    a = result.scalars().first()
    return {
        "id": a.id,
        "slot_id": a.slot_id,
        "patient_id": a.patient_id,
        "status": a.status,
        "created_at": a.created_at,
        "patient_name": a.patient.full_name if a.patient else None,
        "doctor_name": a.slot.doctor.full_name if a.slot and a.slot.doctor else None,
        "start_datetime": a.slot.start_datetime if a.slot else None,
        "end_datetime": a.slot.end_datetime if a.slot else None,
    }