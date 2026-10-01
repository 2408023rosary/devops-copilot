from typing import Any

from ai.agent import DevOpsCopilot
from ai.schemas import Diagnosis


copilot = DevOpsCopilot()


def analyze_incident(
    message: str,
    service: str,
    logs: Any = None,
    status: Any = None,
    events: Any = None,
    metrics: Any = None,
) -> Diagnosis:
    """
    Adapter between the FastAPI backend and the AI/Copilot module.

    DevOps data may be returned as structured JSON, so the adapter
    accepts the data in its original form and passes it to the AI layer.
    """

    return copilot.analyze(
        message=message,
        service=service,
        logs=logs,
        status=status,
        events=events,
        metrics=metrics,
    )