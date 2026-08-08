import sqlite3
conn = sqlite3.connect('backend/a1tiexam.db')
cursor = conn.cursor()
cursor.execute("SELECT question_id, option_key, option_text FROM question_options WHERE option_text LIKE '%initialize%'")
print('Found options:')
print(cursor.fetchall())
