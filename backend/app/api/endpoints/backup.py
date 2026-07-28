import os
import io
import csv
import zipfile
import shutil
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine, Base
from app.core.config import settings
from app.models.models import User
from app.api.deps import get_admin_user

router = APIRouter()

def _get_sqlite_db_path():
    """Extract filesystem path from SQLAlchemy DATABASE_URL if using SQLite."""
    url = settings.DATABASE_URL
    if not url.startswith("sqlite"):
        return None
    # e.g., sqlite:///./a1tiexam.db -> ./a1tiexam.db
    if url.startswith("sqlite:////"):
        return url[9:]
    elif url.startswith("sqlite:///"):
        return url[10:]
    elif url.startswith("sqlite://"):
        return url[9:]
    return None

@router.get("/download/db", summary="Download raw SQLite database file")
def download_db_file(current_user: User = Depends(get_admin_user)):
    db_path = _get_sqlite_db_path()
    if not db_path or not os.path.exists(db_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Direct DB download is only available for local SQLite storage and file must exist."
        )
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return FileResponse(
        path=db_path,
        filename=f"a1tiexam_backup_{timestamp}.db",
        media_type="application/octet-stream"
    )

@router.get("/download/sql", summary="Download SQL dump of all tables and data")
def download_sql_dump(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sql_lines = [
        f"-- A1TIEXAMPRISM Full Database SQL Backup",
        f"-- Generated at: {datetime.now().isoformat()}",
        f"-- ----------------------------------------------------",
        ""
    ]
    
    for table in Base.metadata.sorted_tables:
        sql_lines.append(f"-- Table: {table.name}")
        rows = db.execute(table.select()).fetchall()
        if not rows:
            sql_lines.append(f"-- (No rows in {table.name})")
            sql_lines.append("")
            continue
            
        columns = [col.name for col in table.columns]
        col_str = ", ".join(columns)
        
        for row in rows:
            val_strs = []
            for col_name in columns:
                val = getattr(row, col_name, None)
                if val is None:
                    val_strs.append("NULL")
                elif isinstance(val, (int, float)):
                    val_strs.append(str(val))
                elif isinstance(val, bool):
                    val_strs.append("1" if val else "0")
                elif isinstance(val, datetime):
                    val_strs.append(f"'{val.isoformat()}'")
                else:
                    # Escape single quotes
                    escaped = str(val).replace("'", "''")
                    val_strs.append(f"'{escaped}'")
            val_str = ", ".join(val_strs)
            sql_lines.append(f"INSERT INTO {table.name} ({col_str}) VALUES ({val_str});")
        sql_lines.append("")
        
    sql_content = "\n".join(sql_lines)
    return Response(
        content=sql_content,
        media_type="application/sql",
        headers={"Content-Disposition": f'attachment; filename="a1tiexam_backup_{timestamp}.sql"'}
    )

@router.get("/download/csv", summary="Download ZIP archive of CSV dumps for all tables")
def download_csv_zip(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for table in Base.metadata.sorted_tables:
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            columns = [col.name for col in table.columns]
            writer.writerow(columns)
            
            rows = db.execute(table.select()).fetchall()
            for row in rows:
                writer.writerow([getattr(row, col, None) for col in columns])
                
            zf.writestr(f"{table.name}.csv", csv_buffer.getvalue())
            
    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="a1tiexam_backup_{timestamp}.zip"'}
    )

@router.post("/upload", summary="Restore database from backup file (.db, .sql, or .zip)")
async def restore_backup(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    filename = file.filename.lower()
    content = await file.read()
    
    # Safety Checkpoint
    db_path = _get_sqlite_db_path()
    if db_path and os.path.exists(db_path):
        try:
            shutil.copy2(db_path, f"{db_path}.safety_checkpoint")
        except Exception as e:
            print(f"Warning: could not create safety checkpoint: {e}")
            
    if filename.endswith(".db") or filename.endswith(".sqlite"):
        if not db_path:
            raise HTTPException(status_code=400, detail="Cannot restore .db file when not running on SQLite storage.")
        try:
            db.close()
            engine.dispose()
            with open(db_path, "wb") as f:
                f.write(content)
            return {"status": "success", "message": f"Successfully restored SQLite database directly from '{file.filename}'. All sessions re-connected."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to restore .db file: {str(e)}")
            
    elif filename.endswith(".sql"):
        try:
            sql_text = content.decode("utf-8", errors="ignore")
            statements = [s.strip() for s in sql_text.split(";") if s.strip()]
            
            # Execute queries
            for stmt in statements:
                if stmt.upper().startswith("INSERT INTO") or stmt.upper().startswith("UPDATE") or stmt.upper().startswith("DELETE") or stmt.upper().startswith("CREATE") or stmt.upper().startswith("DROP"):
                    try:
                        db.execute(text(stmt))
                    except Exception as ex:
                        # Ignore duplicates or minor SQL formatting mismatches during restore
                        print(f"Notice during SQL restore: {ex}")
            db.commit()
            return {"status": "success", "message": f"Successfully executed SQL backup restoration from '{file.filename}'."}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to execute SQL restore: {str(e)}")
            
    elif filename.endswith(".zip"):
        try:
            zip_buffer = io.BytesIO(content)
            restored_tables = 0
            with zipfile.ZipFile(zip_buffer, "r") as zf:
                # Clear existing data in reverse dependency order
                for table in reversed(Base.metadata.sorted_tables):
                    try:
                        db.execute(table.delete())
                    except Exception:
                        pass
                
                # Insert data in dependency order
                for table in Base.metadata.sorted_tables:
                    csv_filename = f"{table.name}.csv"
                    if csv_filename in zf.namelist():
                        with zf.open(csv_filename) as cf:
                            csv_text = cf.read().decode("utf-8", errors="ignore")
                            reader = csv.DictReader(io.StringIO(csv_text))
                            for row_dict in reader:
                                cleaned = {}
                                for k, v in row_dict.items():
                                    if v == "" or v is None:
                                        cleaned[k] = None
                                        continue
                                    col = table.columns.get(k)
                                    if col is not None:
                                        col_type_str = str(col.type).upper()
                                        if "BOOL" in col_type_str:
                                            cleaned[k] = v.lower() in ("true", "1", "t", "yes")
                                        elif "DATETIME" in col_type_str or "TIMESTAMP" in col_type_str or "DATE" in col_type_str:
                                            try:
                                                cleaned[k] = datetime.fromisoformat(v)
                                            except Exception:
                                                cleaned[k] = v
                                        elif "INT" in col_type_str:
                                            try:
                                                cleaned[k] = int(v)
                                            except Exception:
                                                cleaned[k] = v
                                        elif "FLOAT" in col_type_str or "NUMERIC" in col_type_str:
                                            try:
                                                cleaned[k] = float(v)
                                            except Exception:
                                                cleaned[k] = v
                                        else:
                                            cleaned[k] = v
                                    else:
                                        cleaned[k] = v
                                try:
                                    db.execute(table.insert().values(**cleaned))
                                except Exception as ex:
                                    print(f"Notice during CSV insert on {table.name}: {ex}")
                        restored_tables += 1
            db.commit()
            return {"status": "success", "message": f"Successfully restored {restored_tables} tables from CSV ZIP archive '{file.filename}'."}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to restore CSV ZIP archive: {str(e)}")
            
    else:
        raise HTTPException(status_code=400, detail="Unsupported backup file format. Please upload a .db, .sql, or .zip file.")
