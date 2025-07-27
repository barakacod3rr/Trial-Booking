import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access detected');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Booking API endpoints
export const bookingAPI = {
  // Get available bays by type
  getBaysByType: async (type) => {
    const response = await api.get(`/bookings/bays/${type}`);
    return response.data;
  },

  // Get availability for specific bay and date
  getAvailability: async (bayNumber, date) => {
    const response = await api.get(`/bookings/availability/${bayNumber}/${date}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get booking details
  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, statusData) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, statusData);
    return response.data;
  },

  // Clean up expired bookings
  cleanupExpiredBookings: async () => {
    const response = await api.post('/bookings/cleanup-expired');
    return response.data;
  }
};

// Payment API endpoints
export const paymentAPI = {
  // Initiate payment
  initiatePayment: async (bookingId) => {
    const response = await api.post('/payments/initiate', { bookingId });
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payments/status/${bookingId}`);
    return response.data;
  },

  // Verify payment manually
  verifyPayment: async (bookingId) => {
    const response = await api.post(`/payments/verify/${bookingId}`);
    return response.data;
  },

  // Handle payment callback (not typically called from frontend)
  handleCallback: async (callbackData) => {
    const response = await api.post('/payments/callback', callbackData);
    return response.data;
  }
};

// General API endpoints
export const generalAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Utility functions for error handling
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.error || data?.message || 'An error occurred';
    
    switch (status) {
      case 400:
        return { type: 'validation', message };
      case 401:
        return { type: 'auth', message: 'Unauthorized access' };
      case 403:
        return { type: 'permission', message: 'Permission denied' };
      case 404:
        return { type: 'notFound', message: 'Resource not found' };
      case 409:
        return { type: 'conflict', message };
      case 429:
        return { type: 'rateLimit', message: 'Too many requests. Please try again later.' };
      case 500:
        return { type: 'server', message: 'Server error. Please try again later.' };
      default:
        return { type: 'unknown', message };
    }
  } else if (error.request) {
    // Network error
    return { 
      type: 'network', 
      message: 'Network error. Please check your connection and try again.' 
    };
  } else {
    // Other error
    return { 
      type: 'unknown', 
      message: error.message || 'An unexpected error occurred' 
    };
  }
};

// Utility function to format dates for API calls
export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    return date;
  }
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Utility function to validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to validate phone number (Kenyan format)
export const isValidPhone = (phone) => {
  // Accept formats: +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
  const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Format phone number to standard format
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  
  if (cleaned.startsWith('+254')) {
    return cleaned;
  } else if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }
  
  return phone; // Return original if format not recognized
};

export default api;