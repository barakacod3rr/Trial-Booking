import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  bookingType: null, // 'bay_only' or 'coaching'
  selectedBay: null,
  players: 1,
  selectedDate: null,
  selectedTimeSlots: [],
  customerDetails: {
    name: '',
    email: '',
    phone: ''
  },
  currentStep: 1,
  totalCost: 0,
  bookingId: null,
  paymentTimer: null,
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  SET_BOOKING_TYPE: 'SET_BOOKING_TYPE',
  SET_SELECTED_BAY: 'SET_SELECTED_BAY',
  SET_PLAYERS: 'SET_PLAYERS',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_SELECTED_TIME_SLOTS: 'SET_SELECTED_TIME_SLOTS',
  ADD_TIME_SLOT: 'ADD_TIME_SLOT',
  REMOVE_TIME_SLOT: 'REMOVE_TIME_SLOT',
  SET_CUSTOMER_DETAILS: 'SET_CUSTOMER_DETAILS',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_TOTAL_COST: 'SET_TOTAL_COST',
  SET_BOOKING_ID: 'SET_BOOKING_ID',
  SET_PAYMENT_TIMER: 'SET_PAYMENT_TIMER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_BOOKING: 'RESET_BOOKING',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP'
};

// Reducer
const bookingReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_BOOKING_TYPE:
      return {
        ...state,
        bookingType: action.payload,
        selectedBay: null, // Reset bay when type changes
        selectedTimeSlots: [] // Reset time slots
      };
    
    case ACTIONS.SET_SELECTED_BAY:
      return {
        ...state,
        selectedBay: action.payload
      };
    
    case ACTIONS.SET_PLAYERS:
      return {
        ...state,
        players: action.payload
      };
    
    case ACTIONS.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload,
        selectedTimeSlots: [] // Reset time slots when date changes
      };
    
    case ACTIONS.SET_SELECTED_TIME_SLOTS:
      return {
        ...state,
        selectedTimeSlots: action.payload
      };
    
    case ACTIONS.ADD_TIME_SLOT:
      return {
        ...state,
        selectedTimeSlots: [...state.selectedTimeSlots, action.payload].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        )
      };
    
    case ACTIONS.REMOVE_TIME_SLOT:
      return {
        ...state,
        selectedTimeSlots: state.selectedTimeSlots.filter(slot => 
          slot.startTime !== action.payload.startTime
        )
      };
    
    case ACTIONS.SET_CUSTOMER_DETAILS:
      return {
        ...state,
        customerDetails: {
          ...state.customerDetails,
          ...action.payload
        }
      };
    
    case ACTIONS.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
    
    case ACTIONS.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 4)
      };
    
    case ACTIONS.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };
    
    case ACTIONS.SET_TOTAL_COST:
      return {
        ...state,
        totalCost: action.payload
      };
    
    case ACTIONS.SET_BOOKING_ID:
      return {
        ...state,
        bookingId: action.payload
      };
    
    case ACTIONS.SET_PAYMENT_TIMER:
      return {
        ...state,
        paymentTimer: action.payload
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ACTIONS.RESET_BOOKING:
      return {
        ...initialState
      };
    
    default:
      return state;
  }
};

// Context
const BookingContext = createContext();

// Provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Action creators
  const actions = {
    setBookingType: (type) => dispatch({ type: ACTIONS.SET_BOOKING_TYPE, payload: type }),
    setSelectedBay: (bay) => dispatch({ type: ACTIONS.SET_SELECTED_BAY, payload: bay }),
    setPlayers: (count) => dispatch({ type: ACTIONS.SET_PLAYERS, payload: count }),
    setSelectedDate: (date) => dispatch({ type: ACTIONS.SET_SELECTED_DATE, payload: date }),
    setSelectedTimeSlots: (slots) => dispatch({ type: ACTIONS.SET_SELECTED_TIME_SLOTS, payload: slots }),
    addTimeSlot: (slot) => dispatch({ type: ACTIONS.ADD_TIME_SLOT, payload: slot }),
    removeTimeSlot: (slot) => dispatch({ type: ACTIONS.REMOVE_TIME_SLOT, payload: slot }),
    setCustomerDetails: (details) => dispatch({ type: ACTIONS.SET_CUSTOMER_DETAILS, payload: details }),
    setCurrentStep: (step) => dispatch({ type: ACTIONS.SET_CURRENT_STEP, payload: step }),
    nextStep: () => dispatch({ type: ACTIONS.NEXT_STEP }),
    prevStep: () => dispatch({ type: ACTIONS.PREV_STEP }),
    setTotalCost: (cost) => dispatch({ type: ACTIONS.SET_TOTAL_COST, payload: cost }),
    setBookingId: (id) => dispatch({ type: ACTIONS.SET_BOOKING_ID, payload: id }),
    setPaymentTimer: (timer) => dispatch({ type: ACTIONS.SET_PAYMENT_TIMER, payload: timer }),
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    resetBooking: () => dispatch({ type: ACTIONS.RESET_BOOKING })
  };

  // Helper functions
  const helpers = {
    isStepComplete: (step) => {
      switch (step) {
        case 1:
          return state.bookingType && state.selectedBay && state.players;
        case 2:
          return state.selectedDate && state.selectedTimeSlots.length >= 2;
        case 3:
          return state.customerDetails.name && 
                 state.customerDetails.email && 
                 state.customerDetails.phone;
        case 4:
          return state.bookingId;
        default:
          return false;
      }
    },

    canProceedToNext: () => {
      return helpers.isStepComplete(state.currentStep);
    },

    calculateTotalCost: () => {
      if (!state.selectedBay || !state.selectedTimeSlots.length) return 0;
      
      const hours = state.selectedTimeSlots.length * 0.5; // Each slot is 30 minutes
      return state.selectedBay.hourly_rate * hours;
    },

    getBookingSummary: () => {
      return {
        bookingType: state.bookingType,
        bay: state.selectedBay,
        players: state.players,
        date: state.selectedDate,
        timeSlots: state.selectedTimeSlots,
        customerDetails: state.customerDetails,
        totalCost: helpers.calculateTotalCost()
      };
    },

    formatTimeSlots: () => {
      if (!state.selectedTimeSlots.length) return '';
      
      const firstSlot = state.selectedTimeSlots[0];
      const lastSlot = state.selectedTimeSlots[state.selectedTimeSlots.length - 1];
      
      return `${firstSlot.startTime} - ${lastSlot.endTime}`;
    },

    getDuration: () => {
      return state.selectedTimeSlots.length * 0.5; // Hours
    }
  };

  const value = {
    state,
    actions,
    helpers,
    ACTIONS
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;