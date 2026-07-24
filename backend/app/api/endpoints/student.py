from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.core.database import get_db
from app.models.models import (
    User, StudentProfile, Skill, MockTest, Question,
    TestAttempt, StudentAnswer, Result, Topic
)
from app.schemas.schemas import (
    StudentDashboardStats, StudentProfileResponse, StudentProfileUpdate,
    SkillsUpdate, MockTestResponse, TopicResponse, StudentTestStartResponse,
    StudentQuestion, StudentQuestionOption, AnswerSave, AnswerSaveResponse,
    ResultResponse, TestAttemptResponse, AttemptDetailReviewResponse,
    ReviewAnswerResponse
)
from app.api.deps import get_student_user, get_optional_student_user

router = APIRouter()

@router.get("/dashboard", response_model=StudentDashboardStats)
def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_student_user)):
    # 1. Fetch available tests count
    available_tests = db.query(MockTest).filter(MockTest.status == "published").all()
    available_tests_count = len(available_tests)
    
    # 2. Fetch completed attempts and calculations
    completed_attempts = db.query(TestAttempt).filter(
        TestAttempt.user_id == current_user.id,
        TestAttempt.status == "submitted"
    ).all()
    completed_tests_count = len(completed_attempts)
    
    # Calculate average score
    average_score = 0.0
    if completed_tests_count > 0:
        total_percentage = 0.0
        for attempt in completed_attempts:
            if attempt.result:
                total_percentage += attempt.result.percentage
        average_score = round(total_percentage / completed_tests_count, 2)
        
    # 3. Calculate profile completion percentage
    profile_pct = 0
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    
    if current_user.name:
        profile_pct += 20
    if current_user.mobile:
        profile_pct += 20
    if profile:
        if profile.education:
            profile_pct += 20
        if profile.experience:
            profile_pct += 20
        if len(profile.skills) > 0:
            profile_pct += 20
            
    # 4. Fetch recent attempts
    recent_attempts = db.query(TestAttempt).filter(
        TestAttempt.user_id == current_user.id
    ).order_by(TestAttempt.id.desc()).limit(5).all()
    
    # Map mock test titles
    for attempt in recent_attempts:
        attempt.mock_test_title = attempt.mock_test.title
        
    # 5. Fetch popular topics
    popular_topics = db.query(Topic).limit(6).all()
    
    # 6. Active attempt (if any started in the last few hours and not submitted)
    active_attempt = db.query(TestAttempt).filter(
        TestAttempt.user_id == current_user.id,
        TestAttempt.status == "started"
    ).first()
    
    active_attempt_id = None
    if active_attempt:
        # Check if the active attempt has actually expired
        test_duration = active_attempt.mock_test.duration_minutes
        limit_time = active_attempt.start_time + timedelta(minutes=test_duration)
        if datetime.utcnow() <= limit_time + timedelta(seconds=30):
            active_attempt_id = active_attempt.id
            
    return {
        "welcome_name": current_user.name,
        "available_tests_count": available_tests_count,
        "completed_tests_count": completed_tests_count,
        "average_score": average_score,
        "profile_completion_percentage": profile_pct,
        "has_skills": bool(profile and len(profile.skills) > 0),
        "recent_attempts": recent_attempts,
        "popular_topics": popular_topics,
        "active_attempt_id": active_attempt_id
    }

@router.get("/profile", response_model=StudentProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_student_user)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=StudentProfileResponse)
def update_profile(
    profile_in: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Update user properties
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.mobile is not None:
        current_user.mobile = profile_in.mobile
        
    # Update profile properties
    if profile_in.education is not None:
        profile.education = profile_in.education
    if profile_in.experience is not None:
        profile.experience = profile_in.experience
        
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)
    return profile

