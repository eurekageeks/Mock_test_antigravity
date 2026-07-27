from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, StudentProfile
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.api.deps import get_current_active_user
import random

reset_otps = {}

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_student(user_in: UserCreate, db: Session = Depends(get_db)):
    # Verify passwords match
    if user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
        
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered."
        )
        
    # Create the user in pending status
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        mobile=user_in.mobile,
        password_hash=hashed_password,
        role="student",
        status="pending"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize the student profile
    new_profile = StudentProfile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    # Fetch user
    clean_email = user_in.email.strip()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check status
    if user.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending administrator approval."
        )
    elif user.status == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled by the administrator."
        )
        
    # Create access token
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found associated with this email address."
        )
    otp = f"{random.randint(100000, 999999)}"
    reset_otps[clean_email.lower()] = otp
    return {
        "message": "Verification code generated successfully.",
        "otp": otp
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    clean_otp = req.otp.strip()
    if clean_email not in reset_otps or reset_otps[clean_email] != clean_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    reset_otps.pop(clean_email, None)
    return {"message": "Password reset successfully. You can now login with your new password."}

