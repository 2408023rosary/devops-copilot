from typing import Any

from fastapi import APIRouter

from backend.schemas.models import CopilotAnalyzeRequest
from backend.services.ai_service import analyze_incident
from backend.services.devops_service import DevOpsService


router = APIRouter(
    prefix="/api/copilot",
    tags=["Copilot"]
)

devops_service = DevOpsService()


@router.post("/analyze")
async def analyze(request: CopilotAnalyzeRequest):

    # ---------------------------------------------
    # Get information from Member 2's DevOps API
    # ---------------------------------------------

    status = await devops_service.get_status()
    logs = await devops_service.get_logs()
    events = await devops_service.get_events()
    metrics = await devops_service.get_metrics()

    # ---------------------------------------------
    # Optional scenario information
    # ---------------------------------------------

    if request.scenario:
        scenario_data = await devops_service.get_scenario(
            request.scenario
        )

        # Add scenario information to events/context
        events = {
            "events": events,
            "scenario": scenario_data
        }

    # ---------------------------------------------
    # Call Member 1's AI/Copilot module
    # ---------------------------------------------

    diagnosis = analyze_incident(
        message=request.message,
        service=request.service,
        logs=logs,
        status=status,
        events=events,
        metrics=metrics
    )

    # ---------------------------------------------
    # Return Diagnosis to frontend
    # ---------------------------------------------

    return diagnosis