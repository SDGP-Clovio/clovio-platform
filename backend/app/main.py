from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth_routes import router as auth_router
from app.api.projects import router as projects_router   # Import the projects router to register it with the app
from app.api.milestones import router as milestones_router   # Import the milestones router to register it with the app
from app.api.fairness import router as fairness_router   # Import the fairness router to register it with the app
from app.api.progress import router as progress_router # Import the progress router to register it with the app

# Initialize the App 
app = FastAPI(
    title="Clovio AI Backend",
    version="0.1.0",
    description="AI-powered project planning and task breakdown API."
)

# CORS – allow the React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register authentication routes
app.include_router(auth_router)

# Register projects routes
app.include_router(projects_router)

# Register milestones routes
app.include_router(milestones_router)

#  Register fairness routes
app.include_router(fairness_router)

# Register progress routes
app.include_router(progress_router)

# The Health Check 
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Clovio Backend is running"}

