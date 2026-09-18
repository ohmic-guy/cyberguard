from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB:  str = "cyberguard"
    REDIS_URL:   str = "redis://localhost:6379"
    JWT_SECRET:  str = "change-this-in-production"
    ADMIN_USER:  str = "admin"
    ADMIN_PASS:  str = "cyberguard2024"
    LLM_PROVIDER: str = "groq"
    OPENAI_API_KEY:    str = ""
    GROQ_API_KEY:      str = ""
    ANTHROPIC_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
