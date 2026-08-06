from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import (
    Topic, LearningLesson
)
from app.schemas.learning_schemas import (
    TopicLearningHierarchy, LearningLessonResponse
)

router = APIRouter()

# Allow public access to catalog so guests can view the structure
@router.get("/catalog", response_model=List[TopicLearningHierarchy])
def get_public_catalog(db: Session = Depends(get_db)):
    """Returns the entire learning hierarchy structure from Topics down to Lessons."""
    topics = db.query(Topic).all()
    # Only return topics that have lessons? The user might want all.
    # We will return all topics, and the frontend can filter or show empty ones.
    return topics

# Allow public access to read a lesson
@router.get("/lessons/{lesson_id}", response_model=LearningLessonResponse)
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    """Retrieve full lesson content including Rich Text, Video URL, and Resources."""
    lesson = db.query(LearningLesson).filter(LearningLesson.id == lesson_id, LearningLesson.is_published == True).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
