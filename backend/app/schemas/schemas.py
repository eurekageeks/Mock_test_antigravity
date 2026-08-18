from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, date

# ----------------- Base Config -----------------
class BaseSchema(BaseModel):
    class Config:
        orm_mode = True
        from_attributes = True

# ----------------- User & Auth -----------------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6)
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseSchema):
    id: int
    name: str
    email: EmailStr
    mobile: Optional[str]
    role: str
    status: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class StudentStatusUpdate(BaseModel):
    status: str  # 'pending', 'approved', 'disabled'

# ----------------- Skills & Profile -----------------
class SkillResponse(BaseSchema):
    id: int
    name: str

class SkillsUpdate(BaseModel):
    skills: List[str]

class StudentProfileResponse(BaseSchema):
    id: int
    user_id: int
    education: Optional[str]
    experience: Optional[str]
    resume_path: Optional[str]
    skills: List[SkillResponse] = []

class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None

# ----------------- Topic -----------------
class TopicCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class TopicResponse(BaseSchema):
    id: int
    name: str
    description: Optional[str]

# ----------------- Question Options -----------------
class QuestionOptionCreate(BaseModel):
    option_key: str = Field(..., min_length=1, max_length=10)  # 'A', 'B', etc.
    option_text: str

class QuestionOptionResponse(BaseSchema):
    id: int
    option_key: str
    option_text: str

# ----------------- Question -----------------
class QuestionCreate(BaseModel):
    type: str  # 'mcq' or 'text'
    question_text: str
    correct_answer: str
    marks: float = 1.0
    explanation: Optional[str] = None
    image_urls: Optional[List[str]] = None
    options: Optional[List[QuestionOptionCreate]] = None

class QuestionResponse(BaseSchema):
    id: int
    mock_test_id: int
    type: str
    question_text: str
    correct_answer: str
    marks: float
    explanation: Optional[str]
    image_urls: Optional[List[str]] = None
    order_index: int
    options: List[QuestionOptionResponse] = []

class QuestionReorder(BaseModel):
    question_ids: List[int]

# ----------------- Mock Test -----------------

class MockTestBase(BaseSchema):
    title: str
    description: Optional[str] = None
    duration_minutes: int
    total_marks: float
    passing_marks: float
    instructions: Optional[str] = None
    status: str = "draft"
    auto_calculate_marks: bool = True

class MockTestCreate(MockTestBase):
    topic_ids: List[int]

class MockTestUpdate(MockTestBase):
    topic_ids: Optional[List[int]] = None

class MockTestResponse(MockTestBase):
    id: int
    topics: List[TopicResponse] = []
    created_at: datetime
    questions_count: int = 0
    is_recommended: Optional[bool] = False
    is_completed: Optional[bool] = False
    is_incomplete: Optional[bool] = False
    has_subjective: Optional[bool] = False

# ----------------- Student-facing Secure Test Attempt Schemas -----------------
class StudentQuestionOption(BaseSchema):
    id: int
    option_key: str
    option_text: str

class StudentQuestion(BaseSchema):
    id: int
    type: str
    question_text: str
    marks: float
    order_index: int
    image_urls: Optional[List[str]] = None
    options: List[StudentQuestionOption] = []
    saved_answer: Optional[dict] = None  # Contains currently saved answer if student resumes

class StudentTestStartResponse(BaseModel):
    attempt_id: int
    test_id: int
    title: str
    duration_minutes: int
    total_marks: float
    instructions: Optional[str]
    questions: List[StudentQuestion]
    start_time: datetime
    time_remaining_seconds: int
    warnings_count: int

# ----------------- Student Answer Logging -----------------
class AnswerSave(BaseModel):
    question_id: int
    selected_option: Optional[str] = None  # for MCQ
    text_answer: Optional[str] = None  # for Text type

class AnswerSaveResponse(BaseModel):
    success: bool
    message: str

# ----------------- Results & Review -----------------
class ResultResponse(BaseSchema):
    id: int
    test_attempt_id: int
    score: float
    percentage: float
    is_passed: bool
    correct_count: int
    wrong_count: int
    objective_score: float = 0.0
    subjective_score: float = 0.0
    objective_total_marks: float = 0.0
    subjective_total_marks: float = 0.0
    rank: Optional[int] = None

class TestAttemptResponse(BaseSchema):
    id: int
    user_id: int
    mock_test_id: int
    start_time: datetime
    end_time: Optional[datetime]
    time_taken_seconds: Optional[int]
    status: str
    mock_test_title: Optional[str] = None
    mock_test_total_marks: Optional[float] = None
    topic_names: Optional[List[str]] = []
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_mobile: Optional[str] = None
    subjective_questions_count: Optional[int] = 0
    objective_questions_count: Optional[int] = 0
    pending_subjective_count: Optional[int] = 0
    warnings_count: Optional[int] = 0
    result: Optional[ResultResponse] = None

class PaginatedAttemptResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[TestAttemptResponse]

class ReviewAnswerResponse(BaseSchema):
    id: int
    question_id: int
    selected_option: Optional[str]
    text_answer: Optional[str]
    is_correct: Optional[bool]
    # Include original question details for review
    question_text: str
    question_type: str
    correct_answer: str
    explanation: Optional[str]
    image_urls: Optional[List[str]] = None
    marks: float
    options: List[QuestionOptionResponse] = []

class AttemptDetailReviewResponse(BaseModel):
    attempt: TestAttemptResponse
    answers: List[ReviewAnswerResponse]

# ----------------- Admin Statistics -----------------
class AdminDashboardStats(BaseModel):
    total_students: int
    pending_students: int
    approved_students: int
    disabled_students: int
    total_mock_tests: int
    total_questions: int
    total_attempts: int

# ----------------- Student Dashboard -----------------
class StudentDashboardStats(BaseModel):
    welcome_name: str
    available_tests_count: int
    completed_tests_count: int
    average_score: float
    profile_completion_percentage: int
    has_skills: bool
    recent_attempts: List[TestAttemptResponse]
    popular_topics: List[TopicResponse]
    active_attempt_id: Optional[int] = None  # For continuing a test

# ----------------- Auth & Bulk Action Schemas -----------------
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class BulkQuestionDelete(BaseModel):
    question_ids: Optional[List[int]] = None

class BulkQuestionUpdateMarks(BaseModel):
    question_ids: Optional[List[int]] = None
    marks: float = Field(..., gt=0)

class BulkAttemptDelete(BaseModel):
    attempt_ids: List[int]

