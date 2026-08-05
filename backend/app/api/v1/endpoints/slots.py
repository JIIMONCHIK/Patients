from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.slot import AppointmentSlot, AppointmentSlotCreate, AppointmentSlotUpdate
from app.crud.slot import appointment_slot

router = APIRouter()

@router.get("/", response_model=List[AppointmentSlot])
async def read_slots(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await appointment_slot.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=AppointmentSlot, status_code=status.HTTP_201_CREATED)
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