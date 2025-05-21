from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Base Payment Schema
class PaymentBase(BaseModel):
    user_id: int
    subscription_id: Optional[int] = None
    amount: float
    currency: str = "INR"
    payment_method: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    status: str = "pending"
    payment_data: Optional[Dict[str, Any]] = None

# Payment Create Schema
class PaymentCreate(BaseModel):
    subscription_id: Optional[int] = None
    amount: float
    currency: str = "INR"
    payment_method: Optional[str] = None

# Payment Update Schema
class PaymentUpdate(BaseModel):
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    payment_data: Optional[Dict[str, Any]] = None

# Payment Verification Schema
class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# Payment in DB Base Schema
class PaymentInDBBase(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Payment Schema for API responses
class Payment(PaymentInDBBase):
    pass

# Razorpay Order Creation Response
class RazorpayOrderResponse(BaseModel):
    order_id: str
    currency: str
    amount: int  # Amount in paise (smallest currency unit)
    key: str

# Payment Receipt Schema
class PaymentReceipt(BaseModel):
    id: int
    transaction_id: str
    payment_date: datetime
    amount: float
    currency: str
    payment_method: str
    subscription_plan: Optional[str] = None
    subscription_duration: Optional[str] = None
    user_name: str
    user_email: str
    status: str
