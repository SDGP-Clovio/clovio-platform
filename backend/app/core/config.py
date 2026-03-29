import os
from dotenv import load_dotenv

# This looks for the .env file in the root folder loads it
load_dotenv()


def _parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    if not raw.strip():
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]

    return [origin.strip() for origin in raw.split(",") if origin.strip()]

class Settings:

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clovio.db")

    # JWT authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # LLM providers 
    # DeepSeek (primary provider – OpenAI-compatible API)
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_MODEL: str = os.getenv("DEEPSEEK_MODEL", "deepseek-reasoner") # DeepSeek model name (e.g., "deepseek-reasoner")

    # Groq (fallback provider)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AI_MODEL: str = "llama-3.3-70b-versatile"  # Groq model

    # Shared generation settings
    MAX_TOKENS: int = 4096
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", 0.3)) # A lower temperature means more focused and deterministic output.

    # CORS settings
    ALLOWED_ORIGINS: list[str] = _parse_allowed_origins()

    def __init__(self):
        if not self.DEEPSEEK_API_KEY and not self.GROQ_API_KEY:
            raise ValueError(
                "At least one of DEEPSEEK_API_KEY or GROQ_API_KEY must be set"
            )
        if self.DEEPSEEK_API_KEY:
            print("[Config] DEEPSEEK_API_KEY loaded: True (primary provider)")
        else:
            print("[Config] DEEPSEEK_API_KEY not set – Groq is the sole provider")
        if self.GROQ_API_KEY:
            print("[Config] GROQ_API_KEY loaded: True (fallback provider)")

# We create one 'settings' object to use in all other files
settings = Settings()