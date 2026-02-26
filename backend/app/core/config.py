import os
from dotenv import load_dotenv

# This looks for the .env file in the root folder loads it
load_dotenv()

class Settings:
    # We grab the key from the computer's environment
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    
    # We define the AI model here so we can change it if needed
    AI_MODEL: str = "llama-3.3-70b-versatile"

    def __init__(self):
        if not self.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        print("[Config] GROQ_API_KEY loaded:", bool(self.GROQ_API_KEY))

# We create one 'settings' object to use in all other files
settings = Settings()