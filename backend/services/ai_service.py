from ai.agent import DevOpsCopilot
from ai.schemas import Diagnosis


copilot = DevOpsCopilot()


def analyze_incident(
    message: str,
    service: str,
    logs: list[str] | None = None,
    status: str | None = None,
    events: list[str] | None = None,
    metrics: dict | None = None,
) -> Diagnosis:

    return copilot.analyze(
        message=message,
        service=service,
        logs=logs,
        status=status,
        events=events,
        metrics=metrics,
    )