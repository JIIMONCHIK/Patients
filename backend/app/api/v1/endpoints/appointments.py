from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User, UserRole
from backend.app.api.dependencies import get_db, get_current_active_user, require_role
from backend.app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate
from backend.app.crud.appointment import appointment

router = APIRouter()

@router.get("/", response_model=List[Appointment])
async def read_appointments(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    # В зависимости от роли показываем разные наборы
    # Пока упростим: все авторизованные видят все записи (для теста)
    # В реальности нужно фильтровать: пациент видит свои, врач — свои
    return await appointment.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=Appointment, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_in: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    # Проверка прав: пациент может записывать только себя, регистратор/админ — любого
    if current_user.role == UserRole.PATIENT:
        # Пациент должен иметь patient_profile и его id должен совпадать с appointment_in.patient_id
        if not current_user.patient_profile or current_user.patient_profile.id != appointment_in.patient_id:
            raise HTTPException(status_code=403, detail="You can only book appointments for yourself")
    elif current_user.role not in [UserRole.ADMIN, UserRole.REGISTRAR]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        return await appointment.create(db, obj_in=appointment_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{appointment_id}", response_model=Appointment)
async def read_appointment(
    *,
    db: AsyncSession = Depends(get_db),
    appointment_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    appt = await appointment.get(db, id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

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
        if not current_user.patient_profile or current_user.patient_profile.id != appt.patient_id:
            raise HTTPException(status_code=403, detail="Not your appointment")
    elif current_user.role not in [UserRole.ADMIN, UserRole.REGISTRAR]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    cancelled = await appointment.cancel(db, appointment_id=appointment_id)
    if not cancelled:
        raise HTTPException(status_code=400, detail="Appointment cannot be cancelled")
    return cancelled