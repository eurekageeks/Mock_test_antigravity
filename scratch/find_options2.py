import sqlite3
conn = sqlite3.connect('backend/a1tiexam.db')
cursor = conn.cursor()
cursor.execute("SELECT id, type, question_text FROM questions WHERE id >= 115 LIMIT 3")
questions = cursor.fetchall()
print('Questions 115-117:')
for q in questions:
    print(q)
    cursor.execute("SELECT option_key, option_text FROM question_options WHERE question_id=?", (q[0],))
    opts = cursor.fetchall()
    print("  Options:", opts)
