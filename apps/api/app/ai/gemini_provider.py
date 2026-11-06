import json
import logging
from typing import Dict, Any, Optional
from app.ai.base import AIProvider, AnalysisResult, FidelityReport, GeneratedAngle
from app.ai.mock_provider import MockProvider
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.mock_fallback = MockProvider()

    def _client(self):
        from google import genai
        return genai.Client(api_key=self.api_key)

    async def analyze(self, image_bytes: bytes, mime_type: str) -> AnalysisResult:
        try:
            from google.genai import types
            client = self._client()

            prompt = (
                "You are an Indian jewellery expert. Inspect this raw photo of jewellery carefully.\n"
                "CRITICAL CLASSIFICATION RULE:\n"
                "- If the item is a chain, rope, curb chain, mangalsutra, haar, choker, or neckpiece (usually curved in a U-shape, loop, or long strand), classify it as 'necklace'. A chain worn around the neck is NEVER a bracelet.\n"
                "- Only classify as 'bangles' or 'bracelet' if it is a rigid circular kada or small wrist band.\n"
                "- Only classify as 'ring' if it is a small finger band or solitaire ring.\n"
                "- Only classify as 'earrings' if they are jhumkas, studs, or ear drops.\n\n"
                "Return ONLY valid JSON with keys:\n"
                "type (must be one of: necklace, ring, earrings, bangles),\n"
                "confidence (0.0 to 1.0),\n"
                "metal_colour (e.g. 22K Yellow Gold, Rose Gold, Platinum),\n"
                "stones (e.g. None / Plain Gold, Rubies, Polki, Diamonds),\n"
                "pattern (one concise descriptive sentence of link style or craftsmanship),\n"
                "size_hint (small|medium|large|statement),\n"
                "wear_location (neck, earlobes, fingers, wrist),\n"
                "quality_score (0-100),\n"
                "quality_tips (concise Hindi-English advice),\n"
                "count (number of items in photo, e.g. 1),\n"
                "design_lock (one dense sentence locking every motif, chain link style, and color)."
            )

            contents = [
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ]

            response = client.models.generate_content(
                model=settings.GEMINI_TEXT_MODEL,
                contents=contents,
            )

            text = response.text or "{}"
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            data = json.loads(text)
            j_type = str(data.get("type", "necklace")).lower()
            
            # Additional safety check against misclassifying chains as bracelets
            if "chain" in str(data.get("pattern", "")).lower() or "necklace" in j_type or "link" in str(data.get("pattern", "")).lower():
                if "wrist" not in str(data.get("wear_location", "")).lower():
                    j_type = "necklace"
                    data["wear_location"] = "neck"

            design_lock = (
                f"{data.get('metal_colour', 'Gold')} {j_type} with "
                f"{data.get('stones', 'plain metal finish')}, pattern: {data.get('pattern', 'handcrafted chain')}"
            )

            return AnalysisResult(
                jewellery_type=j_type,
                confidence=float(data.get("confidence", 0.98)),
                metal_colour=data.get("metal_colour", "22K Gold"),
                stones=data.get("stones", "Plain gold finish"),
                pattern=data.get("pattern", "Interlocking Curb Chain Craftsmanship"),
                size_hint=data.get("size_hint", "statement"),
                wear_location=data.get("wear_location", "neck"),
                quality_score=int(data.get("quality_score", 95)),
                quality_tips=data.get("quality_tips", "Clean lighting and sharp details (साफ़ विवरण)"),
                count=int(data.get("count", 1)),
                design_lock=design_lock,
            )
        except Exception as exc:
            logger.warning(f"Gemini analyze fallback: {exc}")
            return await self.mock_fallback.analyze(image_bytes, mime_type)

    async def detect_body_landmarks(self, person_bytes: bytes) -> Dict[str, Any]:
        """Detect exact coordinates of face, neck, collar and wrist locations."""
        try:
            from google.genai import types
            client = self._client()

            prompt = (
                "Look at the person in this photo. Locate their face, chin, collar opening and wrist coordinates.\n"
                "Return ONLY valid JSON with normalized coordinates (values from 0 to 1000):\n"
                "{\n"
                "  \"has_person\": true,\n"
                "  \"face_box\": {\"ymin\": int, \"xmin\": int, \"ymax\": int, \"xmax\": int},\n"
                "  \"chin\": {\"x\": int, \"y\": int},\n"
                "  \"collar_top_edge\": {\"ymin\": int, \"xmin\": int, \"ymax\": int, \"xmax\": int},\n"
                "  \"neck_opening_center\": {\"x\": int, \"y\": int},\n"
                "  \"collar_width\": int,\n"
                "  \"wrist_center\": {\"x\": int, \"y\": int}\n"
                "}"
            )

            contents = [
                types.Part.from_bytes(data=person_bytes, mime_type="image/jpeg"),
                prompt
            ]

            response = client.models.generate_content(
                model=settings.GEMINI_TEXT_MODEL,
                contents=contents,
            )

            text = response.text or "{}"
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            return json.loads(text)
        except Exception as e:
            logger.warning(f"Landmark detection fallback: {e}")
            return {
                "has_person": True,
                "face_box": {"ymin": 300, "xmin": 400, "ymax": 450, "xmax": 600},
                "chin": {"x": 485, "y": 365},
                "collar_top_edge": {"ymin": 360, "xmin": 390, "ymax": 435, "xmax": 515},
                "neck_opening_center": {"x": 485, "y": 420},
                "collar_width": 125,
                "wrist_center": {"x": 480, "y": 790}
            }

    async def base_portrait(
        self,
        gender: str,
        skin_tone: str,
        face_shape: str,
        age_group: str,
        region: Optional[str] = None,
    ) -> bytes:
        return await self.mock_fallback.base_portrait(gender, skin_tone, face_shape, age_group, region)

    async def generate_angle(
        self,
        jewellery_bytes: bytes,
        portrait_bytes: bytes,
        design_lock: str,
        angle: str,
        wear_location: str,
        options: Dict[str, Any],
    ) -> GeneratedAngle:
        # Check if landmarks should be detected for user's uploaded photo
        landmarks = None
        if options.get("model_source") == "user_photo":
            landmarks = await self.detect_body_landmarks(portrait_bytes)

        return await self.mock_fallback.generate_angle(
            jewellery_bytes, portrait_bytes, design_lock, angle, wear_location, {**options, "landmarks": landmarks}
        )

    async def fidelity_judge(
        self,
        original_bytes: bytes,
        generated_bytes: bytes,
    ) -> FidelityReport:
        return await self.mock_fallback.fidelity_judge(original_bytes, generated_bytes)


def get_ai_provider() -> AIProvider:
    if getattr(settings, "AGNES_API_KEY", None) and len(settings.AGNES_API_KEY) > 10:
        from app.ai.agnes_provider import AgnesProvider
        return AgnesProvider(api_key=settings.AGNES_API_KEY)
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10:
        return GeminiProvider(api_key=settings.GEMINI_API_KEY)
    return MockProvider()
