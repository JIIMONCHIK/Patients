from fastapi import APIRouter
from app.api.v1.endpoints import patients
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import specializations
from app.api.v1.endpoints import doctors
from app.api.v1.endpoints import schedules
from app.api.v1.endpoints import slots
from app.api.v1.endpoints import medical_records
from app.api.v1.endpoints import appointments


api_router = APIRouter()
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(specializations.router, prefix="/specializations", tags=["specializations"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(slots.router, prefix="/slots", tags=["slots"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(medical_records.router, prefix="/medical-records", tags=["medical_records"])