import sqlite3

def add_qa_columns():
    db_path = 'd:/anitigravity_mock_test/backend/mock_test_app.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Add qa_button_text
        try:
            cursor.execute("ALTER TABLE learning_lessons ADD COLUMN qa_button_text VARCHAR(255)")
            print("Successfully added qa_button_text column.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column qa_button_text already exists.")
            else:
                print(f"Error adding qa_button_text: {e}")
                
        # Add qa_content_html
        try:
            cursor.execute("ALTER TABLE learning_lessons ADD COLUMN qa_content_html TEXT")
            print("Successfully added qa_content_html column.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column qa_content_html already exists.")
            else:
                print(f"Error adding qa_content_html: {e}")
                
        conn.commit()
        conn.close()
        print("Database migration complete.")
        
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    add_qa_columns()
