from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

# Association table for student profile and skills (Many-to-Many)
student_skills = Table(
    "student_skills",
    Base.metadata,
    Column("student_profile_id", Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mobile = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'admin' or 'student'
    status = Column(String(50), nullable=False, default="pending")  # 'pending', 'approved', 'disabled'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    attempts = relationship("TestAttempt", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    education = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    resume_path = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="profile")
    skills = relationship("Skill", secondary=student_skills, back_populates="profiles")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    
    # Relationships
    profiles = relationship("StudentProfile", secondary=student_skills, back_populates="skills")

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    tests = relationship("MockTest", back_populates="topic", cascade="all, delete-orphan")

class MockTest(Base):
    __tablename__ = "mock_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    passing_marks = Column(Float, nullable=False)
    total_marks = Column(Float, nullable=False)
    instructions = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft")  # 'draft', 'published'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    topic = relationship("Topic", back_populates="tests")
    questions = relationship("Question", back_populates="mock_test", cascade="all, delete-orphan", order_by="Question.order_index")
    attempts = relationship("TestAttempt", back_populates="mock_test", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # 'mcq' or 'text'
    question_text = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)  # choice key for MCQ (e.g. 'A') or expected text for text answer
    marks = Column(Float, nullable=False, default=1.0)
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    
    # Relationships
    mock_test = relationship("MockTest", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("StudentAnswer", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(Base):
    __tablename__ = "question_options"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    option_key = Column(String(10), nullable=False)  # 'A', 'B', 'C', 'D'
    option_text = Column(Text, nullable=False)
    
    # Relationships
    question = relationship("Question", back_populates="options")

class TestAttempt(Base):
    __tablename__ = "test_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False, default="started")  # 'started', 'submitted'
    
    # Relationships
    user = relationship("User", back_populates="attempts")
    mock_test = relationship("MockTest", back_populates="attempts")
    answers = relationship("StudentAnswer", back_populates="attempt", cascade="all, delete-orphan")
    result = relationship("Result", back_populates="attempt", uselist=False, cascade="all, delete-orphan")

class StudentAnswer(Base):
    __tablename__ = "student_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    test_attempt_id = Column(Integer, ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_option = Column(String(10), nullable=True)  # for MCQ
    text_answer = Column(Text, nullable=True)  # for Text type
    is_correct = Column(Boolean, nullable=True)
    
    # Relationships
    attempt = relationship("TestAttempt", back_populates="answers")
    question = relationship("Question", back_populates="answers")

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    test_attempt_id = Column(Integer, ForeignKey("test_attempts.id", ondelete="CASCADE"), unique=True, nullable=False)
    score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    is_passed = Column(Boolean, nullable=False)
    correct_count = Column(Integer, nullable=False)
    wrong_count = Column(Integer, nullable=False)
    rank = Column(Integer, nullable=True)
    
    # Relationships
    attempt = relationship("TestAttempt", back_populates="result")
