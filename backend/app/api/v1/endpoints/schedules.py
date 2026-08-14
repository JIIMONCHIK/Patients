from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, get_current_active_user, require_role
from app.schemas.schedule import ScheduleTemplate, ScheduleTemplateCreate, ScheduleTemplateUpdate
from app.crud.schedule import schedule_template
from app.models.slot import AppointmentSlot
from sqlalchemy import select, delete, exists
from datetime import datetime, timedelta, timezone, time
from app.models.schedule import ScheduleTemplate as ScheduleTemplateModel
from app.models.appointment import Appointment


router = APIRouter()

@router.get("", response_model=List[ScheduleTemplate])
async def read_schedules(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return await schedule_template.get_multi(db, skip=skip, limit=limit)

@router.post("", response_model=List[ScheduleTemplate], status_code=status.HTTP_201_CREATED)
async def create_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    schedule_in: ScheduleTemplateCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    days = []
    if schedule_in.days_of_week:
        days = schedule_in.days_of_week
    elif schedule_in.day_of_week is not None:
        days = [schedule_in.day_of_week]
    else:
        raise HTTPException(status_code=400, detail="Необходимо указать days_of_week или day_of_week")

    created = []
    for day in days:
        # Проверка, что нет дубля для этого врача и дня? (опционально)
        template = ScheduleTemplateModel(
            doctor_id=schedule_in.doctor_id,
            day_of_week=day,
            start_time=schedule_in.start_time,
            end_time=schedule_in.end_time,
            slot_duration=schedule_in.slot_duration,
        )
        db.add(template)
        created.append(template)

    await db.commit()
    for t in created:
        await db.refresh(t)
    return created

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

@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_slots(
    *,
    db: AsyncSession = Depends(get_db),
    days: int = 7,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.REGISTRAR])),
) -> Any:
    today = datetime.now(timezone.utc).date()
    start_date = today + timedelta(days=1)  # начинаем с завтра
    end_date = start_date + timedelta(days=days)

    result = await db.execute(select(ScheduleTemplateModel))
    templates = result.scalars().all()

    if not templates:
        return {"message": "Нет шаблонов расписания"}

    doctor_ids = set(t.doctor_id for t in templates)

    # Удаляем будущие свободные слоты, на которые нет записей
    await db.execute(
        delete(AppointmentSlot).where(
            AppointmentSlot.doctor_id.in_(doctor_ids),
            AppointmentSlot.is_available.is_(True),
            AppointmentSlot.start_datetime >= datetime.combine(start_date, time.min, tzinfo=timezone.utc),
            ~exists().where(Appointment.slot_id == AppointmentSlot.id)
        )
    )

    created_count = 0
    for tpl in templates:
        for day_offset in range((end_date - start_date).days):
            current_date = start_date + timedelta(days=day_offset)
            if current_date.weekday() != tpl.day_of_week:
                continue

            slot_start_dt = datetime.combine(current_date, tpl.start_time, tzinfo=timezone.utc)
            slot_end_dt = datetime.combine(current_date, tpl.end_time, tzinfo=timezone.utc)
            step = timedelta(minutes=tpl.slot_duration)

            current = slot_start_dt
            while current + step <= slot_end_dt:
                # Проверяем, существует ли уже слот для этого врача на это время
                existing_slot = await db.scalar(
                    select(AppointmentSlot).where(
                        AppointmentSlot.doctor_id == tpl.doctor_id,
                        AppointmentSlot.start_datetime == current,
                        AppointmentSlot.end_datetime == current + step,
                    )
                )
                if not existing_slot:
                    new_slot = AppointmentSlot(
                        doctor_id=tpl.doctor_id,
                        start_datetime=current,
                        end_datetime=current + step,
                        is_available=True,
                    )
                    db.add(new_slot)
                    created_count += 1
                current += step

    await db.commit()
    return {"message": f"Создано слотов: {created_count}"}