# Check (this is just an adapter)

from typing import Any


class AIService:

    async def generate_response(
        self,
        command: str,
        context: dict[str, Any] | None = None
    ) -> str:
        """
        Adapter between FastAPI backend and Member 1's AI service.

        Member 1 can replace the implementation inside this method
        with the actual LLM integration.
        """

        if context:
            return (
                f"DevOps analysis requested for: '{command}'. "
                f"Relevant DevOps context has been collected. "
                f"AI integration is ready to process this information."
            )

        return (
            f"DevOps Copilot received: '{command}'. "
            f"AI service integration is ready."
        )