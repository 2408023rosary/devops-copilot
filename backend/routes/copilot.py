from fastapi import APIRouter

from backend.schemas.models import CopilotRequest, CopilotResponse
from backend.services.ai_service import AIService
from backend.services.devops_service import DevOpsService


router = APIRouter(
    prefix="/api/copilot",
    tags=["Copilot"]
)

devops_service = DevOpsService()
ai_service = AIService()


@router.post("", response_model=CopilotResponse)
async def ask_copilot(request: CopilotRequest):

    context = {}

    # If the user selected an incident scenario,
    # collect information from the DevOps simulator.
    if request.scenario:
        scenario_data = await devops_service.get_scenario(
            request.scenario
        )

        context["scenario"] = scenario_data

    # Collect general system information.
    context["status"] = await devops_service.get_status()

    # Send the user's question and DevOps context to the AI service.
    answer = await ai_service.generate_response(
        command=request.command,
        context=context
    )

    return CopilotResponse(
        answer=answer,
        scenario=request.scenario,
        context=context
    )