import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import BookingWizard from './components/BookingWizard';
import PaymentPage from './components/PaymentPage';
import ConfirmationPage from './components/ConfirmationPage';
import HomePage from './components/HomePage';

// Context
import { BookingProvider } from './context/BookingContext';

function App() {
  return (
    <BookingProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book" element={<BookingWizard />} />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
            </Routes>
          </main>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#2c5530',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
              },
            }}
          />
        </div>
      </Router>
    </BookingProvider>
  );
}

export default App;