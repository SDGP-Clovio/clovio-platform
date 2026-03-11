import os
from dotenv import load_dotenv

# This looks for the .env file in the root folder loads it
load_dotenv()

class Settings:

    # JWT authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # We grab the key from the computer's environment
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    
    # We define the AI model here so we can change it if needed
    AI_MODEL: str = "llama-3.3-70b-versatile"

    # Added MAX_TOKENS here so it can be used in ai_service.py.
    MAX_TOKENS: int = 4096

    # Added AI_TEMPERATURE here which defines how "creative" the AI's responses will be. 
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", 0.3)) # lower = more deterministic output, higher = more creative

    # CORS settings
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    def __init__(self):
        if not self.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        print("[Config] GROQ_API_KEY loaded:", bool(self.GROQ_API_KEY))

# We create one 'settings' object to use in all other files
settings = Settings()