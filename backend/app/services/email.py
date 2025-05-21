import boto3
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Jinja2 environment for email templates
templates_dir = Path(__file__).parent.parent / "templates" / "email"
env = Environment(loader=FileSystemLoader(templates_dir))

ses_client = boto3.client(
    'ses',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def send_email(
    email_to: str,
    subject: str,
    html_content: str,
    text_content: str = None
) -> Dict[str, Any]:
    """
    Send an email using AWS SES
    """
    logger.info(f"Attempting to send email to {email_to} with subject: {subject}")

    if not settings.EMAILS_ENABLED:
        logger.warning("Emails are disabled in settings. Email not sent.")
        return {"status": "emails_disabled"}

    if text_content is None:
        # Simple text version of the HTML content
        text_content = html_content.replace("<br>", "\n").replace("<p>", "").replace("</p>", "\n")

    # Log email settings
    logger.info(f"Email settings: FROM_EMAIL={settings.EMAILS_FROM_EMAIL}, FROM_NAME={settings.EMAILS_FROM_NAME}")
    logger.info(f"AWS Region: {settings.AWS_REGION}")

    try:
        source_email = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        logger.info(f"Source email: {source_email}")

        # Check if the sender email is verified in SES
        identities = ses_client.list_identities()
        logger.info(f"Verified identities: {identities['Identities']}")

        if settings.EMAILS_FROM_EMAIL not in identities['Identities']:
            logger.error(f"Sender email {settings.EMAILS_FROM_EMAIL} is not verified in SES")
            return {"status": "error", "error": "Sender email not verified in SES"}

        response = ses_client.send_email(
            Source=source_email,
            Destination={
                'ToAddresses': [email_to],
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': text_content,
                        'Charset': 'UTF-8'
                    },
                    'Html': {
                        'Data': html_content,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )
        logger.info(f"Email sent successfully. Message ID: {response['MessageId']}")
        return {"status": "success", "message_id": response['MessageId']}
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}", exc_info=True)
        return {"status": "error", "error": str(e)}

def send_welcome_email(email: str, username: str) -> Dict[str, Any]:
    """
    Send a welcome email to a new user
    """
    subject = f"Welcome to Movie Streaming App, {username}!"
    html_content = f"""
    <h1>Welcome to Movie Streaming App!</h1>
    <p>Hi {username},</p>
    <p>Thank you for joining our movie streaming platform. We're excited to have you on board!</p>
    <p>With your new account, you can:</p>
    <ul>
        <li>Stream thousands of movies</li>
        <li>Create your own watchlist</li>
        <li>Get personalized recommendations</li>
    </ul>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Happy streaming!</p>
    <p>The Movie Streaming App Team</p>
    """

    return send_email(email_to=email, subject=subject, html_content=html_content)

def send_password_reset_email(email: str, username: str, reset_token: str) -> Dict[str, Any]:
    """
    Send a password reset email
    """
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    subject = "Password Reset Request"
    html_content = f"""
    <h1>Password Reset Request</h1>
    <p>Hi {username},</p>
    <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
    <p>To reset your password, click the link below:</p>
    <p><a href="{reset_link}">Reset Password</a></p>
    <p>This link will expire in 30 minutes.</p>
    <p>The Movie Streaming App Team</p>
    """

    return send_email(email_to=email, subject=subject, html_content=html_content)

def send_payment_success_email(email: str, payment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a payment success email

    Args:
        email: User's email address
        payment_data: Dictionary containing payment details
    """
    subject = "Payment Successful - Your Subscription is Active"

    # Format the payment amount with ₹ symbol
    if 'amount' in payment_data and not isinstance(payment_data['amount'], str):
        payment_data['amount'] = f"₹{payment_data['amount']:,.2f}"

    # Format the payment date
    if 'payment_date' in payment_data:
        if isinstance(payment_data['payment_date'], datetime):
            payment_data['payment_date'] = payment_data['payment_date'].strftime("%Y-%m-%d %H:%M:%S")
    else:
        payment_data['payment_date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Add support email
    payment_data['support_email'] = settings.EMAILS_FROM_EMAIL

    try:
        # Render template
        template = env.get_template("payment_success.html")
        html_content = template.render(**payment_data)

        return send_email(email_to=email, subject=subject, html_content=html_content)
    except Exception as e:
        # Fallback to simple email if template rendering fails
        html_content = f"""
        <h1>Payment Successful!</h1>
        <p>Hi {payment_data.get('user_name', 'User')},</p>
        <p>Thank you for your payment. Your subscription is now active!</p>
        <p>Transaction ID: {payment_data.get('transaction_id', '')}</p>
        <p>Amount: {payment_data.get('amount', '')}</p>
        <p>Happy streaming!</p>
        <p>The Movie Streaming App Team</p>
        """

        return send_email(email_to=email, subject=subject, html_content=html_content)

def send_payment_failure_email(email: str, payment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a payment failure email

    Args:
        email: User's email address
        payment_data: Dictionary containing payment details and error information
    """
    subject = "Payment Failed - Action Required"

    # Format the payment amount with ₹ symbol
    if 'amount' in payment_data and not isinstance(payment_data['amount'], str):
        payment_data['amount'] = f"₹{payment_data['amount']:,.2f}"

    # Add support email
    payment_data['support_email'] = settings.EMAILS_FROM_EMAIL

    try:
        # Render template
        template = env.get_template("payment_failure.html")
        html_content = template.render(**payment_data)

        return send_email(email_to=email, subject=subject, html_content=html_content)
    except Exception as e:
        # Fallback to simple email if template rendering fails
        html_content = f"""
        <h1>Payment Failed</h1>
        <p>Hi {payment_data.get('user_name', 'User')},</p>
        <p>We're sorry, but your recent payment for the {payment_data.get('plan_name', '')} subscription plan could not be processed.</p>
        <p>Error: {payment_data.get('error_message', 'Unknown error')}</p>
        <p>Please try again with a different payment method or contact our support team for assistance.</p>
        <p>The Movie Streaming App Team</p>
        """

        return send_email(email_to=email, subject=subject, html_content=html_content)

def send_subscription_renewal_reminder(email: str, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a subscription renewal reminder email

    Args:
        email: User's email address
        subscription_data: Dictionary containing subscription details
    """
    subject = "Your Subscription Will Renew Soon"

    # Format the payment amount with ₹ symbol
    if 'amount' in subscription_data and not isinstance(subscription_data['amount'], str):
        subscription_data['amount'] = f"₹{subscription_data['amount']:,.2f}"

    # Format the renewal date
    if 'renewal_date' in subscription_data:
        if isinstance(subscription_data['renewal_date'], datetime):
            subscription_data['renewal_date'] = subscription_data['renewal_date'].strftime("%Y-%m-%d")
    else:
        subscription_data['renewal_date'] = "upcoming"

    # Add support email
    subscription_data['support_email'] = settings.EMAILS_FROM_EMAIL

    try:
        # Render template
        template = env.get_template("subscription_renewal.html")
        html_content = template.render(**subscription_data)

        return send_email(email_to=email, subject=subject, html_content=html_content)
    except Exception as e:
        # Fallback to simple email if template rendering fails
        html_content = f"""
        <h1>Subscription Renewal Reminder</h1>
        <p>Hi {subscription_data.get('user_name', 'User')},</p>
        <p>This is a friendly reminder that your {subscription_data.get('plan_name', '')} subscription will renew automatically on {subscription_data.get('renewal_date', 'upcoming')}.</p>
        <p>Amount: {subscription_data.get('amount', '')}</p>
        <p>If you wish to cancel or change your subscription, please visit your account settings before the renewal date.</p>
        <p>Thank you for being a valued subscriber!</p>
        <p>The Movie Streaming App Team</p>
        """

        return send_email(email_to=email, subject=subject, html_content=html_content)
