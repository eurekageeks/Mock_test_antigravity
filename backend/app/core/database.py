from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# If using SQLite, we need to allow access across multiple threads
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.DATABASE_URL, connect_args=connect_args
    )
except Exception as e:
    # Fail-safe: if database connection fails, fall back to a local sqlite instance for development
    print(f"Warning: Failed to connect using '{settings.DATABASE_URL}'. Falling back to local SQLite: {e}")
    sqlite_fallback_url = "sqlite:///./a1tiexam_fallback.db"
    engine = create_engine(
        sqlite_fallback_url, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy.engine import Engine
from sqlalchemy import event

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
