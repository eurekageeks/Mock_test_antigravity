import sqlite3

def add_result_columns():
    db_path = 'd:/anitigravity_mock_test/backend/a1tiexam.db'
    
    columns = [
        "objective_score FLOAT DEFAULT 0.0",
        "subjective_score FLOAT DEFAULT 0.0",
        "objective_total_marks FLOAT DEFAULT 0.0",
        "subjective_total_marks FLOAT DEFAULT 0.0"
    ]
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        for col in columns:
            try:
                cursor.execute(f"ALTER TABLE results ADD COLUMN {col}")
                print(f"Added column {col.split()[0]}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"Column {col.split()[0]} already exists.")
                else:
                    print(f"Error adding column {col.split()[0]}: {e}")
                    
        conn.commit()
        conn.close()
        print("Database migration complete.")
        
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    add_result_columns()
