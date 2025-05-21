import boto3
from typing import List, Dict, Any
from app.core.config import settings

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
    if not settings.EMAILS_ENABLED:
        return {"status": "emails_disabled"}
    
    if text_content is None:
        # Simple text version of the HTML content
        text_content = html_content.replace("<br>", "\n").replace("<p>", "").replace("</p>", "\n")
    
    try:
        response = ses_client.send_email(
            Source=f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>",
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
        return {"status": "success", "message_id": response['MessageId']}
    except Exception as e:
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
