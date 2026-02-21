import logging
from fastapi import FastAPI, HTTPException
from app.schemas.project import ProjectPlan, ProjectRequest
from app.services.ai_service import generate_task_breakdown
from app.core.config import settings

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the App
app = FastAPI(
    title="Clovio AI Backend",
    version="0.1.0"
)

@app.on_event("startup")
async def startup_event():
    """Log when the app starts and show which AI model is active."""
    logger.info("🚀 Clovio Backend starting up...")
    logger.info(f"🤖 Using AI model: {settings.AI_MODEL}")
    # You can add more startup checks here later (e.g., database connection)

# Health Check
@app.get("/")
def health_check():
    logger.debug("Health check called")  # optional debug log
    return {"status": "Active", "message": "Clovio Backend is running"}

# The Main Door (Project Generation)
@app.post("/api/v1/generate-plan", response_model=ProjectPlan)
def generate_plan(request: ProjectRequest):
    """
    Receives a project description, validates it, and returns a task breakdown.
    """
    try:
        plan = generate_task_breakdown(request.description, request.team_members)
        
        if plan.overall_risk_warning == "INVALID_INPUT":
            raise HTTPException(status_code=400, detail="Please describe a valid project (e.g., 'Plan a wedding' or 'Build an app').")
        
        return plan
        
    except Exception as e:
        logger.error(f"Error in generate_plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))