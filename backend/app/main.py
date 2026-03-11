from fastapi import FastAPI, HTTPException
from app.schemas.project import ProjectPlan, ProjectRequest
from app.api.auth_routes import router as auth_router
from app.core.auth import get_current_user
from app.api.projects import router as projects_router   # Import the projects router to register it with the app

# Initialize the App 
app = FastAPI(
    title="Clovio AI Backend",
    version="0.1.0",
    description="AI-powered project planning and task breakdown API."
)

# Register authentication routes
app.include_router(auth_router)

# Register projects routes
app.include_router(projects_router)

# The Health Check 
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Clovio Backend is running"}