@router.post("/skills", response_model=StudentProfileResponse)
def update_skills(
    skills_in: SkillsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Resolve skill tags
    db_skills = []
    for skill_name in skills_in.skills:
        clean_name = skill_name.strip()
        if not clean_name:
            continue
        skill = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
        if not skill:
            skill = Skill(name=clean_name)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        db_skills.append(skill)
        
    profile.skills = db_skills
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/tests", response_model=List[MockTestResponse])
def list_student_tests(
    topic_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_student_user)
):
    query = db.query(MockTest).filter(MockTest.status == "published")
    if topic_id:
        query = query.filter(MockTest.topic_id == topic_id)
    if search:
        query = query.filter(MockTest.title.ilike(f"%{search}%"))

    tests = query.all()

    # Compute student skill names — strip and lowercase for case-insensitive matching
    skill_names = set()
    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            skill_names = {s.name.strip().lower() for s in profile.skills}

    recommended = []
    others = []
    for test in tests:
        test.topic_name = test.topic.name
        test.question_count = len(test.questions)
        # Strip and lowercase both sides for case-insensitive match
        test.is_recommended = (test.topic.name.strip().lower() in skill_names) if skill_names else False
        if test.is_recommended:
            recommended.append(test)
        else:
            others.append(test)

    return recommended + others

@router.get("/tests/{test_id}", response_model=MockTestResponse)
def get_student_test_detail(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    """Return details of a single published test for the confirmation/instructions screen."""
    test = db.query(MockTest).filter(
        MockTest.id == test_id,
        MockTest.status == "published"
    ).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mock test not found or is not published."
        )
    test.topic_name = test.topic.name
    test.question_count = len(test.questions)
    return test

@router.get("/topics", response_model=List[TopicResponse])
def list_student_topics(db: Session = Depends(get_db)):
    return db.query(Topic).all()

@router.post("/tests/{test_id}/start", response_model=StudentTestStartResponse)
def start_test_attempt(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    # 1. Fetch test
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test or test.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mock test not found or is not published yet."
        )
        
    # 2. Check for an active, incomplete attempt
    active_attempt = db.query(TestAttempt).filter(
        TestAttempt.user_id == current_user.id,
        TestAttempt.mock_test_id == test_id,
        TestAttempt.status == "started"
    ).first()
    
    if active_attempt:
        # Check if the active attempt has expired
        test_duration = active_attempt.mock_test.duration_minutes
        limit_time = active_attempt.start_time + timedelta(minutes=test_duration)
        if datetime.utcnow() > limit_time + timedelta(seconds=30):
            # Enforce automatic submission of this old attempt
            submit_attempt_internal(active_attempt.id, db)
            active_attempt = None
            
    if not active_attempt:
        # Create a new test attempt
        active_attempt = TestAttempt(
            user_id=current_user.id,
            mock_test_id=test_id,
            status="started"
        )
        db.add(active_attempt)
        db.commit()
        db.refresh(active_attempt)
        
    # Calculate time remaining
    elapsed_seconds = (datetime.utcnow() - active_attempt.start_time).total_seconds()
    duration_seconds = test.duration_minutes * 60
    time_remaining_seconds = max(0, int(duration_seconds - elapsed_seconds))
    
    # 3. Compile questions securely without answers
    student_questions = []
    for q in test.questions:
        # Retrieve already saved answer if student resumed
        saved_ans = db.query(StudentAnswer).filter(
            StudentAnswer.test_attempt_id == active_attempt.id,
            StudentAnswer.question_id == q.id
        ).first()
        
        saved_answer_dict = None
        if saved_ans:
            saved_answer_dict = {
                "selected_option": saved_ans.selected_option,
                "text_answer": saved_ans.text_answer
            }
            
        student_questions.append(
            StudentQuestion(
                id=q.id,
                type=q.type,
                question_text=q.question_text,
                marks=q.marks,
                order_index=q.order_index,
                options=[StudentQuestionOption(
                    id=opt.id,
                    option_key=opt.option_key,
                    option_text=opt.option_text
                ) for opt in q.options],
                saved_answer=saved_answer_dict
            )
        )
        
    return {
        "attempt_id": active_attempt.id,
        "test_id": test.id,
        "title": test.title,
        "duration_minutes": test.duration_minutes,
        "total_marks": test.total_marks,
        "instructions": test.instructions,
        "questions": student_questions,
        "start_time": active_attempt.start_time,
        "time_remaining_seconds": time_remaining_seconds
    }

