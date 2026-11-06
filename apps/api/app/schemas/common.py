from pydantic import BaseModel
from typing import Any, Optional, Dict, List


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: List[ErrorDetail] = []


class ErrorResponse(BaseModel):
    error: ErrorBody


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    meta: Optional[Dict[str, Any]] = None

