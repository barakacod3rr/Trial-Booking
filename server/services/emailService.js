const nodemailer = require('nodemailer');
const moment = require('moment');

// Create transporter using environment variables
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Email service disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate booking confirmation email HTML
const generateConfirmationEmail = (booking) => {
  const bookingDate = moment(booking.booking_date).format('dddd, MMMM Do YYYY');
  const startTime = moment(booking.start_time, 'HH:mm').format('h:mm A');
  const endTime = moment(booking.end_time, 'HH:mm').format('h:mm A');
  const duration = moment.duration(moment(booking.end_time, 'HH:mm').diff(moment(booking.start_time, 'HH:mm'))).asHours();
  
  const bayType = booking.booking_type === 'coaching_bay' ? 'Coaching Bay' : 'Practice Bay';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c5530; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .booking-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #2c5530; }
            .total-cost { background-color: #2c5530; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .contact-info { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏌️ Golf Bay Booking Confirmed</h1>
                <p>Your payment has been successfully processed</p>
            </div>
            
            <div class="content">
                <h2>Hello ${booking.customer_name}!</h2>
                <p>Thank you for your booking. Your golf bay reservation has been confirmed and payment processed successfully.</p>
                
                <div class="booking-details">
                    <h3>Booking Details</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Booking ID:</span>
                        <span>${booking.id}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Bay Number:</span>
                        <span>Bay ${booking.bay_number} (${bayType})</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span>${bookingDate}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span>${startTime} - ${endTime} (${duration} hour${duration > 1 ? 's' : ''})</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Number of Players:</span>
                        <span>${booking.players}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Customer Details:</span>
                        <span>${booking.customer_name}<br>${booking.customer_email}<br>${booking.customer_phone}</span>
                    </div>
                </div>
                
                <div class="total-cost">
                    <h3>Total Paid: KES ${booking.total_cost.toLocaleString()}</h3>
                </div>
                
                <div class="contact-info">
                    <h4>Important Information:</h4>
                    <ul>
                        <li>Please arrive 15 minutes before your booking time</li>
                        <li>Bring a valid ID for verification</li>
                        <li>Golf equipment is available for rent at the facility</li>
                        <li>Cancellations must be made at least 24 hours in advance</li>
                    </ul>
                </div>
                
                <div class="contact-info">
                    <h4>Need Help?</h4>
                    <p>If you have any questions about your booking, please contact us:</p>
                    <ul>
                        <li>Email: support@golfbay.com</li>
                        <li>Phone: +254 123 456 789</li>
                        <li>Hours: 9 AM - 6 PM, Monday to Sunday</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing our golf facility!</p>
                <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send confirmation email
const sendConfirmationEmail = async (booking) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email service not configured - skipping confirmation email');
    return;
  }

  const emailHtml = generateConfirmationEmail(booking);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Golf Bay Booking <noreply@golfbay.com>',
    to: booking.customer_email,
    subject: `Golf Bay Booking Confirmed - Bay ${booking.bay_number} on ${moment(booking.booking_date).format('MMM Do, YYYY')}`,
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
};

// Send booking expiry reminder (optional feature)
const sendExpiryReminder = async (booking) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return;
  }

  const timeLeft = moment(booking.expires_at).diff(moment(), 'minutes');
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Expiry Reminder</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .action-button { background-color: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Payment Reminder</h1>
                <p>Your booking will expire soon</p>
            </div>
            
            <div class="content">
                <h2>Hello ${booking.customer_name}!</h2>
                
                <div class="warning">
                    <strong>⚠️ Your booking will expire in ${timeLeft} minutes!</strong>
                    <p>Please complete your payment to secure your golf bay reservation.</p>
                </div>
                
                <p><strong>Booking Details:</strong></p>
                <ul>
                    <li>Bay ${booking.bay_number}</li>
                    <li>${moment(booking.booking_date).format('MMM Do, YYYY')} at ${moment(booking.start_time, 'HH:mm').format('h:mm A')}</li>
                    <li>Total: KES ${booking.total_cost.toLocaleString()}</li>
                </ul>
                
                <p>If payment is not completed before expiry, your booking will be automatically cancelled and the time slot will be released.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Golf Bay Booking <noreply@golfbay.com>',
    to: booking.customer_email,
    subject: '⏰ Payment Reminder - Golf Bay Booking Expiring Soon',
    html: emailHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Expiry reminder sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send expiry reminder:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: `Email configuration error: ${error.message}` };
  }
};

module.exports = {
  sendConfirmationEmail,
  sendExpiryReminder,
  testEmailConfiguration
};