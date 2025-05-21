from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Subscription Plan Schemas
class SubscriptionPlanBase(BaseModel):
    name: str
    description: str
    price: float
    duration_days: int
    features: str
    is_active: bool = True

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None

class SubscriptionPlanInDBBase(SubscriptionPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubscriptionPlan(SubscriptionPlanInDBBase):
    pass

# Subscription Schemas
class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int
    start_date: datetime
    end_date: datetime
    is_active: bool = True
    auto_renew: bool = True

class SubscriptionCreate(BaseModel):
    plan_id: int
    auto_renew: bool = True

class SubscriptionUpdate(BaseModel):
    plan_id: Optional[int] = None
    is_active: Optional[bool] = None
    auto_renew: Optional[bool] = None
    end_date: Optional[datetime] = None

class SubscriptionInDBBase(SubscriptionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Subscription(SubscriptionInDBBase):
    plan: SubscriptionPlan

# User Subscription Status
class UserSubscriptionStatus(BaseModel):
    has_active_subscription: bool
    subscription_end_date: Optional[datetime] = None
    plan_name: Optional[str] = None
    days_remaining: Optional[int] = None
