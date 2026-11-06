from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Aabhushan AI"
    API_URL: str = "http://localhost:8000"
    WEB_URL: str = "http://localhost:3000"

    DATABASE_URL: str = "sqlite+aiosqlite:///./aabhushan.db"
    SYNC_DATABASE_URL: str = "sqlite:///./aabhushan.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    STORAGE_PROVIDER: str = "local"
    STORAGE_DIR: str = "/Users/macbook/swarn-ai/apps/api/storage_data"
    S3_ENDPOINT: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_BUCKET: str = "aabhushan-assets"
    S3_REGION: str = "us-east-1"

    JWT_SECRET: str = "super_secret_jwt_key_for_aabhushan_dev_minimum_32_characters"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    GEMINI_API_KEY: Optional[str] = None
    AGNES_API_KEY: Optional[str] = None
    GEMINI_IMAGE_MODEL: str = "gemini-3.1-flash-image-preview"
    GEMINI_PREVIEW_MODEL: str = "gemini-2.5-flash-image"
    GEMINI_TEXT_MODEL: str = "gemini-3.5-flash-lite"
    GEMINI_MAX_CONCURRENCY: int = 6
    FIDELITY_PASS_SCORE: int = 80
    AI_PROVIDER: str = "auto"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
