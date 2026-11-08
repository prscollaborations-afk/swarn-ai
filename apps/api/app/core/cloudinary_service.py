import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

CLOUDINARY_AVAILABLE = False
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    pass

def init_cloudinary():
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME") or "azbkujpd"
    api_key = os.getenv("CLOUDINARY_API_KEY") or "595923171546264"
    api_secret = os.getenv("CLOUDINARY_API_SECRET") or "2wl3pmc1ZMEbj2pa6NF-mNxa8kE"

    if CLOUDINARY_AVAILABLE and cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        return True
    return False

def upload_image_to_cloudinary(file_bytes: bytes, folder: str = "aabhushan", public_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not init_cloudinary():
        return None
    try:
        options = {
            "folder": folder,
            "resource_type": "image",
            "overwrite": True
        }
        if public_id:
            options["public_id"] = public_id
        result = cloudinary.uploader.upload(file_bytes, **options)
        return {
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "format": result.get("format"),
            "width": result.get("width"),
            "height": result.get("height")
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        return None
