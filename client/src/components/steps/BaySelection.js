import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { bookingAPI, handleAPIError } from '../../services/api';
import toast from 'react-hot-toast';

const BaySelection = () => {
  const { state, actions } = useBooking();
  const [bays, setBays] = useState([]);
  const [loadingBays, setLoadingBays] = useState(false);

  // Load bays when booking type changes
  useEffect(() => {
    if (state.bookingType) {
      loadBays(state.bookingType);
    }
  }, [state.bookingType]);

  const loadBays = async (type) => {
    setLoadingBays(true);
    try {
      const baysData = await bookingAPI.getBaysByType(type);
      setBays(baysData);
    } catch (error) {
      const apiError = handleAPIError(error);
      toast.error(apiError.message);
      actions.setError(apiError.message);
    } finally {
      setLoadingBays(false);
    }
  };

  const handleBookingTypeChange = (type) => {
    actions.setBookingType(type);
    setBays([]);
    actions.setSelectedBay(null);
  };

  const handleBaySelection = (bay) => {
    actions.setSelectedBay(bay);
  };

  const handlePlayersChange = (count) => {
    actions.setPlayers(count);
  };

  const bookingTypes = [
    {
      id: 'bay_only',
      title: 'Bay Only',
      price: '2000 KES/hour',
      description: 'Practice driving range with ball dispensing system',
      features: ['Practice driving range', 'Ball dispensing system', 'Distance markers', 'Up to 8 players'],
      bays: 'Bays 1-10',
      color: 'border-blue-500 bg-blue-50'
    },
    {
      id: 'coaching',
      title: 'Coaching + Bay',
      price: '3000 KES/hour',
      description: 'Professional coaching with practice bay access',
      features: ['Professional golf instructor', 'Personalized coaching', 'Swing analysis', 'Practice bay included', 'Up to 8 players'],
      bays: 'Bays 11-12',
      color: 'border-golf-500 bg-golf-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Booking Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Experience</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {bookingTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleBookingTypeChange(type.id)}
              className={`bay-card ${
                state.bookingType === type.id
                  ? 'selected'
                  : 'available'
              } ${type.color}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{type.title}</h4>
                  <p className="text-gray-600 text-sm">{type.bays}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-golf-500">{type.price}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{type.description}</p>
              
              <ul className="space-y-2">
                {type.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-golf-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Number of Players */}
      {state.bookingType && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Number of Players</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((count) => (
              <button
                key={count}
                onClick={() => handlePlayersChange(count)}
                className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${
                  state.players === count
                    ? 'border-golf-500 bg-golf-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-golf-300 hover:bg-golf-50'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bay Selection */}
      {state.bookingType && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Select Your Bay
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({state.bookingType === 'coaching' ? 'Coaching bays with instructor' : 'Practice bays'})
            </span>
          </h3>
          
          {loadingBays ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golf-500"></div>
              <span className="ml-3 text-gray-600">Loading available bays...</span>
            </div>
          ) : bays.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {bays.map((bay) => (
                <button
                  key={bay.number}
                  onClick={() => handleBaySelection(bay)}
                  className={`bay-card p-4 text-center ${
                    state.selectedBay?.number === bay.number
                      ? 'selected'
                      : 'available'
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    Bay {bay.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bay.hourly_rate.toLocaleString()} KES/hr
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2a2 2 0 00-2 2v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3a2 2 0 00-2-2H4" />
                </svg>
              </div>
              <p className="text-gray-500">No bays available for selected type</p>
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {state.bookingType && state.selectedBay && state.players && (
        <div className="bg-golf-50 rounded-lg p-6 border border-golf-200">
          <h4 className="font-semibold text-golf-800 mb-4">Selection Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Bay Type:</span>
              <span className="font-medium">
                {state.bookingType === 'coaching' ? 'Coaching + Bay' : 'Bay Only'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Bay Number:</span>
              <span className="font-medium">Bay {state.selectedBay.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Players:</span>
              <span className="font-medium">{state.players}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Rate:</span>
              <span className="font-medium">{state.selectedBay.hourly_rate.toLocaleString()} KES/hour</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Getting Started</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Choose between practice-only bays or coaching sessions</li>
                <li>Select the number of players (maximum 8 per bay)</li>
                <li>Pick your preferred bay from the available options</li>
                <li>Click "Next" to proceed to date and time selection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaySelection;