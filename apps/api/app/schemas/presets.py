from pydantic import BaseModel
from typing import Optional, Dict, Any


class PresetResponse(BaseModel):
    id: str
    category: str
    name_en: str
    name_hi: str
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    metadata: Dict[str, Any] = {}
    sort_order: int

    class Config:
        from_attributes = True

