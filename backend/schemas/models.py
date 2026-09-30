from typing import Any, Optional

from pydantic import BaseModel, Field


class CopilotRequest(BaseModel):
    command: str = Field(
        ...,
        min_length=1,
        description="User's DevOps question or command"
    )

    scenario: Optional[str] = Field(
        default=None,
        description="Optional incident scenario such as crashloop, imagepull, or highcpu"
    )


class CopilotResponse(BaseModel):
    answer: str
    scenario: Optional[str] = None
    context: Optional[dict[str, Any]] = None


class DevOpsResponse(BaseModel):
    success: bool
    data: Any


class HealthResponse(BaseModel):
    status: str
    service: str