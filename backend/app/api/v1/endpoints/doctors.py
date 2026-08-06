from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.doctor import Doctor, DoctorCreate, DoctorUpdate
from app.models.doctor import Doctor as DoctorModel 
from app.crud.doctor import doctor
from sqlalchemy.orm import selectinload
from sqlalchemy import select

router = APIRouter()

@router.get("", response_model=List[Doctor])
async def read_doctors(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
        select(DoctorModel)
        .options(selectinload(DoctorModel.specialization))
        .offset(skip)
        .limit(limit)
    )
    doctors = result.scalars().all()
    return doctors

@router.post("", response_model=Doctor, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    *,
    db: AsyncSession = Depends(get_db),
    doctor_in: DoctorCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    if doctor_in.user_id:
        user = await db.get(User, doctor_in.user_id)
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        if user.role != UserRole.DOCTOR:
            raise HTTPException(status_code=400, detail="User must have role 'doctor'")
    # создаём через CRUD
    new_doctor = await doctor.create(db, obj_in=doctor_in)
    # перезагружаем объект с загруженной специализацией
    result = await db.execute(
        select(DoctorModel)
        .options(selectinload(DoctorModel.specialization))
        .where(DoctorModel.id == new_doctor.id)
    )
    return result.scalars().first()

@router.get("/{doctor_id}", response_model=Doctor)
async def read_doctor(
    *,
    db: AsyncSession = Depends(get_db),
    doctor_id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
            select(DoctorModel)
            .options(selectinload(DoctorModel.specialization))
            .where(DoctorModel.id==doctor_id)
        )
    db_doctor = result.scalars().first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return db_doctor

@router.put("/{doctor_id}", response_model=Doctor)
async def update_doctor(
    *,
    db: AsyncSession = Depends(get_db),
    doctor_id: UUID,
    doctor_in: DoctorUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    db_doctor = await doctor.get(db, id=doctor_id)
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    updated_doctor = await doctor.update(db, db_obj=db_doctor, obj_in=doctor_in)
    # перезагружаем, чтобы подтянуть специализацию
    result = await db.execute(
        select(DoctorModel)
        .options(selectinload(DoctorModel.specialization))
        .where(DoctorModel.id == doctor_id)
    )
    return result.scalars().first()

@router.delete("/{doctor_id}", response_model=Doctor)
async def delete_doctor(
    *,
    db: AsyncSession = Depends(get_db),
    doctor_id: UUID,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    # Загружаем врача с подгруженной специализацией перед удалением
    result = await db.execute(
        select(DoctorModel)
        .options(selectinload(DoctorModel.specialization))
        .where(DoctorModel.id == doctor_id)
    )
    db_doctor = result.scalars().first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Удаляем
    await db.delete(db_doctor)
    await db.commit()
    return db_doctor