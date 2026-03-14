from fastapi import FastAPI, HTTPException
from app.schemas.project import ProjectPlan, ProjectRequest
from app.api.auth_routes import router as auth_router
from app.core.auth import get_current_user
from app.models import user, project, skill, task, milestone, user_skill  # import all models
from app.api import users

# Initialize the App 
app = FastAPI(
    title="Clovio AI Backend",
    version="0.1.0",
    description="AI-powered project planning and task breakdown API."
)
app.include_router(users.router, prefix="/api/users", tags=["Users"])


# Register authentication routes
app.include_router(auth_router)

# 2. The Health Check (Just to see if lights are on)
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Clovio Backend is running"}


