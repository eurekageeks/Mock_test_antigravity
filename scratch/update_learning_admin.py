import re

with open('d:\\anitigravity_mock_test\\backend\\app\\api\\endpoints\\learning_admin.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Import LessonReorderRequest
code = code.replace(
    'from app.schemas.learning_schemas import (\n    LearningLessonCreate, LearningLessonResponse\n)',
    'from app.schemas.learning_schemas import (\n    LearningLessonCreate, LearningLessonResponse, LessonReorderRequest\n)'
)

# 2. Update get_lessons to order by order_index
code = code.replace(
    '    return query.all()',
    '    return query.order_by(LearningLesson.order_index).all()'
)

# 3. Add POST /lessons/reorder
reorder_endpoint = '''
@router.post("/lessons/reorder")
def reorder_lessons(request: LessonReorderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    for item in request.items:
        db.query(LearningLesson).filter(LearningLesson.id == item.id).update({"order_index": item.order_index})
    db.commit()
    return {"message": "Reordered successfully"}

@router.get("/lessons/{lesson_id}", response_model=LearningLessonResponse)'''

code = code.replace('@router.get("/lessons/{lesson_id}", response_model=LearningLessonResponse)', reorder_endpoint)


with open('d:\\anitigravity_mock_test\\backend\\app\\api\\endpoints\\learning_admin.py', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated learning_admin.py")
