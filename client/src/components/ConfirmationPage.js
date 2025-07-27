import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const ConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const bookingData = await bookingAPI.getBooking(bookingId);
      setBooking(bookingData);
      
      // Check if payment is actually confirmed
      if (bookingData.payment_status !== 'paid') {
        toast.error('Payment not confirmed');
        navigate(`/payment/${bookingId}`);
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-500"></div>
            <span className="ml-3 text-lg text-gray-600">Loading confirmation...</span>
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
          <p className="text-gray-600 mb-6">The booking confirmation you're looking for doesn't exist.</p>
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
      {/* Success Message */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">Booking Confirmed!</h3>
            <div className="mt-1 text-sm text-green-700">
              <p>Your golf bay has been successfully booked and payment confirmed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Confirmation</h2>
        
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
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Payment Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Paid
            </span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900">Total Paid:</span>
            <span className="text-3xl font-bold text-green-600">KES {booking.total_cost.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-golf-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-golf-600 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/book')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Make Another Booking
          </button>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Please arrive 15 minutes before your booking time</li>
                <li>Bring a valid ID for verification</li>
                <li>Golf equipment is available for rent at the facility</li>
                <li>A confirmation email has been sent to {booking.customer_email}</li>
                <li>For cancellations, contact us at least 24 hours in advance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-golf-500 mb-2">📞</div>
            <div className="font-medium">Phone</div>
            <div className="text-sm text-gray-600">+254 123 456 789</div>
          </div>
          <div>
            <div className="text-golf-500 mb-2">✉️</div>
            <div className="font-medium">Email</div>
            <div className="text-sm text-gray-600">support@golfbay.com</div>
          </div>
          <div>
            <div className="text-golf-500 mb-2">🕒</div>
            <div className="font-medium">Hours</div>
            <div className="text-sm text-gray-600">9 AM - 6 PM Daily</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;