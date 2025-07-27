const express = require('express');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/init');
const { sendConfirmationEmail } = require('../services/emailService');

const router = express.Router();

// Get available bays based on booking type
router.get('/bays/:type', (req, res) => {
  const { type } = req.params;
  const db = getDb();
  
  let bayCondition;
  if (type === 'bay_only') {
    bayCondition = "type = 'bay_only'";
  } else if (type === 'coaching') {
    bayCondition = "type = 'coaching'";
  } else {
    return res.status(400).json({ error: 'Invalid bay type' });
  }
  
  const query = `SELECT * FROM bays WHERE ${bayCondition} ORDER BY number`;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching bays:', err);
      return res.status(500).json({ error: 'Failed to fetch bays' });
    }
    res.json(rows);
  });
});

// Get available time slots for a specific bay and date
router.get('/availability/:bayNumber/:date', (req, res) => {
  const { bayNumber, date } = req.params;
  const db = getDb();
  
  // Validate date format
  if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  
  // Generate all possible time slots (10 AM to 10 PM, 30-minute intervals)
  const timeSlots = [];
  const startHour = 10; // 10 AM
  const endHour = 22; // 10 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = moment().hour(hour).minute(minute).second(0).format('HH:mm');
      const endTime = moment().hour(hour).minute(minute + 30).second(0).format('HH:mm');
      
      // Handle hour rollover
      if (minute === 30 && hour === endHour - 1) {
        break; // Don't add the last 30-minute slot that would go past 10 PM
      }
      
      timeSlots.push({
        startTime,
        endTime: minute === 30 ? moment().hour(hour + 1).minute(0).second(0).format('HH:mm') : endTime,
        available: true
      });
    }
  }
  
  // Check for existing bookings
  const query = `
    SELECT start_time, end_time 
    FROM bookings 
    WHERE bay_number = ? 
    AND booking_date = ? 
    AND status IN ('pending', 'confirmed') 
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  `;
  
  db.all(query, [bayNumber, date], (err, bookings) => {
    if (err) {
      console.error('Error checking availability:', err);
      return res.status(500).json({ error: 'Failed to check availability' });
    }
    
    // Mark unavailable slots
    bookings.forEach(booking => {
      const bookingStart = moment(booking.start_time, 'HH:mm');
      const bookingEnd = moment(booking.end_time, 'HH:mm');
      
      timeSlots.forEach(slot => {
        const slotStart = moment(slot.startTime, 'HH:mm');
        const slotEnd = moment(slot.endTime, 'HH:mm');
        
        // Check if slot overlaps with booking
        if (slotStart.isBefore(bookingEnd) && slotEnd.isAfter(bookingStart)) {
          slot.available = false;
        }
      });
    });
    
    res.json(timeSlots);
  });
});

