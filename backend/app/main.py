from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.endpoints import auth, student, admin
from app.seed import seed_data

# Initialize the database tables on startup
Base.metadata.create_all(bind=engine)

# Run seeding
db = SessionLocal()
try:
    seed_data(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-Stack AI-Powered Mock Test Platform (A1tiExam) Backend API Service",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the actual domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(student.router, prefix="/api/student", tags=["Student Panel"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Panel"])

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "docs_url": "/docs"
    }