@router.get("/attempts/{attempt_id}", response_model=StudentTestStartResponse)
def get_active_attempt_details(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test attempt not found."
        )
        
    if attempt.status != "started":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test attempt has already been submitted."
        )
        
    # Calculate time remaining
    elapsed_seconds = (datetime.utcnow() - attempt.start_time).total_seconds()
    duration_seconds = attempt.mock_test.duration_minutes * 60
    time_remaining_seconds = max(0, int(duration_seconds - elapsed_seconds))
    
    # Compile questions securely without answers
    student_questions = []
    for q in attempt.mock_test.questions:
        # Retrieve already saved answer if student resumed
        saved_ans = db.query(StudentAnswer).filter(
            StudentAnswer.test_attempt_id == attempt.id,
            StudentAnswer.question_id == q.id
        ).first()
        
        saved_answer_dict = None
        if saved_ans:
            saved_answer_dict = {
                "selected_option": saved_ans.selected_option,
                "text_answer": saved_ans.text_answer
            }
            
        student_questions.append(
            StudentQuestion(
                id=q.id,
                type=q.type,
                question_text=q.question_text,
                marks=q.marks,
                order_index=q.order_index,
                options=[StudentQuestionOption(
                    id=opt.id,
                    option_key=opt.option_key,
                    option_text=opt.option_text
                ) for opt in q.options],
                saved_answer=saved_answer_dict
            )
        )
        
    return {
        "attempt_id": attempt.id,
        "test_id": attempt.mock_test.id,
        "title": attempt.mock_test.title,
        "duration_minutes": attempt.mock_test.duration_minutes,
        "total_marks": attempt.mock_test.total_marks,
        "instructions": attempt.mock_test.instructions,
        "questions": student_questions,
        "start_time": attempt.start_time,
        "time_remaining_seconds": time_remaining_seconds
    }

@router.post("/attempts/{attempt_id}/save-answer", response_model=AnswerSaveResponse)
def save_answer(
    attempt_id: int,
    ans_in: AnswerSave,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test attempt not found."
        )
        
    if attempt.status != "started":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test attempt has already been submitted."
        )
        
    # Backend Timer Verification: check if the exam has expired (duration + 30s grace)
    duration_minutes = attempt.mock_test.duration_minutes
    limit_time = attempt.start_time + timedelta(minutes=duration_minutes)
    if datetime.utcnow() > limit_time + timedelta(seconds=30):
        # Force auto-submit since time has run out
        submit_attempt_internal(attempt.id, db)
        return {
            "success": False,
            "message": "Time has expired! This attempt was submitted automatically."
        }
        
    # Get question to verify marks & correctness
    question = db.query(Question).filter(
        Question.id == ans_in.question_id,
        Question.mock_test_id == attempt.mock_test_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found in this mock test."
        )
        
    # Grade answer
    is_correct = False
    if question.type == "mcq":
        is_correct = (ans_in.selected_option == question.correct_answer)
    elif question.type == "text":
        if ans_in.text_answer and question.correct_answer:
            is_correct = (ans_in.text_answer.strip().lower() == question.correct_answer.strip().lower())
            
    # Check if answer exists
    student_ans = db.query(StudentAnswer).filter(
        StudentAnswer.test_attempt_id == attempt.id,
        StudentAnswer.question_id == question.id
    ).first()
    
    if student_ans:
        student_ans.selected_option = ans_in.selected_option
        student_ans.text_answer = ans_in.text_answer
        student_ans.is_correct = is_correct
    else:
        student_ans = StudentAnswer(
            test_attempt_id=attempt.id,
            question_id=question.id,
            selected_option=ans_in.selected_option,
            text_answer=ans_in.text_answer,
            is_correct=is_correct
        )
        db.add(student_ans)
        
    db.commit()
    return {
        "success": True,
        "message": "Answer saved successfully."
    }

@router.post("/attempts/{attempt_id}/submit", response_model=ResultResponse)
def submit_test_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test attempt not found."
        )
        
    if attempt.status == "submitted":
        # If already graded, return the existing result
        if attempt.result:
            return attempt.result
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt is marked submitted but has no result record."
        )
        
    result = submit_attempt_internal(attempt.id, db)
    return result

