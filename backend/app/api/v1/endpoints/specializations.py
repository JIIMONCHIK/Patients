from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.specialization import Specialization, SpecializationCreate, SpecializationUpdate
from app.crud.specialization import specialization

router = APIRouter()

@router.get("", response_model=List[Specialization])
async def read_specializations(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await specialization.get_multi(db, skip=skip, limit=limit)

@router.post("", response_model=Specialization, status_code=status.HTTP_201_CREATED)
async def create_specialization(
    *,
    db: AsyncSession = Depends(get_db),
    spec_in: SpecializationCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    return await specialization.create(db, obj_in=spec_in)

@router.get("/{specialization_id}", response_model=Specialization)
async def read_specialization(
    *,
    db: AsyncSession = Depends(get_db),
    specialization_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    spec = await specialization.get(db, id=specialization_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    return spec

@router.put("/{specialization_id}", response_model=Specialization)
async def update_specialization(
    *,
    db: AsyncSession = Depends(get_db),
    specialization_id: UUID,
    spec_in: SpecializationUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    spec = await specialization.get(db, id=specialization_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    return await specialization.update(db, db_obj=spec, obj_in=spec_in)

@router.delete("/{specialization_id}", response_model=Specialization)
async def delete_specialization(
    *,
    db: AsyncSession = Depends(get_db),
    specialization_id: UUID,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    spec = await specialization.remove(db, id=specialization_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    return spec