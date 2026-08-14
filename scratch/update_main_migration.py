import re

with open('d:\\anitigravity_mock_test\\backend\\app\\main.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Add auto migration for learning_lessons and results
new_migration = '''        # Check test_attempts table
        result_attempts = conn.execute(text("PRAGMA table_info(test_attempts);")).fetchall()
        attempt_columns = [row[1] for row in result_attempts]
        if "warnings_count" not in attempt_columns:
            conn.execute(text("ALTER TABLE test_attempts ADD COLUMN warnings_count INTEGER NOT NULL DEFAULT 0;"))
            
        # Check results table
        result_scores = conn.execute(text("PRAGMA table_info(results);")).fetchall()
        score_columns = [row[1] for row in result_scores]
        if "objective_score" not in score_columns:
            conn.execute(text("ALTER TABLE results ADD COLUMN objective_score FLOAT DEFAULT 0.0;"))
        if "subjective_score" not in score_columns:
            conn.execute(text("ALTER TABLE results ADD COLUMN subjective_score FLOAT DEFAULT 0.0;"))
        if "objective_total_marks" not in score_columns:
            conn.execute(text("ALTER TABLE results ADD COLUMN objective_total_marks FLOAT DEFAULT 0.0;"))
        if "subjective_total_marks" not in score_columns:
            conn.execute(text("ALTER TABLE results ADD COLUMN subjective_total_marks FLOAT DEFAULT 0.0;"))
            
        # Check learning_lessons table
        result_lessons = conn.execute(text("PRAGMA table_info(learning_lessons);")).fetchall()
        lesson_columns = [row[1] for row in result_lessons]
        if "order_index" not in lesson_columns:
            conn.execute(text("ALTER TABLE learning_lessons ADD COLUMN order_index INTEGER DEFAULT 0;"))
        if "qa_button_text" not in lesson_columns:
            conn.execute(text("ALTER TABLE learning_lessons ADD COLUMN qa_button_text VARCHAR(255);"))
        if "qa_content_html" not in lesson_columns:
            conn.execute(text("ALTER TABLE learning_lessons ADD COLUMN qa_content_html TEXT;"))'''

code = code.replace(
    '        # Check test_attempts table\n        result_attempts = conn.execute(text("PRAGMA table_info(test_attempts);")).fetchall()\n        attempt_columns = [row[1] for row in result_attempts]\n        if "warnings_count" not in attempt_columns:\n            conn.execute(text("ALTER TABLE test_attempts ADD COLUMN warnings_count INTEGER NOT NULL DEFAULT 0;"))',
    new_migration
)

with open('d:\\anitigravity_mock_test\\backend\\app\\main.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done adding auto migrations')
