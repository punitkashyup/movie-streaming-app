import razorpay
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class RazorpayService:
    def __init__(self):
        """Initialize Razorpay client with API keys from settings"""
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
    
    def create_order(self, amount: float, currency: str = "INR", receipt: Optional[str] = None, notes: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Create a new Razorpay order
        
        Args:
            amount: Amount in rupees (will be converted to paise)
            currency: Currency code (default: INR)
            receipt: Receipt ID for your reference
            notes: Additional notes for the order
            
        Returns:
            Dict containing order details
        """
        try:
            # Convert amount to paise (Razorpay uses smallest currency unit)
            amount_in_paise = int(amount * 100)
            
            # Create order
            order_data = {
                "amount": amount_in_paise,
                "currency": currency,
            }
            
            if receipt:
                order_data["receipt"] = receipt
                
            if notes:
                order_data["notes"] = notes
                
            order = self.client.order.create(data=order_data)
            
            # Add key_id to response for frontend
            order["key"] = self.key_id
            
            return order
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {str(e)}")
            raise
    
    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verify the payment signature to ensure it's not tampered
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            Boolean indicating if signature is valid
        """
        try:
            # Generate signature
            key = f"{razorpay_order_id}|{razorpay_payment_id}"
            generated_signature = hmac.new(
                self.key_secret.encode(),
                key.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(generated_signature, razorpay_signature)
        except Exception as e:
            logger.error(f"Error verifying payment signature: {str(e)}")
            return False
    
    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Get payment details from Razorpay
        
        Args:
            payment_id: Payment ID from Razorpay
            
        Returns:
            Dict containing payment details
        """
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            logger.error(f"Error fetching payment details: {str(e)}")
            raise
    
    def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Refund a payment
        
        Args:
            payment_id: Payment ID from Razorpay
            amount: Amount to refund in rupees (will be converted to paise)
            
        Returns:
            Dict containing refund details
        """
        try:
            refund_data = {}
            
            if amount:
                # Convert amount to paise
                refund_data["amount"] = int(amount * 100)
                
            return self.client.payment.refund(payment_id, refund_data)
        except Exception as e:
            logger.error(f"Error refunding payment: {str(e)}")
            raise

# Create a singleton instance
razorpay_service = RazorpayService()
