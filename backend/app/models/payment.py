from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import timedelta

from app.core.database import Base
from app.core.utils import get_utc_now

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_method = Column(String, nullable=True)  # card, upi, netbanking, etc.
    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_signature = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, successful, failed
    payment_data = Column(JSON, nullable=True)  # Store additional payment data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("app.models.user.User", back_populates="payments")
    subscription = relationship("app.models.subscription.Subscription", back_populates="payments")

    def is_verified(self) -> bool:
        """Check if the payment is verified"""
        return self.status == "successful" and self.razorpay_payment_id is not None
