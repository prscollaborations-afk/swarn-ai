import os
import uuid
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.config import settings
from app.schemas.common import ApiResponse
from app.ai.gemini_provider import get_ai_provider

router = APIRouter(prefix="/assets", tags=["assets"])

# In-memory asset catalog for immediate responsive execution
ASSETS_CACHE = {}


@router.post("/upload", response_model=ApiResponse)
async def upload_asset(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPEG, PNG, WEBP) are accepted."
        )

    content = await file.read()
    asset_id = str(uuid.uuid4())
    
    # Save to local storage
    filename = f"{asset_id}_{file.filename}"
    upload_path = Path(settings.STORAGE_DIR) / "uploads" / filename
    upload_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(upload_path, "wb") as f:
        f.write(content)

    # Analyze jewellery using AI Provider
    ai = get_ai_provider()
    analysis = await ai.analyze(content, file.content_type)

    asset_data = {
        "id": asset_id,
        "filename": file.filename,
        "mime_type": file.content_type,
        "size_bytes": len(content),
        "url": f"/api/backend/assets/{asset_id}/content",
        "analysis": analysis.model_dump(),
    }
    
    # Upload to Cloudinary for permanent CDN storage
    cloudinary_url = None
    try:
        from app.core.cloudinary_service import upload_image_to_cloudinary
        c_res = upload_image_to_cloudinary(content, folder="aabhushan/assets", public_id=asset_id)
        if c_res:
            cloudinary_url = c_res.get("secure_url")
            asset_data["cloudinary_url"] = cloudinary_url
    except Exception:
        pass

    ASSETS_CACHE[asset_id] = {
        "data": asset_data,
        "bytes": content,
        "content_type": file.content_type,
    }

    return ApiResponse(data=asset_data)


def get_asset_bytes(asset_id: str) -> Optional[bytes]:
    """Retrieve asset bytes from memory cache or directly from persistent storage."""
    if asset_id in ASSETS_CACHE:
        return ASSETS_CACHE[asset_id]["bytes"]

    # Check on disk
    upload_dir = Path(settings.STORAGE_DIR) / "uploads"
    for file in upload_dir.glob(f"{asset_id}_*"):
        try:
            return file.read_bytes()
        except Exception:
            pass
    return None


@router.get("/{asset_id}", response_model=ApiResponse)
async def get_asset(asset_id: str):
    if asset_id not in ASSETS_CACHE:
        # Check on disk
        upload_dir = Path(settings.STORAGE_DIR) / "uploads"
        matching = list(upload_dir.glob(f"{asset_id}_*"))
        if not matching:
            raise HTTPException(status_code=404, detail="Asset not found")
        return ApiResponse(data={"id": asset_id, "url": f"/api/backend/assets/{asset_id}/content"})
    return ApiResponse(data=ASSETS_CACHE[asset_id]["data"])


@router.get("/{asset_id}/content")
async def get_asset_content(asset_id: str):
    from fastapi.responses import Response
    if asset_id not in ASSETS_CACHE:
        raise HTTPException(status_code=404, detail="Asset not found")
    item = ASSETS_CACHE[asset_id]
    return Response(content=item["bytes"], media_type=item["content_type"])

