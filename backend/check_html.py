import sqlite3
import os

db_files = ['.\\a1tiexam.db', '.\\database.db', '.\\mock_test.db', '.\\mock_test_app.db', '.\\test.db', '.\\app\\database.db']
for db_file in db_files:
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("SELECT content_html FROM learning_lessons WHERE title='Docker Build'")
        row = cursor.fetchone()
        if row:
            with open('output_utf8.html', 'w', encoding='utf-8') as f:
                f.write(row[0])
            break
    except Exception as e:
        pass
