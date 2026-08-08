import sqlite3
conn = sqlite3.connect('backend/a1tiexam.db')
cursor = conn.cursor()
cursor.execute('DELETE FROM questions WHERE mock_test_id=13')
conn.commit()
print('Deleted all questions for test 13.')
