import os
import uuid
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Depends
from fastapi.responses import Response

from app.schemas.common import ApiResponse
from app.api.assets import ASSETS_CACHE
from app.ai.gemini_provider import get_ai_provider
from app.core.rate_limit import check_rate_limit

router = APIRouter(prefix="/jobs", tags=["jobs"])

JOBS_DB: Dict[str, Dict[str, Any]] = {}
IMAGES_CACHE: Dict[str, bytes] = {}


class JobCreateRequest(BaseModel):
    asset_id: str
    target_angles: List[str] = Field(default=["front", "left", "right", "closeup"])
    model_source: str = "ai_model"  # 'ai_model' or 'user_photo'
    user_person_asset_id: Optional[str] = None
    jewellery_type: Optional[str] = "necklace"
    gender: str = "female"
    skin_tone: str = "tone_4"
    face_shape: str = "oval"
    age_group: str = "late_20s"
    region: Optional[str] = "north_indian"
    outfit: Optional[str] = "banarasi_saree"
    occasion: Optional[str] = "grand_wedding"
    resolution: str = "HD"


async def process_job_pipeline(job_id: str):
    job = JOBS_DB[job_id]
    ai = get_ai_provider()

    try:
        job["status"] = "generating"
        from app.api.assets import get_asset_bytes
        jewellery_bytes = get_asset_bytes(job["asset_id"])
        if not jewellery_bytes:
            job["status"] = "failed"
            job["error"] = "Jewellery photo not found"
            return

        jewellery_asset = ASSETS_CACHE.get(job["asset_id"], {})
        analysis = jewellery_asset.get("data", {}).get("analysis", {})
        j_type = job.get("jewellery_type") or analysis.get("jewellery_type", "necklace")
        design_lock = analysis.get("design_lock", f"Indian {j_type}")
        wear_location = analysis.get("wear_location", "neck")

        # 1. Base Portrait: Either User's Uploaded Photo or Selected AI Model
        portrait_bytes = None
        if job.get("model_source") == "user_photo" and job.get("user_person_asset_id"):
            portrait_bytes = get_asset_bytes(job["user_person_asset_id"])

        if not portrait_bytes:
            portrait_bytes = await ai.base_portrait(
                gender=job["gender"],
                skin_tone=job["skin_tone"],
                face_shape=job["face_shape"],
                age_group=job["age_group"],
                region=job.get("region"),
            )

        # 2. Angle Generations with User's Exact Jewellery Placed On Target
        results = []
        for angle in job["target_angles"]:
            gen = await ai.generate_angle(
                jewellery_bytes=jewellery_bytes,
                portrait_bytes=portrait_bytes,
                design_lock=design_lock,
                angle=angle,
                wear_location=wear_location,
                options={**job, "jewellery_type": j_type},
            )
            img_id = str(uuid.uuid4())
            IMAGES_CACHE[img_id] = gen.image_bytes

            results.append({
                "id": img_id,
                "angle": angle,
                "url": f"/api/backend/jobs/images/{img_id}/content",
                "fidelity_score": gen.fidelity_score,
                "fidelity_report": gen.fidelity_report,
                "resolution": job["resolution"],
                "provider": gen.provider,
                "latency_ms": gen.latency_ms,
            })

        job["images"] = results
        job["status"] = "completed"
    except Exception as exc:
        job["status"] = "failed"
        job["error"] = str(exc)


@router.post("", response_model=ApiResponse, dependencies=[Depends(check_rate_limit)])
async def create_job(payload: JobCreateRequest, background_tasks: BackgroundTasks):
    if payload.asset_id not in ASSETS_CACHE:
        raise HTTPException(status_code=404, detail="Jewellery asset not found")

    job_id = str(uuid.uuid4())
    job_record = {
        "id": job_id,
        "status": "pending",
        "asset_id": payload.asset_id,
        "model_source": payload.model_source,
        "user_person_asset_id": payload.user_person_asset_id,
        "jewellery_type": payload.jewellery_type,
        "target_angles": payload.target_angles,
        "gender": payload.gender,
        "skin_tone": payload.skin_tone,
        "face_shape": payload.face_shape,
        "age_group": payload.age_group,
        "region": payload.region,
        "outfit": payload.outfit,
        "occasion": payload.occasion,
        "resolution": payload.resolution,
        "credits_cost": len(payload.target_angles) * (2 if payload.resolution == "4K" else 1),
        "images": [],
        "error": None,
    }
    JOBS_DB[job_id] = job_record

    background_tasks.add_task(process_job_pipeline, job_id)
    return ApiResponse(data={"job_id": job_id, "status": "pending"})


@router.get("/{job_id}", response_model=ApiResponse)
async def get_job(job_id: str):
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job not found")
    return ApiResponse(data=JOBS_DB[job_id])


@router.get("/images/{image_id}/content")
async def get_job_image(image_id: str):
    if image_id not in IMAGES_CACHE:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=IMAGES_CACHE[image_id], media_type="image/png")
