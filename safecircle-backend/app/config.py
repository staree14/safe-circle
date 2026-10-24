import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory for the backend project
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./safecircle.db"

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str | None = None
    TELEGRAM_CHAT_ID: str | None = None

    # Google Gemini AI Triage
    GEMINI_API_KEY: str | None = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")

    # App Environment
    APP_ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure uploads directory exists on configuration load
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
