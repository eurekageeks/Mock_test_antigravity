import sqlite3
conn = sqlite3.connect('backend/a1tiexam.db')
cursor = conn.cursor()
cursor.execute("SELECT id, type, question_text FROM questions WHERE question_text LIKE '%Which keyword is used%'")
q1 = cursor.fetchall()
print('Q1:', q1)
if q1:
    cursor.execute("SELECT option_key, option_text FROM question_options WHERE question_id=?", (q1[0][0],))
    print("  Q1 Options:", cursor.fetchall())

cursor.execute("SELECT id, type, question_text FROM questions WHERE question_text LIKE '%typeof \"123\"%'")
q2 = cursor.fetchall()
print('Q2:', q2)
if q2:
    cursor.execute("SELECT option_key, option_text FROM question_options WHERE question_id=?", (q2[0][0],))
    print("  Q2 Options:", cursor.fetchall())
