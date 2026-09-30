from typing import Any


def build_incident_context(
    message: str,
    service: str,
    logs: list[str] | None = None,
    status: str | None = None,
    events: list[str] | None = None,
    metrics: dict[str, Any] | None = None,
) -> dict[str, Any]:

    return {
        "user_request": message,
        "service": service,
        "status": status,
        "logs": logs or [],
        "events": events or [],
        "metrics": metrics or {},
    }