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

    When a scenario is provided, use that scenario's own logs, events,
    metrics, and service status so the AI diagnoses the requested incident
    instead of the simulator's generic default scenario.
    """

    if request.scenario:
        scenario_data = await devops_service.get_scenario(request.scenario)

        # If the requested scenario is invalid, return the error information
        # through the normal AI context rather than silently using generic data.
        if "error" in scenario_data:
            status = None
            logs = []
            events = scenario_data
            metrics = {}
        else:
            service_data = scenario_data.get("service", {})

            status = {
                "service": service_data.get("name"),
                "namespace": service_data.get("namespace"),
                "pod": service_data.get("pod"),
                "status": service_data.get("status"),
                "restarts": service_data.get("restarts"),
                "age": service_data.get("age"),
                "scenario": scenario_data.get("scenario"),
            }

            logs = scenario_data.get("logs", [])
            events = scenario_data.get("events", [])
            metrics = scenario_data.get("metrics", {})

            # Include the simulator's probable cause and recommended actions
            # as additional evidence/context for the AI.
            events = {
                "scenario": scenario_data.get("scenario"),
                "events": events,
                "probableCause": scenario_data.get("probableCause"),
                "recommendedActions": scenario_data.get("recommendedActions", []),
            }

    else:
        # Preserve the normal generic DevOps data flow when no scenario
        # is explicitly requested.
        status = await devops_service.get_status()
        logs = await devops_service.get_logs()
        events = await devops_service.get_events()
        metrics = await devops_service.get_metrics()

    diagnosis = analyze_incident(
        message=request.message,
        service=request.service,
        logs=logs,
        status=status,
        events=events,
        metrics=metrics,
    )

    return diagnosis
