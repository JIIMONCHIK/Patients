from fastapi import FastAPI
from backend.app.core.config import settings
from backend.app.api.v1.router import api_router

app = FastAPI(
    title="Clinic Patient Management System",
    version="0.1.0",
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": app.version}

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": app.version}