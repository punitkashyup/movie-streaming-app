from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import timedelta

from app.core.database import Base
from app.core.utils import get_utc_now

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    duration_days = Column(Integer)  # Duration in days
    features = Column(String)  # Comma-separated list of features
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship with subscriptions
    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), index=True)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    auto_renew = Column(Boolean, default=True)
    payment_status = Column(String, default="pending")  # pending, paid, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships - using string reference to avoid circular imports
    user = relationship("app.models.user.User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    payments = relationship("app.models.payment.Payment", back_populates="subscription")

    def is_valid(self) -> bool:
        """Check if the subscription is currently valid"""
        now = get_utc_now()
        return self.is_active and self.end_date > now
