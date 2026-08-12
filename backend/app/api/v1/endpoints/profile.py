from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User as UserModel
from app.models.patient import PatientProfile
from app.models.doctor import Doctor
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.crud.user import user as crud_user

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    # Загружаем пользователя с подгрузкой связей
    result = await db.execute(
        select(UserModel)
        .options(
            selectinload(UserModel.patient_profile),
            selectinload(UserModel.doctor).selectinload(Doctor.specialization)
        )
        .where(UserModel.id == current_user.id)
    )
    user = result.scalars().first()

    data = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role.value,
    }

    if user.patient_profile:
        p = user.patient_profile
        data.update({
            "patient_full_name": p.full_name,
            "phone": p.phone,
            "birth_date": p.birth_date,
            "gender": p.gender,
            "address": p.address,
            "policy_number": p.policy_number,
            "blood_group": p.blood_group,
            "allergies": p.allergies,
            "chronic_diseases": p.chronic_diseases,
        })
    elif user.doctor:
        d = user.doctor
        data.update({
            "doctor_full_name": d.full_name,
            "specialization_id": str(d.specialization_id) if d.specialization_id else None,
            "specialization_name": d.specialization_name,
            "cabinet": d.cabinet,
        })

    return data

@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_in: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    # Загружаем пользователя с подгруженными связями в текущей сессии
    result = await db.execute(
        select(UserModel)
        .options(
            selectinload(UserModel.patient_profile),
            selectinload(UserModel.doctor).selectinload(Doctor.specialization)
        )
        .where(UserModel.id == current_user.id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Обновление email
    if profile_in.email and profile_in.email != user.email:
        existing = await crud_user.get_by_email(db, profile_in.email)
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = profile_in.email
        db.add(user)

    # Обновление профиля пациента
    if user.patient_profile:
        p = user.patient_profile
        if profile_in.full_name is not None:
            p.full_name = profile_in.full_name
        if profile_in.phone is not None:
            p.phone = profile_in.phone
        if profile_in.birth_date is not None:
            p.birth_date = profile_in.birth_date
        if profile_in.gender is not None:
            p.gender = profile_in.gender
        if profile_in.address is not None:
            p.address = profile_in.address
        if profile_in.policy_number is not None:
            p.policy_number = profile_in.policy_number
        if profile_in.blood_group is not None:
            p.blood_group = profile_in.blood_group
        if profile_in.allergies is not None:
            p.allergies = profile_in.allergies
        if profile_in.chronic_diseases is not None:
            p.chronic_diseases = profile_in.chronic_diseases
        db.add(p)

    elif user.doctor:
        d = user.doctor
        if profile_in.full_name is not None:
            d.full_name = profile_in.full_name
        if profile_in.specialization_id is not None:
            d.specialization_id = profile_in.specialization_id
        if profile_in.cabinet is not None:
            d.cabinet = profile_in.cabinet
        db.add(d)

    await db.commit()

    # Формируем ответ из уже загруженных данных (объект `user` всё ещё привязан к сессии после коммита)
    data = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role.value,
    }
    if user.patient_profile:
        p = user.patient_profile
        data.update({
            "patient_full_name": p.full_name,
            "phone": p.phone,
            "birth_date": p.birth_date,
            "gender": p.gender,
            "address": p.address,
            "policy_number": p.policy_number,
            "blood_group": p.blood_group,
            "allergies": p.allergies,
            "chronic_diseases": p.chronic_diseases,
        })
    elif user.doctor:
        d = user.doctor
        data.update({
            "doctor_full_name": d.full_name,
            "specialization_id": str(d.specialization_id) if d.specialization_id else None,
            "specialization_name": d.specialization_name,
            "cabinet": d.cabinet,
        })

    return data