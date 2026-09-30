from pydantic import BaseModel, Field
from typing import List


class Diagnosis(BaseModel):
    summary: str
    root_cause: str
    severity: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[str]
    recommendations: List[str]
    missing_information: List[str]