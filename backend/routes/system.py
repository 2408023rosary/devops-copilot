from fastapi import APIRouter

from backend.services.devops_service import DevOpsService


router = APIRouter(
    prefix="/api/system",
    tags=["System"]
)

devops_service = DevOpsService()


@router.get("/status")
async def get_status():
    return await devops_service.get_status()


@router.get("/logs")
async def get_logs():
    return await devops_service.get_logs()


@router.get("/events")
async def get_events():
    return await devops_service.get_events()


@router.get("/metrics")
async def get_metrics():
    return await devops_service.get_metrics()