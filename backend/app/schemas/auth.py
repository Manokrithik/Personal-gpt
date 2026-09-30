from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_color: Optional[str] = "#0d99ff"

class UserLoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_color: str = "#0d99ff"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_color: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserPasswordResetRequest(BaseModel):
    username: str
    new_password: str = Field(..., min_length=1, max_length=128)

