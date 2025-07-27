const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../database/init');
const { generatePesapalUrl, verifyPayment } = require('../services/pesapalService');

const router = express.Router();

// Initiate payment with PesaPal
router.post('/initiate', async (req, res) => {
  const { bookingId } = req.body;
  
  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }
  
  const db = getDb();
  
  // Get booking details
  db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], async (err, booking) => {
    if (err) {
      console.error('Error fetching booking:', err);
      return res.status(500).json({ error: 'Failed to fetch booking details' });
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }
    
    // Check if booking has expired
    if (booking.expires_at && new Date(booking.expires_at) < new Date()) {
      // Update booking status to expired
      db.run('UPDATE bookings SET status = ? WHERE id = ?', ['expired', bookingId]);
      return res.status(400).json({ error: 'Booking has expired' });
    }
    
    try {
      // Generate unique merchant reference
      const merchantReference = `GOLF-${bookingId.substring(0, 8)}-${Date.now()}`;
      
      // Prepare payment data
      const paymentData = {
        amount: booking.total_cost,
        description: `Golf Bay ${booking.bay_number} - ${booking.booking_date} ${booking.start_time}-${booking.end_time}`,
        type: 'MERCHANT',
        reference: merchantReference,
        first_name: booking.customer_name.split(' ')[0] || booking.customer_name,
        last_name: booking.customer_name.split(' ').slice(1).join(' ') || '',
        email: booking.customer_email,
        phonenumber: booking.customer_phone,
        callback_url: `${process.env.SERVER_URL}/api/payments/callback`,
        notification_id: bookingId,
        currency: 'KES'
      };
      
      // Generate PesaPal payment URL
      const paymentUrl = await generatePesapalUrl(paymentData);
      
      // Update booking with merchant reference
      db.run(
        'UPDATE bookings SET pesapal_merchant_reference = ? WHERE id = ?',
        [merchantReference, bookingId],
        (err) => {
          if (err) {
            console.error('Error updating booking with merchant reference:', err);
          }
        }
      );
      
      res.json({
        paymentUrl,
        merchantReference,
        bookingId,
        amount: booking.total_cost
      });
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  });
});

// PesaPal callback handler
router.post('/callback', async (req, res) => {
  console.log('Payment callback received:', req.body);
  
  const { 
    pesapal_merchant_reference,
    pesapal_transaction_tracking_id,
    pesapal_notification_type 
  } = req.body;
  
  if (!pesapal_merchant_reference || !pesapal_transaction_tracking_id) {
    console.error('Missing required callback parameters');
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  const db = getDb();
  
  try {
    // Find booking by merchant reference
    db.get(
      'SELECT * FROM bookings WHERE pesapal_merchant_reference = ?',
      [pesapal_merchant_reference],
      async (err, booking) => {
        if (err) {
          console.error('Error finding booking:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!booking) {
          console.error('Booking not found for merchant reference:', pesapal_merchant_reference);
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        try {
          // Verify payment status with PesaPal
          const paymentStatus = await verifyPayment(pesapal_merchant_reference, pesapal_transaction_tracking_id);
          
          let newStatus = 'pending';
          let paymentStatusDb = 'pending';
          
          if (paymentStatus === 'COMPLETED') {
            newStatus = 'confirmed';
            paymentStatusDb = 'paid';
          } else if (paymentStatus === 'FAILED') {
            newStatus = 'cancelled';
            paymentStatusDb = 'failed';
          }
          
          // Update booking status
          db.run(
            `UPDATE bookings SET 
             status = ?, 
             payment_status = ?, 
             pesapal_tracking_id = ?,
             expires_at = NULL
             WHERE id = ?`,
            [newStatus, paymentStatusDb, pesapal_transaction_tracking_id, booking.id],
            function(err) {
              if (err) {
                console.error('Error updating booking status:', err);
                return res.status(500).json({ error: 'Failed to update booking' });
              }
              
              console.log(`Booking ${booking.id} updated: status=${newStatus}, payment=${paymentStatusDb}`);
              res.json({ 
                message: 'Payment processed successfully',
                status: newStatus,
                paymentStatus: paymentStatusDb
              });
            }
          );
          
        } catch (verifyError) {
          console.error('Error verifying payment:', verifyError);
          res.status(500).json({ error: 'Failed to verify payment' });
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).json({ error: 'Failed to process payment callback' });
  }
});

// Get payment status
router.get('/status/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const db = getDb();
  
  db.get(
    'SELECT payment_status, status, pesapal_tracking_id, expires_at FROM bookings WHERE id = ?',
    [bookingId],
    (err, booking) => {
      if (err) {
        console.error('Error fetching payment status:', err);
        return res.status(500).json({ error: 'Failed to fetch payment status' });
      }
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      // Check if booking has expired
      const hasExpired = booking.expires_at && new Date(booking.expires_at) < new Date();
      
      res.json({
        paymentStatus: booking.payment_status,
        bookingStatus: booking.status,
        pesapalTrackingId: booking.pesapal_tracking_id,
        hasExpired,
        expiresAt: booking.expires_at
      });
    }
  );
});

// Manual payment verification (for testing or admin use)
router.post('/verify/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const db = getDb();
  
  db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], async (err, booking) => {
    if (err) {
      console.error('Error fetching booking:', err);
      return res.status(500).json({ error: 'Failed to fetch booking details' });
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (!booking.pesapal_merchant_reference || !booking.pesapal_tracking_id) {
      return res.status(400).json({ error: 'Payment not initiated or tracking ID missing' });
    }
    
    try {
      const paymentStatus = await verifyPayment(booking.pesapal_merchant_reference, booking.pesapal_tracking_id);
      
      let newStatus = 'pending';
      let paymentStatusDb = 'pending';
      
      if (paymentStatus === 'COMPLETED') {
        newStatus = 'confirmed';
        paymentStatusDb = 'paid';
      } else if (paymentStatus === 'FAILED') {
        newStatus = 'cancelled';
        paymentStatusDb = 'failed';
      }
      
      // Update booking status
      db.run(
        'UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?',
        [newStatus, paymentStatusDb, bookingId],
        function(err) {
          if (err) {
            console.error('Error updating booking status:', err);
            return res.status(500).json({ error: 'Failed to update booking' });
          }
          
          res.json({
            message: 'Payment verification completed',
            paymentStatus: paymentStatusDb,
            bookingStatus: newStatus,
            pesapalStatus: paymentStatus
          });
        }
      );
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  });
});

module.exports = router;