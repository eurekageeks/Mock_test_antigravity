from fastapi import FastAPI, Depends, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import mimetypes
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.endpoints import auth, student, admin, backup, upload
from app.seed import seed_data

# Initialize the database tables on startup
Base.metadata.create_all(bind=engine)

# Auto-migration for existing databases
try:
    with engine.connect() as conn:
        from sqlalchemy import text
        
        # Check questions table
        result = conn.execute(text("PRAGMA table_info(questions);")).fetchall()
        columns = [row[1] for row in result]
        if "image_urls" not in columns:
            conn.execute(text("ALTER TABLE questions ADD COLUMN image_urls JSON;"))
            
        # Check mock_tests table
        result_tests = conn.execute(text("PRAGMA table_info(mock_tests);")).fetchall()
        test_columns = [row[1] for row in result_tests]
        if "auto_calculate_marks" not in test_columns:
            conn.execute(text("ALTER TABLE mock_tests ADD COLUMN auto_calculate_marks BOOLEAN DEFAULT 1;"))
            
        # Check test_attempts table
        result_attempts = conn.execute(text("PRAGMA table_info(test_attempts);")).fetchall()
        attempt_columns = [row[1] for row in result_attempts]
        if "warnings_count" not in attempt_columns:
            conn.execute(text("ALTER TABLE test_attempts ADD COLUMN warnings_count INTEGER NOT NULL DEFAULT 0;"))
            
        # Migrate old image URLs in questions to include /api prefix
        conn.execute(text("""
            UPDATE questions 
            SET image_urls = REPLACE(image_urls, '"/uploads/', '"/api/uploads/') 
            WHERE image_urls LIKE '%"/uploads/%';
        """))
            
        conn.commit()
except Exception as e:
    print(f"Auto-migration error: {e}")

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
app.include_router(backup.router, prefix="/api/admin/backup", tags=["Admin Backup & Restore"])
app.include_router(upload.router, prefix="/api/upload", tags=["Uploads"])

from app.models.models import UploadedImage

@app.get("/api/uploads/{filename}")
def serve_upload_file(filename: str):
    file_path = os.path.join("uploads", filename)
    if os.path.exists(file_path):
        # Serve from filesystem
        mime_type, _ = mimetypes.guess_type(file_path)
        try:
            with open(file_path, "rb") as f:
                return Response(content=f.read(), media_type=mime_type or "image/png")
        except Exception:
            pass # fallback to database if reading fails

    # Fallback: serve from database
    db = SessionLocal()
    try:
        db_image = db.query(UploadedImage).filter(UploadedImage.filename == filename).first()
        if db_image:
            # Try to cache to filesystem if writable
            try:
                os.makedirs("uploads", exist_ok=True)
                with open(file_path, "wb") as f:
                    f.write(db_image.data)
            except Exception:
                pass # ignore filesystem cache write error (e.g. in serverless/docker environments)
            
            return Response(content=db_image.data, media_type=db_image.content_type)
    finally:
        db.close()
        
    raise HTTPException(status_code=404, detail="File not found")

# Mount uploads directory for serving static image files
os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "docs_url": "/docs"
    }
