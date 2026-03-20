from fastapi import FastAPI, HTTPException
from app.schemas.project import ProjectPlan, ProjectRequest
from app.services.ai_service import generate_task_breakdown
from app.api.supervisor import router as supervisor_router

# Initialize the App 
app = FastAPI(
    title="Clovio AI Backend",
    version="0.1.0",
    description="AI-powered project planning and task breakdown API."
)

app.include_router(supervisor_router)

# 2. The Health Check (Just to see if lights are on)
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Clovio Backend is running"}

# 3. The Main Door (Project Generation)
@app.post("/api/v1/generate-plan", response_model=ProjectPlan)
def generate_plan(request: ProjectRequest):
    """
    Receives a project description, validates it, and returns a task breakdown.
    """
    try:
        # Pass the Validated Data (request.description) to the AI Service
        plan = generate_task_breakdown(request.description, request.team_members)
        
        # Check if the AI refused the request (e.g., nonsense input)
        if plan.overall_risk_warning == "INVALID_INPUT":
             raise HTTPException(status_code=400, detail="Please describe a valid project (e.g., 'Plan a wedding' or 'Build an app').")
             
        return plan
        
    except Exception as e:
        # If anything explodes, tell us why
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))