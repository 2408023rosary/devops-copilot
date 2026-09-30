from fastapi import APIRouter

from backend.schemas.models import CopilotAnalyzeRequest, CopilotResponse
from backend.services.ai_service import analyze_incident
from backend.services.devops_service import DevOpsService


router = APIRouter(
    prefix="/api/copilot",
    tags=["Copilot"],
)

devops_service = DevOpsService()


@router.post("/analyze", response_model=CopilotResponse)
async def analyze(request: CopilotAnalyzeRequest):
    """
    Collect DevOps information and send it to the AI diagnosis service.
    """

    status = await devops_service.get_status()
    logs = await devops_service.get_logs()
    events = await devops_service.get_events()
    metrics = await devops_service.get_metrics()

    # Add optional scenario information to the event/context data.
    if request.scenario:
        scenario_data = await devops_service.get_scenario(request.scenario)

        events = {
            "events": events,
            "scenario": scenario_data,
        }

    diagnosis = analyze_incident(
        message=request.message,
        service=request.service,
        logs=logs,
        status=status,
        events=events,
        metrics=metrics,
    )

    return diagnosis