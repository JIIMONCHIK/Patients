from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.api.dependencies import get_db, require_role
from app.schemas.patient import Patient, PatientCreate, PatientUpdate
from app.crud.patient import patient

router = APIRouter()

@router.get("/", response_model=List[Patient])
async def read_patients(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.REGISTRAR, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT])),
) -> Any:
    patients = await patient.get_multi(db, skip=skip, limit=limit)
    return patients

@router.post("/", response_model=Patient, status_code=status.HTTP_201_CREATED)
async def create_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_in: PatientCreate,
    current_user: User = Depends(require_role([UserRole.REGISTRAR, UserRole.ADMIN])),
) -> Any:
    return await patient.create(db, obj_in=patient_in)

@router.get("/{patient_id}", response_model=Patient)
async def read_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: UUID,
    current_user: User = Depends(require_role([UserRole.REGISTRAR, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT])),
) -> Any:
    db_patient = await patient.get(db, id=patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

@router.put("/{patient_id}", response_model=Patient)
async def update_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: UUID,
    patient_in: PatientUpdate,
    current_user: User = Depends(require_role([UserRole.REGISTRAR, UserRole.ADMIN])),
) -> Any:
    db_patient = await patient.get(db, id=patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await patient.update(db, db_obj=db_patient, obj_in=patient_in)

@router.delete("/{patient_id}", response_model=Patient)
async def delete_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: UUID,
    current_user: User = Depends(require_role([UserRole.REGISTRAR, UserRole.ADMIN])),
) -> Any:
    db_patient = await patient.remove(db, id=patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient