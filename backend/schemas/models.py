from typing import Any

from pydantic import BaseModel, Field


class CopilotAnalyzeRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        description="User's DevOps question or incident description",
    )
    service: str = Field(
        ...,
        min_length=1,
        description="Affected service or application",
    )
    scenario: str | None = Field(
        default=None,
        description="Optional incident scenario such as crashloop, imagepull, or highcpu",
    )


class CopilotResponse(BaseModel):
    summary: str
    root_cause: str
    severity: str
    confidence: float
    evidence: list[str]
    recommendations: list[str]
    missing_information: list[str]


class DevOpsResponse(BaseModel):
    success: bool
    data: Any


class HealthResponse(BaseModel):
    status: str