// Create a new booking
router.post('/', (req, res) => {
  const {
    bayNumber,
    bookingType,
    players,
    customerName,
    customerEmail,
    customerPhone,
    bookingDate,
    timeSlots
  } = req.body;
  
  // Validation
  if (!bayNumber || !bookingType || !players || !customerName || !customerEmail || !customerPhone || !bookingDate || !timeSlots || timeSlots.length < 2) {
    return res.status(400).json({ error: 'Missing required fields or insufficient time slots (minimum 1 hour = 2 slots)' });
  }
  
  if (players < 1 || players > 8) {
    return res.status(400).json({ error: 'Players must be between 1 and 8' });
  }
  
  // Validate consecutive slots
  const sortedSlots = timeSlots.sort((a, b) => moment(a.startTime, 'HH:mm').diff(moment(b.startTime, 'HH:mm')));
  for (let i = 1; i < sortedSlots.length; i++) {
    const prevEnd = moment(sortedSlots[i-1].endTime, 'HH:mm');
    const currentStart = moment(sortedSlots[i].startTime, 'HH:mm');
    if (!prevEnd.isSame(currentStart)) {
      return res.status(400).json({ error: 'Time slots must be consecutive' });
    }
  }
  
  const db = getDb();
  const bookingId = uuidv4();
  const startTime = sortedSlots[0].startTime;
  const endTime = sortedSlots[sortedSlots.length - 1].endTime;
  
  // Calculate total cost
  const hours = moment.duration(moment(endTime, 'HH:mm').diff(moment(startTime, 'HH:mm'))).asHours();
  
  // Get bay rate
  db.get('SELECT hourly_rate FROM bays WHERE number = ?', [bayNumber], (err, bay) => {
    if (err) {
      console.error('Error fetching bay rate:', err);
      return res.status(500).json({ error: 'Failed to fetch bay information' });
    }
    
    if (!bay) {
      return res.status(404).json({ error: 'Bay not found' });
    }
    
    const totalCost = bay.hourly_rate * hours;
    const expiresAt = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    
    // Check availability one more time before creating booking
    const availabilityQuery = `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE bay_number = ? 
      AND booking_date = ? 
      AND status IN ('pending', 'confirmed') 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?)
      )
    `;
    
    db.get(availabilityQuery, [bayNumber, bookingDate, endTime, startTime, startTime, endTime], (err, result) => {
      if (err) {
        console.error('Error checking final availability:', err);
        return res.status(500).json({ error: 'Failed to verify availability' });
      }
      
      if (result.count > 0) {
        return res.status(409).json({ error: 'Selected time slots are no longer available' });
      }
      
      // Create booking
      const insertQuery = `
        INSERT INTO bookings (
          id, bay_number, booking_type, players, customer_name, customer_email, 
          customer_phone, booking_date, start_time, end_time, total_cost, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const bookingTypeDb = bookingType === 'coaching' ? 'coaching_bay' : 'bay_only';
      
      db.run(insertQuery, [
        bookingId, bayNumber, bookingTypeDb, players, customerName, customerEmail,
        customerPhone, bookingDate, startTime, endTime, totalCost, expiresAt
      ], function(err) {
        if (err) {
          console.error('Error creating booking:', err);
          return res.status(500).json({ error: 'Failed to create booking' });
        }
        
        res.status(201).json({
          bookingId,
          bayNumber,
          bookingType,
          players,
          customerName,
          customerEmail,
          customerPhone,
          bookingDate,
          startTime,
          endTime,
          totalCost,
          expiresAt,
          status: 'pending'
        });
      });
    });
  });
});

// Get booking details
router.get('/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const db = getDb();
  
  const query = `
    SELECT b.*, bay.hourly_rate 
    FROM bookings b
    JOIN bays bay ON b.bay_number = bay.number
    WHERE b.id = ?
  `;
  
  db.get(query, [bookingId], (err, booking) => {
    if (err) {
      console.error('Error fetching booking:', err);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  });
});

// Update booking status (used after payment)
router.patch('/:bookingId/status', (req, res) => {
  const { bookingId } = req.params;
  const { status, paymentStatus, pesapalTrackingId } = req.body;
  const db = getDb();
  
  let updateFields = [];
  let values = [];
  
  if (status) {
    updateFields.push('status = ?');
    values.push(status);
  }
  
  if (paymentStatus) {
    updateFields.push('payment_status = ?');
    values.push(paymentStatus);
  }
  
  if (pesapalTrackingId) {
    updateFields.push('pesapal_tracking_id = ?');
    values.push(pesapalTrackingId);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  values.push(bookingId);
  
  const query = `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      console.error('Error updating booking:', err);
      return res.status(500).json({ error: 'Failed to update booking' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // If payment is confirmed, send confirmation email
    if (paymentStatus === 'paid' && status === 'confirmed') {
      db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
        if (!err && booking) {
          sendConfirmationEmail(booking)
            .catch(emailErr => console.error('Failed to send confirmation email:', emailErr));
        }
      });
    }
    
    res.json({ message: 'Booking updated successfully' });
  });
});

// Clean up expired bookings (run periodically)
router.post('/cleanup-expired', (req, res) => {
  const db = getDb();
  
  const query = `
    UPDATE bookings 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at IS NOT NULL 
    AND expires_at <= datetime('now')
  `;
  
  db.run(query, function(err) {
    if (err) {
      console.error('Error cleaning up expired bookings:', err);
      return res.status(500).json({ error: 'Failed to cleanup expired bookings' });
    }
    
    res.json({ message: `${this.changes} expired bookings cleaned up` });
  });
});

module.exports = router;