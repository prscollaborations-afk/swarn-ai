from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict
from app.core.database import get_db
from app.models.all_models import Preset
from app.schemas.presets import PresetResponse
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/presets", tags=["presets"])


@router.get("", response_model=ApiResponse)
async def get_presets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Preset).order_by(Preset.category, Preset.sort_order))
    presets = result.scalars().all()
    
    categorized: Dict[str, List[Dict]] = {}
    for p in presets:
        categorized.setdefault(p.category, []).append({
            "id": p.id,
            "category": p.category,
            "name_en": p.name_en,
            "name_hi": p.name_hi,
            "description_en": p.description_en,
            "description_hi": p.description_hi,
            "sort_order": p.sort_order,
            "metadata": p.metadata_json or {},
        })
    
    return ApiResponse(data=categorized)

