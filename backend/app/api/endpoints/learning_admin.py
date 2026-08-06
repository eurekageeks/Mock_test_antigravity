from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_admin_user
from app.schemas.learning_schemas import (
    LearningLessonCreate, LearningLessonResponse
)
# Models need to be imported directly to use with SQLAlchemy
from app.models.models import (
    LearningLesson, Topic
)

router = APIRouter()

# --- Lessons ---
@router.post("/lessons", response_model=LearningLessonResponse)
def create_lesson(lesson: LearningLessonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == lesson.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    db_obj = LearningLesson(**lesson.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/lessons", response_model=List[LearningLessonResponse])
def get_lessons(topic_id: int = None, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    query = db.query(LearningLesson)
    if topic_id:
        query = query.filter(LearningLesson.topic_id == topic_id)
    return query.all()

@router.get("/lessons/{lesson_id}", response_model=LearningLessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    lesson = db.query(LearningLesson).filter(LearningLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.put("/lessons/{lesson_id}", response_model=LearningLessonResponse)
def update_lesson(lesson_id: int, lesson_in: LearningLessonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    lesson = db.query(LearningLesson).filter(LearningLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    for var, value in lesson_in.dict().items():
        setattr(lesson, var, value)
        
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson

@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    lesson = db.query(LearningLesson).filter(LearningLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted"}
