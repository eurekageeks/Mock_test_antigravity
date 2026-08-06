from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.schemas.schemas import TopicResponse

# --- Lessons ---
class LearningLessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_html: Optional[str] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    estimated_time_minutes: int = 10
    order_index: int = 0
    is_published: bool = True
    topic_id: int
    mock_test_id: Optional[int] = None

class LearningLessonCreate(LearningLessonBase):
    pass

class LearningLessonResponse(LearningLessonBase):
    id: int
    class Config:
        orm_mode = True

# --- Hierarchical Views (for student consumption) ---
class TopicLearningHierarchy(TopicResponse):
    lessons: List[LearningLessonResponse] = []
    
    class Config:
        orm_mode = True

class LessonCompleteRequest(BaseModel):
    time_spent: int
