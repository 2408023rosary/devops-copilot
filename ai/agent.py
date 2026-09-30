import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from .analyzer import build_incident_context
from .prompts import SYSTEM_PROMPT
from .schemas import Diagnosis


load_dotenv()


class DevOpsCopilot:

    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")

        if not api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured.")

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )

        self.model = "openrouter/free"

    def analyze(
        self,
        message: str,
        service: str,
        logs: list[str] | None = None,
        status: str | None = None,
        events: list[str] | None = None,
        metrics: dict | None = None,
    ) -> Diagnosis:

        context = build_incident_context(
            message=message,
            service=service,
            logs=logs,
            status=status,
            events=events,
            metrics=metrics,
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": json.dumps(context, indent=2),
                },
            ],
            temperature=0.2,
        )

        content = response.choices[0].message.content

        if not content:
            raise ValueError("The AI returned an empty response.")

        # Some models wrap JSON in Markdown code fences.
        # Remove them before parsing.
        cleaned_content = content.strip()

        if cleaned_content.startswith("```"):
            cleaned_content = cleaned_content.removeprefix("```json")
            cleaned_content = cleaned_content.removeprefix("```")
            cleaned_content = cleaned_content.removesuffix("```")
            cleaned_content = cleaned_content.strip()

        try:
            result = json.loads(cleaned_content)

        except json.JSONDecodeError as exc:
            raise ValueError(
                f"The AI returned invalid JSON: {content}"
            ) from exc

        return Diagnosis.model_validate(result)