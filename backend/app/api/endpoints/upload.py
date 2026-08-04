import os
import uuid
from typing import List
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.models import User, UploadedImage
from app.api.deps import get_admin_user
from app.core.database import get_db

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/images", response_model=List[str])
async def upload_images(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload multiple images for questions.
    Returns a list of URLs pointing to the uploaded images.
    Stores files in database for serverless/production durability and writes to disk cache.
    """
    uploaded_urls = []
    
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image.")
            
        # Generate unique filename
        ext = file.filename.split(".")[-1] if "." in file.filename else "png"
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        try:
            # Read content from upload
            content = await file.read()
            
            # 1. Save to Database (Primary/Durability)
            db_image = UploadedImage(
                filename=unique_filename,
                content_type=file.content_type,
                data=content
            )
            db.add(db_image)
            db.commit()
            
            # 2. Write to disk (Fast path / Local Cache fallback)
            try:
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
            except Exception as disk_err:
                print(f"Warning: Failed to save copy on local disk: {disk_err}")
                # We do NOT fail the request since it is saved in the database
        except Exception as err:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to upload image {file.filename}: {str(err)}")
        finally:
            await file.close()
            
        # Add the URL path to the list
        uploaded_urls.append(f"/api/uploads/{unique_filename}")
        
    return uploaded_urls
