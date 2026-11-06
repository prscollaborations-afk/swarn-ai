from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class AnalysisResult(BaseModel):
    jewellery_type: str
    confidence: float
    metal_colour: str
    stones: str
    pattern: str
    size_hint: str
    wear_location: str
    quality_score: int
    quality_tips: str
    count: int = 1
    design_lock: str


class FidelityReport(BaseModel):
    stones: int
    pattern: int
    shape: int
    colour: int
    placement: int
    overall: int
    issues: List[str]


class GeneratedAngle(BaseModel):
    angle: str
    image_bytes: bytes
    mime_type: str = "image/png"
    fidelity_score: int
    fidelity_report: Dict[str, Any]
    prompt_version: str = "v1"
    latency_ms: int = 0
    provider: str = "mock"


class AIProvider(ABC):
    @abstractmethod
    async def analyze(self, image_bytes: bytes, mime_type: str) -> AnalysisResult:
        """Analyze raw jewellery photo using Gemini vision or mock analyzer."""
        pass

    @abstractmethod
    async def base_portrait(
        self,
        gender: str,
        skin_tone: str,
        face_shape: str,
        age_group: str,
        region: Optional[str] = None,
    ) -> bytes:
        """Generate or retrieve clean reference portrait without jewellery."""
        pass

    @abstractmethod
    async def generate_angle(
        self,
        jewellery_bytes: bytes,
        portrait_bytes: bytes,
        design_lock: str,
        angle: str,
        wear_location: str,
        options: Dict[str, Any],
    ) -> GeneratedAngle:
        """Generate high-fidelity catalogue photograph of model wearing exact piece."""
        pass

    @abstractmethod
    async def fidelity_judge(
        self,
        original_bytes: bytes,
        generated_bytes: bytes,
    ) -> FidelityReport:
        """Strictly judge if stones, motif, and metal match exactly."""
        pass

