from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse)
async def health_check():
    return ApiResponse(
        data={
            "status": "healthy",
            "service": "Aabhushan AI API",
            "environment": settings.ENVIRONMENT,
            "ai_provider": settings.AI_PROVIDER,
            "version": "0.1.0",
        }
    )

