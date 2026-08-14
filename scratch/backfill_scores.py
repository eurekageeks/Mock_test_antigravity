from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append('d:\\anitigravity_mock_test\\backend')

from app.core.database import SessionLocal
from app.api.endpoints.student import submit_attempt_internal
from app.models.models import TestAttempt, Result

db = SessionLocal()
db = SessionLocal()

try:
    # Find all attempts that have a result
    results = db.query(Result).all()
    print(f"Found {len(results)} results to backfill.")
    
    for res in results:
        attempt_id = res.test_attempt_id
        attempt = db.query(TestAttempt).filter(TestAttempt.id == attempt_id).first()
        if attempt:
            print(f"Recalculating attempt {attempt_id}...")
            # We must trick submit_attempt_internal to recalculate.
            # But wait, submit_attempt_internal marks it as submitted and sets end_time.
            # It's safer to just run submit_attempt_internal(attempt_id, db)
            submit_attempt_internal(attempt_id, db)
            
    print("Done backfilling!")
finally:
    db.close()
