import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

// Step components
import BaySelection from './steps/BaySelection';
import TimeSelection from './steps/TimeSelection';
import CustomerDetails from './steps/CustomerDetails';
import BookingSummary from './steps/BookingSummary';
import ProgressBar from './ProgressBar';

const BookingWizard = () => {
  const { state, actions, helpers } = useBooking();
  const navigate = useNavigate();

  // Reset booking state when component mounts
  useEffect(() => {
    actions.resetBooking();
  }, []);

  // Handle navigation between steps
  const handleNext = () => {
    if (helpers.canProceedToNext()) {
      if (state.currentStep === 4 && state.bookingId) {
        // Navigate to payment page after booking is created
        navigate(`/payment/${state.bookingId}`);
      } else {
        actions.nextStep();
      }
    }
  };

  const handlePrevious = () => {
    actions.prevStep();
  };

  // Render the current step component
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BaySelection />;
      case 2:
        return <TimeSelection />;
      case 3:
        return <CustomerDetails />;
      case 4:
        return <BookingSummary onNext={handleNext} />;
      default:
        return <BaySelection />;
    }
  };

  const stepTitles = [
    'Choose Your Bay',
    'Select Date & Time',
    'Enter Your Details',
    'Confirm Booking'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <ProgressBar 
        currentStep={state.currentStep}
        totalSteps={4}
        titles={stepTitles}
      />

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {stepTitles[state.currentStep - 1]}
          </h2>
          <div className="w-24 h-1 bg-golf-500 rounded"></div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-500"></div>
            <span className="ml-3 text-lg text-gray-600">Loading...</span>
          </div>
        )}

        {/* Step Content */}
        {!state.loading && renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      {!state.loading && (
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={state.currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              state.currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            Previous
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Step {state.currentStep} of 4
            </span>
            
            {state.currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!helpers.canProceedToNext()}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  helpers.canProceedToNext()
                    ? 'bg-golf-500 text-white hover:bg-golf-600 hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : state.bookingId ? (
              <button
                onClick={handleNext}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Proceed to Payment
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Booking Summary Sidebar (visible on steps 2-4) */}
      {state.currentStep > 1 && !state.loading && (
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          
          <div className="space-y-3">
            {state.bookingType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bay Type:</span>
                <span className="font-medium">
                  {state.bookingType === 'coaching' ? 'Coaching + Bay' : 'Bay Only'}
                </span>
              </div>
            )}
            
            {state.selectedBay && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bay Number:</span>
                <span className="font-medium">Bay {state.selectedBay.number}</span>
              </div>
            )}
            
            {state.players && (
              <div className="flex justify-between">
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">{state.players}</span>
              </div>
            )}
            
            {state.selectedDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(state.selectedDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {state.selectedTimeSlots.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{helpers.formatTimeSlots()}</span>
              </div>
            )}
            
            {state.selectedTimeSlots.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{helpers.getDuration()} hour{helpers.getDuration() > 1 ? 's' : ''}</span>
              </div>
            )}
            
            {helpers.calculateTotalCost() > 0 && (
              <>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost:</span>
                    <span className="text-golf-500">KES {helpers.calculateTotalCost().toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWizard;