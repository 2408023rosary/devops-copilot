import httpx


DEVOPS_BASE_URL = "http://localhost:5001/api/devops"
TIMEOUT = 10.0


class DevOpsService:
    async def _get(self, endpoint: str):
        url = f"{DEVOPS_BASE_URL}{endpoint}"

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()

        except httpx.ConnectError:
            return {
                "error": "DevOps simulator is not running",
                "url": url,
            }

        except httpx.HTTPStatusError as exc:
            return {
                "error": "DevOps simulator returned an error",
                "status_code": exc.response.status_code,
                "url": url,
            }

        except httpx.RequestError as exc:
            return {
                "error": "Could not connect to DevOps simulator",
                "details": str(exc),
            }

    async def get_status(self):
        return await self._get("/status")

    async def get_logs(self):
        return await self._get("/logs")

    async def get_events(self):
        return await self._get("/events")

    async def get_metrics(self):
        return await self._get("/metrics")

    async def get_crashloop_scenario(self):
        return await self._get("/scenario/crashloop")

    async def get_imagepull_scenario(self):
        return await self._get("/scenario/imagepull")

    async def get_highcpu_scenario(self):
        return await self._get("/scenario/highcpu")

    async def get_scenario(self, scenario: str):
        scenarios = {
            "crashloop": self.get_crashloop_scenario,
            "imagepull": self.get_imagepull_scenario,
            "highcpu": self.get_highcpu_scenario,
        }

        scenario = scenario.lower().strip()

        if scenario not in scenarios:
            return {
                "error": "Unknown scenario",
                "available_scenarios": list(scenarios.keys()),
            }

        return await scenarios[scenario]()