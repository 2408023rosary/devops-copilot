from fastapi import APIRouter

from backend.services.devops_service import DevOpsService


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"],
)

devops_service = DevOpsService()


@router.get("/crashloop")
async def crashloop_incident():
    return await devops_service.get_crashloop_scenario()


@router.get("/imagepull")
async def imagepull_incident():
    return await devops_service.get_imagepull_scenario()


@router.get("/highcpu")
async def highcpu_incident():
    return await devops_service.get_highcpu_scenario()