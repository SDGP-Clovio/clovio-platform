from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth_routes import router as auth_router
from app.core.auth import get_current_user
from app.models import user, project, skill, task, milestone, user_skill, chat, project_member  # import all models
from app.api import users, skills, user_skills, projects, tasks
from app.api.projects import router as projects_router   # Import the projects router to register it with the app
from app.api.milestones import router as milestones_router   # Import the milestones router to register it with the app
from app.api.fairness import router as fairness_router   # Import the fairness router to register it with the app
from app.api.progress import router as progress_router # Import the progress router to register it with the app
from app.api.chat import router as chat_router # Import the chat router to register it with the app

# Initialize the App 
app = FastAPI(
    title="Clovio AI Backend",
    version="0.1.0",
    description="AI-powered project planning and task breakdown API."
)
app.include_router(users.router, prefix="/api/users", tags=["Users"])

app.include_router(skills.router, prefix="/api/skills", tags=["Skills"])

app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])

app.include_router(user_skills.router, prefix="/api/user-skills", tags=["User Skills"])

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

# Register chat routes
app.include_router(chat_router)

# The Health Check 
@app.get("/")
def health_check():
    return {"status": "Active", "message": "Clovio Backend is running"}

