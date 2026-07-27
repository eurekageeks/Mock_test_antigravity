import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "A1tiExam Mock Test Platform"
    
    # Database
    _raw_db_url: str = os.getenv("DATABASE_URL", "sqlite:///./a1tiexam.db")
    if _raw_db_url.startswith("sqlite:////app/") and not os.path.exists("/app"):
        DATABASE_URL: str = "sqlite:///./a1tiexam.db"
    else:
        DATABASE_URL: str = _raw_db_url
    
    # JWT Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "a1ti_exam_platform_secret_key_2026_super_secure_key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    
    # Admin Credentials
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@a1tiexam.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "AdminSecure2026!")

settings = Settings()
