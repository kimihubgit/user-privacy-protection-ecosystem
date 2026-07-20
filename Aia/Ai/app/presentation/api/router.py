from fastapi import APIRouter

from app.presentation.api.health import router as health_router
from app.presentation.api.analyze import router as analyze_router

api_router = APIRouter()

api_router.include_router(health_router)

api_router.include_router(analyze_router)