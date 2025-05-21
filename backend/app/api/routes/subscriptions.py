from typing import List
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.utils import get_utc_now

from app.core.database import get_db
from app.models.subscription import SubscriptionPlan, Subscription
# Import User model using a function to avoid circular imports
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.schemas.subscription import (
    SubscriptionPlan as SubscriptionPlanSchema,
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    Subscription as SubscriptionSchema,
    SubscriptionCreate,
    SubscriptionUpdate,
    UserSubscriptionStatus
)
from app.api.deps import get_current_active_user, get_current_active_superuser

router = APIRouter()

# Subscription Plans Endpoints
@router.get("/subscription-plans", response_model=List[SubscriptionPlanSchema])
async def get_subscription_plans(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Get all active subscription plans.
    """
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).offset(skip).limit(limit).all()
    return plans

@router.post("/subscription-plans", response_model=SubscriptionPlanSchema)
async def create_subscription_plan(
    *,
    db: Session = Depends(get_db),
    plan_in: SubscriptionPlanCreate,
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Create a new subscription plan (admin only).
    """
    plan = SubscriptionPlan(
        name=plan_in.name,
        description=plan_in.description,
        price=plan_in.price,
        duration_days=plan_in.duration_days,
        features=plan_in.features,
        is_active=plan_in.is_active,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.put("/subscription-plans/{plan_id}", response_model=SubscriptionPlanSchema)
async def update_subscription_plan(
    *,
    db: Session = Depends(get_db),
    plan_id: int,
    plan_in: SubscriptionPlanUpdate,
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Update a subscription plan (admin only).
    """
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )

    update_data = plan_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/subscription-plans/{plan_id}", response_model=dict)
async def delete_subscription_plan(
    *,
    db: Session = Depends(get_db),
    plan_id: int,
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Delete a subscription plan (admin only).

    Note: This will set the plan to inactive rather than actually deleting it
    to preserve historical data for existing subscriptions.
    """
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found",
        )

    # Check if there are any active subscriptions using this plan
    active_subscriptions = db.query(Subscription).filter(
        Subscription.plan_id == plan_id,
        Subscription.is_active == True,
        Subscription.end_date > get_utc_now()
    ).count()

    if active_subscriptions > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete plan with {active_subscriptions} active subscriptions. Deactivate the plan instead.",
        )

    # Instead of deleting, we'll set it to inactive
    plan.is_active = False
    db.add(plan)
    db.commit()

    return {
        "success": True,
        "message": f"Subscription plan '{plan.name}' has been deactivated successfully."
    }

# User Subscriptions Endpoints
@router.get("/subscriptions/me", response_model=UserSubscriptionStatus)
async def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get current user's subscription status.
    """
    # Get the most recent active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True,
        Subscription.end_date > get_utc_now()
    ).order_by(Subscription.end_date.desc()).first()

    if not subscription:
        return UserSubscriptionStatus(
            has_active_subscription=False,
            subscription_end_date=None,
            plan_name=None,
            days_remaining=None
        )

    # Calculate days remaining
    days_remaining = (subscription.end_date - get_utc_now()).days

    return UserSubscriptionStatus(
        has_active_subscription=True,
        subscription_end_date=subscription.end_date,
        plan_name=subscription.plan.name,
        days_remaining=days_remaining
    )

@router.post("/subscriptions", response_model=SubscriptionSchema)
async def create_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_in: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Subscribe to a plan.
    """
    # Check if plan exists
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == subscription_in.plan_id,
        SubscriptionPlan.is_active == True
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found or inactive",
        )

    # Calculate end date based on plan duration
    start_date = get_utc_now()
    end_date = start_date + timedelta(days=plan.duration_days)

    # Create new subscription
    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
        auto_renew=subscription_in.auto_renew,
    )

    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

@router.put("/subscriptions/{subscription_id}", response_model=SubscriptionSchema)
async def update_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    subscription_in: SubscriptionUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a subscription (e.g., cancel auto-renewal).
    """
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    update_data = subscription_in.model_dump(exclude_unset=True)

    # If changing plan, recalculate end date
    if "plan_id" in update_data:
        plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == update_data["plan_id"],
            SubscriptionPlan.is_active == True
        ).first()

        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="New subscription plan not found or inactive",
            )

        # Calculate new end date based on remaining time and new plan duration
        remaining_days = (subscription.end_date - get_utc_now()).days
        if remaining_days > 0:
            # Prorate the new subscription
            ratio = plan.duration_days / subscription.plan.duration_days
            new_remaining_days = int(remaining_days * ratio)
            update_data["end_date"] = get_utc_now() + timedelta(days=new_remaining_days)
        else:
            # Start fresh with the new plan
            update_data["start_date"] = get_utc_now()
            update_data["end_date"] = get_utc_now() + timedelta(days=plan.duration_days)

    for field, value in update_data.items():
        setattr(subscription, field, value)

    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

@router.get("/subscriptions/check-access", response_model=dict)
async def check_subscription_access(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Check if the current user has an active subscription for movie access.
    """
    # Admins always have access
    if current_user.is_superuser:
        return {"has_access": True, "message": "Admin access granted"}

    # Check for active subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True,
        Subscription.end_date > get_utc_now()
    ).first()

    if subscription:
        days_remaining = (subscription.end_date - get_utc_now()).days
        hours_remaining = int((subscription.end_date - get_utc_now()).total_seconds() // 3600)

        # For daily plans, show hours remaining instead of days
        time_remaining_msg = (
            f"{hours_remaining} hours" if subscription.plan.duration_days == 1
            else f"{days_remaining} days"
        )

        return {
            "has_access": True,
            "message": f"Access granted. Your {subscription.plan.name} subscription is active for {time_remaining_msg}.",
            "days_remaining": days_remaining,
            "hours_remaining": hours_remaining
        }

    return {
        "has_access": False,
        "message": "You need an active subscription to access this content."
    }

# Admin Subscription Management Endpoints
@router.get("/admin/subscriptions", response_model=List[SubscriptionSchema])
async def get_all_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
    skip: int = 0,
    limit: int = 100,
    status: str = None,
):
    """
    Get all subscriptions (admin only).
    Filter by status if provided (active, expired, all).
    """
    query = db.query(Subscription)

    if status == "active":
        query = query.filter(
            Subscription.is_active == True,
            Subscription.end_date > get_utc_now()
        )
    elif status == "expired":
        query = query.filter(
            (Subscription.is_active == False) |
            (Subscription.end_date <= get_utc_now())
        )

    # Order by most recent first
    subscriptions = query.order_by(Subscription.created_at.desc()).offset(skip).limit(limit).all()

    return subscriptions

@router.get("/admin/subscriptions/{subscription_id}", response_model=SubscriptionSchema)
async def get_subscription_by_id(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Get a specific subscription by ID (admin only).
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    return subscription

@router.put("/admin/subscriptions/{subscription_id}/extend", response_model=SubscriptionSchema)
async def extend_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    days: int,
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Extend a subscription by a specified number of days (admin only).
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    # If subscription is expired, extend from current date
    if subscription.end_date < get_utc_now():
        subscription.end_date = get_utc_now() + timedelta(days=days)
    else:
        # Otherwise extend from current end date
        subscription.end_date = subscription.end_date + timedelta(days=days)

    # Ensure subscription is active
    subscription.is_active = True

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return subscription

@router.put("/admin/subscriptions/{subscription_id}/cancel", response_model=SubscriptionSchema)
async def cancel_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Cancel a subscription (admin only).
    """
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    subscription.is_active = False
    subscription.auto_renew = False

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return subscription
