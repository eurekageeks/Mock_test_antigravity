import sqlite3
import os

# Adjust this path to point to your production database file
DB_PATH = os.path.join(os.path.dirname(__file__), '../backend/a1tiexam.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        print("Please update the DB_PATH variable in this script to point to your production database.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get existing columns in learning_lessons
    cursor.execute("PRAGMA table_info(learning_lessons)")
    columns = [row[1] for row in cursor.fetchall()]
    
    added_cols = []
    
    # 1. Check for order_index
    if 'order_index' not in columns:
        print("Adding order_index column...")
        cursor.execute("ALTER TABLE learning_lessons ADD COLUMN order_index INTEGER DEFAULT 0")
        added_cols.append('order_index')
        
    # 2. Check for qa_button_text
    if 'qa_button_text' not in columns:
        print("Adding qa_button_text column...")
        cursor.execute("ALTER TABLE learning_lessons ADD COLUMN qa_button_text VARCHAR(255)")
        added_cols.append('qa_button_text')
        
    # 3. Check for qa_content_html
    if 'qa_content_html' not in columns:
        print("Adding qa_content_html column...")
        cursor.execute("ALTER TABLE learning_lessons ADD COLUMN qa_content_html TEXT")
        added_cols.append('qa_content_html')
        
    conn.commit()
    conn.close()
    
    if added_cols:
        print(f"Successfully added columns: {', '.join(added_cols)}")
    else:
        print("Database schema is already up to date. All columns exist.")

if __name__ == "__main__":
    migrate()
