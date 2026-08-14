from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.models.slot import AppointmentSlot as AppointmentSlotModel  # ORM-модель
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.slot import AppointmentSlot, AppointmentSlotCreate, AppointmentSlotUpdate  # Pydantic-схемы
from app.crud.slot import appointment_slot
from datetime import datetime, timezone

router = APIRouter()

@router.get("", response_model=List[AppointmentSlot])
async def read_slots(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    doctor_id: Optional[UUID] = None,
    is_available: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    query = select(AppointmentSlotModel)
    if doctor_id:
        query = query.where(AppointmentSlotModel.doctor_id == doctor_id)
    if is_available is not None:
        query = query.where(AppointmentSlotModel.is_available == is_available)
    
    # Скрываем все слоты, время начала которых уже прошло
    query = query.where(AppointmentSlotModel.start_datetime > datetime.now(timezone.utc))
    
    # Сортируем по возрастанию времени
    query = query.order_by(AppointmentSlotModel.start_datetime)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=AppointmentSlot, status_code=status.HTTP_201_CREATED)
async def create_slot(
    *,
    db: AsyncSession = Depends(get_db),
    slot_in: AppointmentSlotCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    return await appointment_slot.create(db, obj_in=slot_in)

@router.get("/{slot_id}", response_model=AppointmentSlot)
async def read_slot(
    *,
    db: AsyncSession = Depends(get_db),
    slot_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    slot = await appointment_slot.get(db, id=slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return slot

@router.put("/{slot_id}", response_model=AppointmentSlot)
async def update_slot(
    *,
    db: AsyncSession = Depends(get_db),
    slot_id: UUID,
    slot_in: AppointmentSlotUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    slot = await appointment_slot.get(db, id=slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return await appointment_slot.update(db, db_obj=slot, obj_in=slot_in)

@router.delete("/{slot_id}", response_model=AppointmentSlot)
async def delete_slot(
    *,
    db: AsyncSession = Depends(get_db),
    slot_id: UUID,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    slot = await appointment_slot.remove(db, id=slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return slot