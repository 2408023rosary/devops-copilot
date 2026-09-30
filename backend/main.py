from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import copilot
from backend.routes import incidents
from backend.routes import system


app = FastAPI(
    title="DevOps Copilot API",
    description="Backend API for the DevOps Copilot",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Routes
# --------------------------------------------------

app.include_router(copilot.router)
app.include_router(incidents.router)
app.include_router(system.router)


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "devops-copilot-backend"
    }