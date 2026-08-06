from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.schedule import ScheduleTemplate, ScheduleTemplateCreate, ScheduleTemplateUpdate
from app.crud.schedule import schedule_template

router = APIRouter()

@router.get("", response_model=List[ScheduleTemplate])
async def read_schedules(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await schedule_template.get_multi(db, skip=skip, limit=limit)

@router.post("", response_model=ScheduleTemplate, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    schedule_in: ScheduleTemplateCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    return await schedule_template.create(db, obj_in=schedule_in)

@router.get("/{schedule_id}", response_model=ScheduleTemplate)
async def read_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    schedule_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    s = await schedule_template.get(db, id=schedule_id)
    if not s:
        raise HTTPException(status_code=404, detail="Schedule template not found")
    return s

@router.put("/{schedule_id}", response_model=ScheduleTemplate)
async def update_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    schedule_id: UUID,
    schedule_in: ScheduleTemplateUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    s = await schedule_template.get(db, id=schedule_id)
    if not s:
        raise HTTPException(status_code=404, detail="Schedule template not found")
    return await schedule_template.update(db, db_obj=s, obj_in=schedule_in)

@router.delete("/{schedule_id}", response_model=ScheduleTemplate)
async def delete_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    schedule_id: UUID,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    s = await schedule_template.remove(db, id=schedule_id)
    if not s:
        raise HTTPException(status_code=404, detail="Schedule template not found")
    return s