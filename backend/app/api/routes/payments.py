from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.utils import get_utc_now
from app.models.payment import Payment
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.user import User
from app.schemas.payment import (
    Payment as PaymentSchema,
    PaymentCreate,
    PaymentUpdate,
    PaymentVerification,
    RazorpayOrderResponse,
    PaymentReceipt
)
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.services.razorpay import razorpay_service
from app.services.email import send_payment_success_email, send_payment_failure_email

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/payments/create-order", response_model=RazorpayOrderResponse)
async def create_payment_order(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new Razorpay order for subscription payment
    """
    # Get subscription details
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # Get subscription plan details
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == subscription.plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )

    # Create a new payment record
    payment = Payment(
        user_id=current_user.id,
        subscription_id=subscription.id,
        amount=plan.price,
        currency="INR",
        status="pending"
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Create Razorpay order
    receipt = f"receipt_{payment.id}"
    notes = {
        "subscription_id": str(subscription.id),
        "plan_name": plan.name,
        "user_email": current_user.email
    }

    try:
        order = razorpay_service.create_order(
            amount=plan.price,
            currency="INR",
            receipt=receipt,
            notes=notes
        )

        # Update payment with order ID
        payment.razorpay_order_id = order["id"]
        db.commit()

        return {
            "order_id": order["id"],
            "currency": order["currency"],
            "amount": order["amount"] / 100,  # Convert from paise to rupees
            "key": order["key"]
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

@router.post("/payments/verify", response_model=PaymentSchema)
async def verify_payment(
    payment_data: PaymentVerification,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Verify payment signature and update payment status
    """
    # Find payment by order ID
    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == payment_data.razorpay_order_id,
        Payment.user_id == current_user.id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Verify payment signature
    is_valid = razorpay_service.verify_payment_signature(
        payment_data.razorpay_order_id,
        payment_data.razorpay_payment_id,
        payment_data.razorpay_signature
    )

    if not is_valid:
        payment.status = "failed"
        db.commit()

        # Send payment failure email in background
        background_tasks.add_task(
            send_payment_failure_email,
            current_user.email,
            {
                "user_name": current_user.username,
                "amount": payment.amount,
                "plan_name": payment.subscription.plan.name if payment.subscription else "",
                "error_message": "Payment signature verification failed"
            }
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )

    # Update payment details
    payment.razorpay_payment_id = payment_data.razorpay_payment_id
    payment.razorpay_signature = payment_data.razorpay_signature
    payment.status = "successful"
    payment.updated_at = get_utc_now()

    # Get payment details from Razorpay
    try:
        payment_details = razorpay_service.get_payment_details(payment_data.razorpay_payment_id)
        payment.payment_method = payment_details.get("method", "")
        payment.payment_data = payment_details
    except Exception as e:
        # Continue even if we can't get payment details
        pass

    # Update subscription status
    if payment.subscription_id:
        subscription = db.query(Subscription).filter(
            Subscription.id == payment.subscription_id
        ).first()

        if subscription:
            subscription.payment_status = "paid"
            subscription.is_active = True

    db.commit()
    db.refresh(payment)

    # Send payment success email in background
    if payment.subscription and payment.subscription.plan:
        logger.info(f"Preparing to send payment success email to {current_user.email}")

        email_data = {
            "user_name": current_user.username,
            "amount": payment.amount,
            "currency": payment.currency,
            "plan_name": payment.subscription.plan.name,
            "transaction_id": payment.razorpay_payment_id,
            "payment_date": payment.updated_at
        }

        logger.info(f"Email data: {email_data}")

        # Try sending email directly instead of in background for debugging
        try:
            email_result = send_payment_success_email(current_user.email, email_data)
            logger.info(f"Email send result: {email_result}")
        except Exception as e:
            logger.error(f"Error sending email directly: {str(e)}", exc_info=True)

        # Also queue it in background tasks as a backup
        background_tasks.add_task(
            send_payment_success_email,
            current_user.email,
            email_data
        )

    return payment

@router.get("/payments/my", response_model=List[PaymentSchema])
async def get_my_payments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's payment history
    """
    query = db.query(Payment).filter(Payment.user_id == current_user.id)

    if status:
        query = query.filter(Payment.status == status)

    payments = query.order_by(desc(Payment.created_at)).offset(skip).limit(limit).all()

    return payments

@router.get("/payments/{payment_id}/receipt", response_model=PaymentReceipt)
async def get_payment_receipt(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get receipt for a specific payment
    """
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id,
        Payment.status == "successful"
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found or not successful"
        )

    # Get subscription and plan details
    subscription_plan = None
    subscription_duration = None

    if payment.subscription_id:
        subscription = db.query(Subscription).filter(
            Subscription.id == payment.subscription_id
        ).first()

        if subscription and subscription.plan:
            subscription_plan = subscription.plan.name
            subscription_duration = f"{subscription.plan.duration_days} days"

    return {
        "id": payment.id,
        "transaction_id": payment.razorpay_payment_id,
        "payment_date": payment.created_at,
        "amount": payment.amount,
        "currency": payment.currency,
        "payment_method": payment.payment_method or "Online",
        "subscription_plan": subscription_plan,
        "subscription_duration": subscription_duration,
        "user_name": current_user.username,
        "user_email": current_user.email,
        "status": payment.status
    }

@router.get("/admin/payments", response_model=List[PaymentSchema])
async def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """
    Get all payments (admin only)
    """
    query = db.query(Payment)

    if status:
        query = query.filter(Payment.status == status)

    if user_id:
        query = query.filter(Payment.user_id == user_id)

    payments = query.order_by(desc(Payment.created_at)).offset(skip).limit(limit).all()

    return payments
