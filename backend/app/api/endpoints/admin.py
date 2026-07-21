from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import re
import io
import pdfplumber
from app.core.database import get_db
from app.models.models import (
    User, Topic, MockTest, Question, QuestionOption, TestAttempt, Result
)
from app.schemas.schemas import (
    AdminDashboardStats, UserResponse, StudentStatusUpdate, TestAttemptResponse,
    TopicCreate, TopicResponse, MockTestCreate, MockTestResponse,
    QuestionCreate, QuestionResponse, QuestionReorder
)
from app.api.deps import get_admin_user

router = APIRouter()

# ----------------- Dashboard Statistics -----------------
@router.get("/dashboard-stats", response_model=AdminDashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    total_students = db.query(User).filter(User.role == "student").count()
    pending_students = db.query(User).filter(User.role == "student", User.status == "pending").count()
    approved_students = db.query(User).filter(User.role == "student", User.status == "approved").count()
    disabled_students = db.query(User).filter(User.role == "student", User.status == "disabled").count()
    
    total_mock_tests = db.query(MockTest).count()
    total_questions = db.query(Question).count()
    total_attempts = db.query(TestAttempt).count()
    
    return {
        "total_students": total_students,
        "pending_students": pending_students,
        "approved_students": approved_students,
        "disabled_students": disabled_students,
        "total_mock_tests": total_mock_tests,
        "total_questions": total_questions,
        "total_attempts": total_attempts
    }

# ----------------- Student Management -----------------
@router.get("/students", response_model=List[UserResponse])
def list_students(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    query = db.query(User).filter(User.role == "student")
    if search:
        query = query.filter((User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
    if status_filter:
        query = query.filter(User.status == status_filter)
        
    return query.order_by(User.id.desc()).all()

@router.put("/students/{student_id}/status", response_model=UserResponse)
def update_student_status(
    student_id: int,
    status_in: StudentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
        
    if status_in.status not in ["pending", "approved", "disabled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status option.")
        
    student.status = status_in.status
    db.commit()
    db.refresh(student)
    return student

@router.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
        
    db.delete(student)
    db.commit()
    return {"detail": "Student deleted successfully."}

@router.get("/students/{student_id}/attempts", response_model=List[TestAttemptResponse])
def get_student_attempts(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    attempts = db.query(TestAttempt).filter(TestAttempt.user_id == student_id).order_by(TestAttempt.id.desc()).all()
    for attempt in attempts:
        attempt.mock_test_title = attempt.mock_test.title
        attempt.mock_test_total_marks = attempt.mock_test.total_marks
    return attempts

# ----------------- Topic CRUD -----------------
@router.get("/topics", response_model=List[TopicResponse])
def get_topics(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return db.query(Topic).all()

@router.post("/topics", response_model=TopicResponse)
def create_topic(topic_in: TopicCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    existing = db.query(Topic).filter(Topic.name.ilike(topic_in.name.strip())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topic already exists.")
        
    topic = Topic(name=topic_in.name.strip(), description=topic_in.description)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.put("/topics/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: int,
    topic_in: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")
        
    existing = db.query(Topic).filter(Topic.name.ilike(topic_in.name.strip()), Topic.id != topic_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topic name already taken.")
        
    topic.name = topic_in.name.strip()
    topic.description = topic_in.description
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")
        
    db.delete(topic)
    db.commit()
    return {"detail": "Topic deleted successfully."}

# ----------------- Mock Test CRUD -----------------
@router.get("/tests", response_model=List[MockTestResponse])
def get_tests(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    tests = db.query(MockTest).all()
    for test in tests:
        test.topic_name = test.topic.name
        test.question_count = len(test.questions)
    return tests

@router.post("/tests", response_model=MockTestResponse)
def create_test(test_in: MockTestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == test_in.topic_id).first()
    if not topic:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topic does not exist.")
        
    test = MockTest(
        topic_id=test_in.topic_id,
        title=test_in.title.strip(),
        description=test_in.description,
        duration_minutes=test_in.duration_minutes,
        passing_marks=test_in.passing_marks,
        total_marks=test_in.total_marks,
        instructions=test_in.instructions,
        status=test_in.status
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    test.topic_name = topic.name
    test.question_count = 0
    return test

@router.get("/tests/{test_id}", response_model=MockTestResponse)
def get_test_details(test_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")
    test.topic_name = test.topic.name
    test.question_count = len(test.questions)
    return test

@router.put("/tests/{test_id}", response_model=MockTestResponse)
def update_test(
    test_id: int,
    test_in: MockTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")
        
    topic = db.query(Topic).filter(Topic.id == test_in.topic_id).first()
    if not topic:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topic does not exist.")
        
    test.topic_id = test_in.topic_id
    test.title = test_in.title.strip()
    test.description = test_in.description
    test.duration_minutes = test_in.duration_minutes
    test.passing_marks = test_in.passing_marks
    test.total_marks = test_in.total_marks
    test.instructions = test_in.instructions
    test.status = test_in.status
    
    db.commit()
    db.refresh(test)
    test.topic_name = topic.name
    test.question_count = len(test.questions)
    return test

@router.delete("/tests/{test_id}")
def delete_test(test_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")
        
    db.delete(test)
    db.commit()
    return {"detail": "Mock test deleted successfully."}

@router.put("/tests/{test_id}/publish", response_model=MockTestResponse)
def publish_test(test_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")
    test.status = "published"
    db.commit()
    db.refresh(test)
    test.topic_name = test.topic.name
    test.question_count = len(test.questions)
    return test

@router.put("/tests/{test_id}/unpublish", response_model=MockTestResponse)
def unpublish_test(test_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")
    test.status = "draft"
    db.commit()
    db.refresh(test)
    test.topic_name = test.topic.name
    test.question_count = len(test.questions)
    return test

# ----------------- Question Management -----------------
@router.get("/tests/{test_id}/questions", response_model=List[QuestionResponse])
def get_test_questions(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    questions = db.query(Question).filter(Question.mock_test_id == test_id).order_by(Question.order_index).all()
    return questions

@router.post("/tests/{test_id}/questions", response_model=QuestionResponse)
def add_question(
    test_id: int,
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")
        
    # Get current questions count for setting default order index
    q_count = db.query(Question).filter(Question.mock_test_id == test_id).count()
    
    question = Question(
        mock_test_id=test_id,
        type=q_in.type,
        question_text=q_in.question_text,
        correct_answer=q_in.correct_answer,
        marks=q_in.marks,
        explanation=q_in.explanation,
        order_index=q_count
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    
    # Save MCQ options if provided
    if q_in.type == "mcq" and q_in.options:
        for opt in q_in.options:
            db_opt = QuestionOption(
                question_id=question.id,
                option_key=opt.option_key,
                option_text=opt.option_text
            )
            db.add(db_opt)
        db.commit()
        db.refresh(question)
        
    return question

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")
        
    question.type = q_in.type
    question.question_text = q_in.question_text
    question.correct_answer = q_in.correct_answer
    question.marks = q_in.marks
    question.explanation = q_in.explanation
    
    # Update options if MCQ
    if q_in.type == "mcq" and q_in.options:
        # Delete old options
        db.query(QuestionOption).filter(QuestionOption.question_id == question_id).delete()
        # Add new ones
        for opt in q_in.options:
            db_opt = QuestionOption(
                question_id=question.id,
                option_key=opt.option_key,
                option_text=opt.option_text
            )
            db.add(db_opt)
    elif q_in.type == "text":
        # Remove any existing MCQ options if converting type to Text
        db.query(QuestionOption).filter(QuestionOption.question_id == question_id).delete()
        
    db.commit()
    db.refresh(question)
    return question

@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")
        
    db.delete(question)
    db.commit()
    return {"detail": "Question deleted successfully."}

@router.post("/questions/{question_id}/duplicate", response_model=QuestionResponse)
def duplicate_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    orig_q = db.query(Question).filter(Question.id == question_id).first()
    if not orig_q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original question not found.")
        
    # Get current questions count for setting order index
    q_count = db.query(Question).filter(Question.mock_test_id == orig_q.mock_test_id).count()
    
    dup_q = Question(
        mock_test_id=orig_q.mock_test_id,
        type=orig_q.type,
        question_text=f"{orig_q.question_text} (Copy)",
        correct_answer=orig_q.correct_answer,
        marks=orig_q.marks,
        explanation=orig_q.explanation,
        order_index=q_count
    )
    db.add(dup_q)
    db.commit()
    db.refresh(dup_q)
    
    # Duplicate options if original was MCQ
    if orig_q.type == "mcq":
        for opt in orig_q.options:
            dup_opt = QuestionOption(
                question_id=dup_q.id,
                option_key=opt.option_key,
                option_text=opt.option_text
            )
            db.add(dup_opt)
        db.commit()
        db.refresh(dup_q)
        
    return dup_q

@router.post("/tests/{test_id}/questions/reorder")
def reorder_questions(
    test_id: int,
    reorder_in: QuestionReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Fetch all question IDs in this test to verify ownership
    questions = db.query(Question).filter(Question.mock_test_id == test_id).all()
    owned_ids = {q.id for q in questions}
    
    # Verify inputs match owned IDs
    for q_id in reorder_in.question_ids:
        if q_id not in owned_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question ID {q_id} does not belong to test {test_id}."
            )
            
    # Apply new order index
    for index, q_id in enumerate(reorder_in.question_ids):
        q = db.query(Question).filter(Question.id == q_id).first()
        if q:
            q.order_index = index
            
    db.commit()
    return {"detail": "Questions reordered successfully."}

# ----------------- PDF Question Upload -----------------
@router.post("/tests/{test_id}/questions/upload-pdf")
async def upload_pdf_questions(
    test_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Parse a PDF file and auto-create questions. Supports common Q&A formats."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock test not found.")

    # Read file bytes
    contents = await file.read()
    pdf_text = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                pdf_text += page_text + "\n"

    if not pdf_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract any text from the PDF. Ensure it is not a scanned image."
        )

    # ── Parse questions using a flexible regex ──
    # Splits on numbered question markers: 1. / Q1. / Q.1 / Question 1:
    question_blocks = re.split(
        r'(?:^|\n)(?:Q(?:uestion)?[.\s]?\d+[.:\)]|\d+[.:\)](?!\d))\s+',
        pdf_text,
        flags=re.MULTILINE | re.IGNORECASE
    )
    # Remove leading empty block from split
    question_blocks = [b.strip() for b in question_blocks if b.strip()]

    created_questions = []
    q_count = db.query(Question).filter(Question.mock_test_id == test_id).count()

    for block in question_blocks:
        lines = block.strip().splitlines()
        if not lines:
            continue

        # Collect question text (lines before first option)
        opt_pattern = re.compile(
            r'^\(?([A-D])(?:[.):]|\s)\s*(.+)', re.IGNORECASE
        )
        ans_pattern = re.compile(
            r'^(?:Ans(?:wer)?|Correct)[.:\s]+([A-D])', re.IGNORECASE
        )
        exp_pattern = re.compile(
            r'^(?:Explanation|Exp)[.:\s]+(.+)', re.IGNORECASE
        )

        question_text_lines = []
        options = {}  # key -> text
        correct_answer = None
        explanation = None
        reading_question = True

        for line in lines:
            line = line.strip()
            if not line:
                continue

            ans_match = ans_pattern.match(line)
            exp_match = exp_pattern.match(line)
            opt_match = opt_pattern.match(line)

            if ans_match:
                correct_answer = ans_match.group(1).upper()
                reading_question = False
            elif exp_match:
                explanation = exp_match.group(1).strip()
                reading_question = False
            elif opt_match:
                key = opt_match.group(1).upper()
                options[key] = opt_match.group(2).strip()
                reading_question = False
            elif reading_question:
                question_text_lines.append(line)

        question_text = " ".join(question_text_lines).strip()
        if not question_text or len(question_text) < 5:
            continue  # skip malformed blocks

        is_mcq = len(options) >= 2
        q_type = "mcq" if is_mcq else "text"

        # Default correct answer
        if not correct_answer:
            correct_answer = list(options.keys())[0] if options else "A"

        db_question = Question(
            mock_test_id=test_id,
            type=q_type,
            question_text=question_text,
            correct_answer=correct_answer,
            marks=1.0,
            explanation=explanation,
            order_index=q_count
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)

        # Add options for MCQ
        for key in ["A", "B", "C", "D"]:
            if key in options:
                db_opt = QuestionOption(
                    question_id=db_question.id,
                    option_key=key,
                    option_text=options[key]
                )
                db.add(db_opt)

        db.commit()
        db.refresh(db_question)
        q_count += 1
        created_questions.append({
            "id": db_question.id,
            "question_text": question_text[:120] + ("..." if len(question_text) > 120 else ""),
            "type": q_type,
            "correct_answer": correct_answer,
            "options_count": len(options)
        })

    return {
        "detail": f"Successfully imported {len(created_questions)} question(s) from PDF.",
        "imported_count": len(created_questions),
        "questions": created_questions
    }
