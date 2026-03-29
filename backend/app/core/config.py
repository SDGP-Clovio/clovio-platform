import os
from dotenv import load_dotenv

# This looks for the .env file in the root folder loads it
load_dotenv()

# Replace this plain class with Pydantic's BaseSettings. It auto-reads from
# environment variables, supports .env files natively, provides type validation,
# and works seamlessly with FastAPI's dependency injection.
# from pydantic_settings import BaseSettings
# class Settings(BaseSettings):
#     GROQ_API_KEY: str
#     AI_MODEL: str = "llama-3.3-70b-versatile"
#     MAX_TOKENS: int = 4096
#     AI_TEMPERATURE: float = 0.3   # Lower = more deterministic JSON output
#     ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
#     ENVIRONMENT: str = "development"  # "development" | "staging" | "production"
#
#     class Config:
#         env_file = ".env"

# ── Supported AI providers and their default models ──────────────────────────
# To switch providers, change AI_PROVIDER in your .env file to "groq" or "deepseek".
# You only need the API key for the provider you're actually using.

PROVIDER_DEFAULTS = {
    "groq": {
        "model": "llama-3.3-70b-versatile",   # Fast inference via Groq Cloud
        "max_tokens": 4096,
        "temperature": 0.3,
        "base_url": None,                       # Groq SDK uses its own default
    },
    "deepseek": {
        "model": "deepseek-chat",               # DeepSeek-V3 (their flagship model)
        "max_tokens": 4096,
        "temperature": 0.3,
        "base_url": "https://api.deepseek.com", # DeepSeek uses an OpenAI-compatible API
    },
}


class Settings:
    # ── Provider selection ────────────────────────────────────────────────────
    # Change this in .env   →   AI_PROVIDER="deepseek"   to switch providers.
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq").lower()

    # ── API keys ──────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")

    # ── Model settings (auto-filled from PROVIDER_DEFAULTS) ───────────────────
    AI_MODEL: str = ""
    MAX_TOKENS: int = 4096
    AI_TEMPERATURE: float = 0.3
    BASE_URL: str = None  # Only used by DeepSeek (OpenAI-compatible endpoint)

    def __init__(self):
        # Validate provider name
        if self.AI_PROVIDER not in PROVIDER_DEFAULTS:
            raise ValueError(
                f"AI_PROVIDER '{self.AI_PROVIDER}' is not supported. "
                f"Choose one of: {', '.join(PROVIDER_DEFAULTS.keys())}"
            )

        # Load defaults for the chosen provider
        defaults = PROVIDER_DEFAULTS[self.AI_PROVIDER]
        self.AI_MODEL = os.getenv("AI_MODEL", defaults["model"])
        self.MAX_TOKENS = int(os.getenv("MAX_TOKENS", defaults["max_tokens"]))
        self.AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", defaults["temperature"]))
        self.BASE_URL = defaults["base_url"]

        # Validate that the required API key is present
        if self.AI_PROVIDER == "groq":
            if not self.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY environment variable is not set (required when AI_PROVIDER=groq)")
            print(f"[Config] Provider: GROQ  |  Model: {self.AI_MODEL}")

        elif self.AI_PROVIDER == "deepseek":
            if not self.DEEPSEEK_API_KEY:
                raise ValueError("DEEPSEEK_API_KEY environment variable is not set (required when AI_PROVIDER=deepseek)")
            print(f"[Config] Provider: DEEPSEEK  |  Model: {self.AI_MODEL}")


# We create one 'settings' object to use in all other files
settings = Settings()