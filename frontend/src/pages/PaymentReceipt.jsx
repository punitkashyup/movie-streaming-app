import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import { formatDateTime, formatIndianRupees } from '../utils/dateUtils';
import '../styles/payment.css';

const PaymentReceipt = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipt();
  }, [paymentId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await paymentService.getPaymentReceipt(paymentId);
      setReceipt(response.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError('Failed to load receipt. Please try again later.');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <div class="print-receipt">
        <style>
          .print-receipt {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #000;
            background-color: #fff;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .receipt-header h1 {
            margin-bottom: 5px;
            color: #000;
          }
          .receipt-header p {
            color: #333;
          }
          .receipt-details {
            margin-bottom: 30px;
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #e5e7eb;
          }
          .detail-row {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            flex: 1;
            font-weight: bold;
            color: #4b5563;
          }
          .detail-value {
            flex: 2;
            color: #000;
          }
          .receipt-footer {
            margin-top: 50px;
            text-align: center;
            font-size: 14px;
            color: #4b5563;
          }
        </style>
        ${printContent}
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just use the print functionality
    handlePrint();
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="payment-page">
      <div className="receipt-container">
        <div className="receipt-actions">
          <button
            onClick={() => navigate('/profile')}
            className="btn-back"
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>

          <div className="receipt-buttons">
            <button
              onClick={handlePrint}
              className="btn-print"
            >
              <i className="fas fa-print"></i> Print
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn-download"
            >
              <i className="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>

        <div className="receipt-content" ref={receiptRef}>
          <div className="receipt-header">
            <h1>Payment Receipt</h1>
            <p>Movie Streaming App</p>
          </div>

          <div className="receipt-details">
            <div className="detail-row">
              <div className="detail-label">Transaction ID:</div>
              <div className="detail-value">{receipt.transaction_id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Date:</div>
              <div className="detail-value">{formatDateTime(receipt.payment_date)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Customer:</div>
              <div className="detail-value">{receipt.user_name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email:</div>
              <div className="detail-value">{receipt.user_email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Plan:</div>
              <div className="detail-value">{receipt.subscription_plan || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Duration:</div>
              <div className="detail-value">{receipt.subscription_duration || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Payment Method:</div>
              <div className="detail-value">{receipt.payment_method}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Amount:</div>
              <div className="detail-value">{formatIndianRupees(receipt.amount)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <div className="detail-value">{receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}</div>
            </div>
          </div>

          <div className="receipt-footer">
            <p>Thank you for your business!</p>
            <p>For any questions, please contact support@movieapp.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
