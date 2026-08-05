from pydantic_settings import BaseSettings
from os import getenv

class Settings(BaseSettings):
    # Настройки приложения
    APP_NAME: str = "Clinic System"
    VERSION: str = "0.1.0"
    
    # База данных
    DATABASE_URL: str = "postgresql+asyncpg://clinic_user:clinic_pass@db:5432/clinic_db"
    POSTGRES_USER: str = "clinic_user"
    POSTGRES_PASSWORD: str = "clinic_pass"
    POSTGRES_DB: str = "clinic_db"
    
    # JWT
    SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # RabbitMQ
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASS: str = "guest"
    
    # Celery
    CELERY_BROKER_URL: str = "amqp://guest:guest@rabbitmq:5672//"
    CELERY_RESULT_BACKEND: str = "redis://keydb:6379/0"
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }

settings = Settings()