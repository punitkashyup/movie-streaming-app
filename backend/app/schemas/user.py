from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from .subscription import Subscription, UserSubscriptionStatus

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str = Field(..., min_length=8)

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8)

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    subscription_status: Optional[UserSubscriptionStatus] = None

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
