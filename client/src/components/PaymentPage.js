import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (booking && booking.expires_at && timeLeft > 0) {
      interval = setInterval(() => {
        const now = moment();
        const expires = moment(booking.expires_at);
        const secondsLeft = expires.diff(now, 'seconds');
        
        if (secondsLeft <= 0) {
          setTimeLeft(0);
          toast.error('Booking has expired');
          navigate('/book');
        } else {
          setTimeLeft(secondsLeft);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [booking, timeLeft, navigate]);

  const loadBookingDetails = async () => {
    try {
      const bookingData = await bookingAPI.getBooking(bookingId);
      setBooking(bookingData);
      
      // Calculate time left
      if (bookingData.expires_at) {
        const now = moment();
        const expires = moment(bookingData.expires_at);
        const secondsLeft = expires.diff(now, 'seconds');
        setTimeLeft(Math.max(0, secondsLeft));
        
        if (secondsLeft <= 0) {
          toast.error('Booking has expired');
          navigate('/book');
          return;
        }
      }
      
      // Check if already paid
      if (bookingData.payment_status === 'paid') {
        navigate(`/confirmation/${bookingId}`);
        return;
      }
      
    } catch (error) {
      const apiError = handleAPIError(error);
      toast.error(apiError.message);
      navigate('/book');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    setPaymentLoading(true);
    try {
      const paymentData = await paymentAPI.initiatePayment(bookingId);
      
      if (paymentData.paymentUrl) {
        // Redirect to PesaPal
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      const apiError = handleAPIError(error);
      toast.error(apiError.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-500"></div>
            <span className="ml-3 text-lg text-gray-600">Loading booking details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => navigate('/book')}
            className="btn-primary"
          >
            Make New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Warning */}
      {timeLeft > 0 && (
        <div className={`rounded-lg p-4 ${timeLeft < 300 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${timeLeft < 300 ? 'text-red-400' : 'text-yellow-400'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${timeLeft < 300 ? 'text-red-800' : 'text-yellow-800'}`}>
                {timeLeft < 300 ? 'Payment Expires Soon!' : 'Complete Payment'}
              </h3>
              <div className={`mt-1 text-sm ${timeLeft < 300 ? 'text-red-700' : 'text-yellow-700'}`}>
                <p>Time remaining: <span className="font-bold">{formatTime(timeLeft)}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-medium font-mono text-sm">{booking.id}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Bay:</span>
            <span className="font-medium">
              Bay {booking.bay_number} ({booking.booking_type === 'coaching_bay' ? 'Coaching + Bay' : 'Bay Only'})
            </span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{moment(booking.booking_date).format('dddd, MMMM Do YYYY')}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">
              {moment(booking.start_time, 'HH:mm').format('h:mm A')} - {moment(booking.end_time, 'HH:mm').format('h:mm A')}
            </span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">
              {moment.duration(moment(booking.end_time, 'HH:mm').diff(moment(booking.start_time, 'HH:mm'))).asHours()} hour(s)
            </span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Players:</span>
            <span className="font-medium">{booking.players}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Customer:</span>
            <div className="text-right">
              <div className="font-medium">{booking.customer_name}</div>
              <div className="text-sm text-gray-500">{booking.customer_email}</div>
              <div className="text-sm text-gray-500">{booking.customer_phone}</div>
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-golf-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900">Total Amount:</span>
            <span className="text-3xl font-bold text-golf-500">KES {booking.total_cost.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Button */}
        <div className="text-center">
          <button
            onClick={handlePayNow}
            disabled={paymentLoading || timeLeft === 0}
            className={`w-full py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 ${
              paymentLoading || timeLeft === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-golf-500 text-white hover:bg-golf-600 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {paymentLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Processing...
              </div>
            ) : timeLeft === 0 ? (
              'Booking Expired'
            ) : (
              'Pay Now with PesaPal'
            )}
          </button>
        </div>

        {/* Payment Methods Info */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm mb-2">Secure payment powered by PesaPal</p>
          <div className="flex justify-center space-x-4 text-xs">
            <span>✓ M-Pesa</span>
            <span>✓ Airtel Money</span>
            <span>✓ Credit/Debit Cards</span>
            <span>✓ Bank Transfer</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Payment Instructions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Click "Pay Now" to be redirected to PesaPal's secure payment gateway</li>
                <li>Choose your preferred payment method (M-Pesa, cards, etc.)</li>
                <li>Complete the payment process as instructed</li>
                <li>You'll receive an email confirmation once payment is successful</li>
                <li>This booking will expire in {formatTime(timeLeft)} if payment is not completed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;