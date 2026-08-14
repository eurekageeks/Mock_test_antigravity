import re

with open('d:\\anitigravity_mock_test\\backend\\app\\api\\endpoints\\student.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Refactor submit_attempt_internal
old_logic = '''    score = 0.0
    correct_count = 0
    wrong_count = 0
    
    for q in questions:
        student_ans = db.query(StudentAnswer).filter(
            StudentAnswer.test_attempt_id == attempt.id,
            StudentAnswer.question_id == q.id
        ).first()
        
        # If student did not answer, count as wrong with zero marks
        if student_ans:
            if student_ans.is_correct is True:
                score += q.marks
                correct_count += 1
            elif student_ans.is_correct is False:
                wrong_count += 1
            # If student_ans.is_correct is None (pending subjective evaluation), exclude from both
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
        
    db.commit()'''

new_logic = '''    score = 0.0
    objective_score = 0.0
    subjective_score = 0.0
    objective_total_marks = 0.0
    subjective_total_marks = 0.0
    correct_count = 0
    wrong_count = 0
    
    for q in questions:
        if q.type == 'mcq':
            objective_total_marks += q.marks
        elif q.type == 'text':
            subjective_total_marks += q.marks
            
        student_ans = db.query(StudentAnswer).filter(
            StudentAnswer.test_attempt_id == attempt.id,
            StudentAnswer.question_id == q.id
        ).first()
        
        # If student did not answer, count as wrong with zero marks
        if student_ans:
            if student_ans.is_correct is True:
                score += q.marks
                if q.type == 'mcq':
                    objective_score += q.marks
                elif q.type == 'text':
                    subjective_score += q.marks
                correct_count += 1
            elif student_ans.is_correct is False:
                wrong_count += 1
            # If student_ans.is_correct is None (pending subjective evaluation), exclude from both
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
        result.objective_score = objective_score
        result.subjective_score = subjective_score
        result.objective_total_marks = objective_total_marks
        result.subjective_total_marks = subjective_total_marks
    else:
        result = Result(
            test_attempt_id=attempt.id,
            score=score,
            percentage=percentage,
            is_passed=is_passed,
            correct_count=correct_count,
            wrong_count=wrong_count,
            objective_score=objective_score,
            subjective_score=subjective_score,
            objective_total_marks=objective_total_marks,
            subjective_total_marks=subjective_total_marks,
            rank=rank
        )
        db.add(result)
        
    db.commit()'''

code = code.replace(old_logic, new_logic)

with open('d:\\anitigravity_mock_test\\backend\\app\\api\\endpoints\\student.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done refactoring student.py!')