@router.get("/attempts/{attempt_id}/result", response_model=AttemptDetailReviewResponse)
def get_attempt_result(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found."
        )
        
    if attempt.status != "submitted" or not attempt.result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results are not ready. This test is not submitted yet."
        )
        
    # Get all questions of this mock test
    questions = db.query(Question).filter(Question.mock_test_id == attempt.mock_test_id).order_by(Question.order_index).all()
    
    review_answers = []
    for q in questions:
        # Find student's answer
        student_ans = db.query(StudentAnswer).filter(
            StudentAnswer.test_attempt_id == attempt.id,
            StudentAnswer.question_id == q.id
        ).first()
        
        selected_option = student_ans.selected_option if student_ans else None
        text_answer = student_ans.text_answer if student_ans else None
        is_correct = student_ans.is_correct if student_ans else False
        
        review_answers.append({
            "id": student_ans.id if student_ans else 0,
            "question_id": q.id,
            "selected_option": selected_option,
            "text_answer": text_answer,
            "is_correct": is_correct,
            "question_text": q.question_text,
            "question_type": q.type,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "marks": q.marks,
            "options": q.options
        })
        
    attempt.mock_test_title = attempt.mock_test.title
    attempt.mock_test_total_marks = attempt.mock_test.total_marks
    return {
        "attempt": attempt,
        "answers": review_answers
    }

@router.get("/attempts", response_model=List[TestAttemptResponse])
def get_student_attempts(db: Session = Depends(get_db), current_user: User = Depends(get_student_user)):
    attempts = db.query(TestAttempt).filter(
        TestAttempt.user_id == current_user.id
    ).order_by(TestAttempt.id.desc()).all()
    
    for attempt in attempts:
        attempt.mock_test_title = attempt.mock_test.title
        attempt.mock_test_total_marks = attempt.mock_test.total_marks
    return attempts

# ----------------- Helper functions -----------------
def submit_attempt_internal(attempt_id: int, db: Session) -> Result:
    attempt = db.query(TestAttempt).filter(TestAttempt.id == attempt_id).first()
    if not attempt:
        raise ValueError("Attempt not found")
        
    # Mark as submitted
    attempt.status = "submitted"
    attempt.end_time = datetime.utcnow()
    
    time_taken = (attempt.end_time - attempt.start_time).total_seconds()
    # Bound by duration limit
    max_duration_seconds = attempt.mock_test.duration_minutes * 60
    attempt.time_taken_seconds = min(int(time_taken), max_duration_seconds)
    
    # Fetch all questions and student answers
    questions = db.query(Question).filter(Question.mock_test_id == attempt.mock_test_id).all()
    
    score = 0.0
    correct_count = 0
    wrong_count = 0
    
    for q in questions:
        student_ans = db.query(StudentAnswer).filter(
            StudentAnswer.test_attempt_id == attempt.id,
            StudentAnswer.question_id == q.id
        ).first()
        
        # If student did not answer, count as wrong with zero marks
        if student_ans:
            if student_ans.is_correct:
                score += q.marks
                correct_count += 1
            else:
                wrong_count += 1
        else:
            wrong_count += 1
            
    # Calculate percentage
    percentage = 0.0
    if attempt.mock_test.total_marks > 0:
        percentage = round((score / attempt.mock_test.total_marks) * 100, 2)
        
    is_passed = score >= attempt.mock_test.passing_marks
    
    # Calculate rank among all submitted attempts for this mock test
    better_attempts = db.query(Result).join(TestAttempt).filter(
        TestAttempt.mock_test_id == attempt.mock_test_id,
        Result.score > score
    ).count()
    rank = better_attempts + 1
    
    # Check if result already exists (in case of double submission safety)
    result = db.query(Result).filter(Result.test_attempt_id == attempt.id).first()
    if result:
        result.score = score
        result.percentage = percentage
        result.is_passed = is_passed
        result.correct_count = correct_count
        result.wrong_count = wrong_count
        result.rank = rank
    else:
        result = Result(
            test_attempt_id=attempt.id,
            score=score,
            percentage=percentage,
            is_passed=is_passed,
            correct_count=correct_count,
            wrong_count=wrong_count,
            rank=rank
        )
        db.add(result)
        
    db.commit()
    db.refresh(result)
    return result
