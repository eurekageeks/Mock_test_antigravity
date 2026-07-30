import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from app.models.models import User
from app.api.deps import get_admin_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/images", response_model=List[str])
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload multiple images for questions.
    Returns a list of URLs pointing to the uploaded images.
    """
    uploaded_urls = []
    
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image.")
            
        # Generate unique filename
        ext = file.filename.split(".")[-1] if "." in file.filename else "png"
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file synchronously
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()
            
        # Add the URL path to the list
        uploaded_urls.append(f"/api/uploads/{unique_filename}")
        
    return uploaded_urls
