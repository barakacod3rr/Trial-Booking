# Golf Bay Booking System

A comprehensive golf bay booking system with PesaPal payment integration, featuring real-time availability, automated email confirmations, and a modern React frontend.

## Features

### 🏌️ Bay Selection
- **Bay Only** (2000 KES/hour) - Bays 1-10 for practice sessions
- **Coaching + Bay** (3000 KES/hour) - Bays 11-12 with professional instruction
- Support for up to 8 players per bay

### ⏰ Time & Date Booking
- Dynamic availability display based on bay selection
- 30-minute time slots from 10 AM to 10 PM
- Minimum 1-hour booking (2 consecutive slots)
- Real-time availability checking
- Prevents double bookings with consecutive slot validation

### 👤 Customer Management
- Simple form for name, email, and phone collection
- Input validation and formatting
- Customer data storage for booking records

### 💳 Checkout & Payment
- 10-minute payment timer with automatic expiry
- Comprehensive booking summary
- PesaPal integration with STK push for mobile payments
- Secure payment processing with callback handling

### 📧 Automated Confirmations
- Professional email templates
- Booking confirmation with all details
- Automatic sending after successful payment

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for booking storage
- **PesaPal API** for payment processing
- **Nodemailer** for email services
- **Moment.js** for date/time handling

### Frontend
- **React** with hooks and context
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd golf-bay-booking

# Install all dependencies
npm run install-all

# Or install individually
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration

Copy the environment file in the server directory:
```bash
cp server/.env.example server/.env
```

Configure the following in `server/.env`:

#### PesaPal Configuration (Already configured)
```env
PESAPAL_CONSUMER_KEY=i2MiCCdHFeFSTSPYXHhLUFHfBV+ZvaN6
PESAPAL_CONSUMER_SECRET=NkSWI+pPFBECnvIMe/BoMJBZqDc=
```

#### Email Configuration (Required for confirmations)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Golf Bay Booking <noreply@golfbay.com>
```

**To set up Gmail for sending emails:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: Google Account → Security → App passwords
3. Use the generated password in `EMAIL_PASS`

### 3. Start the Application

Development mode (both frontend and backend):
```bash
npm run dev
```

Or run separately:
```bash
# Backend (Terminal 1)
npm run server

# Frontend (Terminal 2)
npm run client
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## API Endpoints

### Bookings
- `GET /api/bookings/bays/:type` - Get bays by type (bay_only/coaching)
- `GET /api/bookings/availability/:bayNumber/:date` - Get time slot availability
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:bookingId` - Get booking details
- `PATCH /api/bookings/:bookingId/status` - Update booking status

### Payments
- `POST /api/payments/initiate` - Initiate PesaPal payment
- `GET /api/payments/status/:bookingId` - Get payment status
- `POST /api/payments/callback` - PesaPal callback handler
- `POST /api/payments/verify/:bookingId` - Manual payment verification

## Database Schema

### Bookings Table
- `id` - Unique booking identifier
- `bay_number` - Bay number (1-12)
- `booking_type` - 'bay_only' or 'coaching_bay'
- `players` - Number of players (1-8)
- `customer_name` - Customer name
- `customer_email` - Customer email
- `customer_phone` - Customer phone
- `booking_date` - Date in YYYY-MM-DD format
- `start_time` - Start time in HH:mm format
- `end_time` - End time in HH:mm format
- `total_cost` - Total cost in KES
- `status` - 'pending', 'confirmed', 'cancelled', 'expired'
- `payment_status` - 'pending', 'paid', 'failed'
- `expires_at` - Payment expiry timestamp
- `pesapal_tracking_id` - PesaPal transaction ID
- `pesapal_merchant_reference` - Unique payment reference

### Bays Table
- `number` - Bay number (1-12)
- `type` - 'bay_only' or 'coaching'
- `hourly_rate` - Rate per hour in KES
- `max_players` - Maximum players (8)

## Usage Workflow

### 1. Bay Selection
- Customer chooses between "Bay Only" or "Coaching + Bay"
- Selects number of players (1-8)
- Available bays are displayed based on selection

### 2. Time Selection
- Customer picks a date (today or future)
- Available 30-minute slots are shown
- Must select at least 2 consecutive slots (1 hour minimum)
- Real-time availability prevents conflicts

### 3. Customer Details
- Enter name, email, and phone number
- Form validation ensures correct formats
- Phone numbers accept Kenyan formats

### 4. Booking Summary
- Review all booking details
- See total cost calculation
- Create booking with 10-minute payment window

### 5. Payment
- Redirect to PesaPal for secure payment
- Supports mobile money (M-Pesa) and cards
- STK push for mobile payments
- Automatic callback processing

### 6. Confirmation
- Email sent automatically after payment
- Booking status updated to confirmed
- Customer receives booking details and instructions

## Business Rules

### Pricing
- **Bay Only**: 2000 KES/hour (Bays 1-10)
- **Coaching + Bay**: 3000 KES/hour (Bays 11-12)

### Time Slots
- Available: 10:00 AM - 10:00 PM daily
- Duration: 30-minute intervals
- Minimum booking: 1 hour (2 slots)
- Must be consecutive slots

### Payment
- 10-minute timer starts after booking creation
- Unpaid bookings automatically expire
- Slots released immediately on expiry

### Capacity
- Maximum 8 players per bay
- No overlapping bookings allowed

## Customization

### Adding New Bay Types
1. Update bay configuration in `server/database/init.js`
2. Add new bay types to frontend bay selection
3. Update pricing logic in booking calculations

### Modifying Time Slots
1. Update time generation in `server/routes/bookings.js`
2. Modify frontend time slot display components
3. Adjust minimum booking requirements

### Email Templates
1. Edit templates in `server/services/emailService.js`
2. Customize branding and styling
3. Add new email types (reminders, cancellations)

## Troubleshooting

### Common Issues

#### Payment Issues
- Verify PesaPal credentials are correct
- Check callback URL is accessible
- Ensure proper SSL/HTTPS in production

#### Email Issues
- Verify Gmail credentials and app password
- Check spam folder for test emails
- Ensure 2FA is enabled on Google account

#### Database Issues
- Check SQLite file permissions
- Verify database initialization completed
- Check for foreign key constraint errors

#### Time Zone Issues
- All times stored in local time
- Ensure consistent time zone handling
- Verify moment.js configuration

### Logs
- Server logs: Console output in development
- API request/response logs via axios interceptors
- Payment callback logs in PesaPal endpoints

## Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use HTTPS URLs for all callbacks
- Configure production database
- Set up proper email service

### Security
- Enable HTTPS/SSL
- Set up rate limiting
- Configure CORS properly
- Secure API endpoints

### Monitoring
- Set up health check monitoring
- Monitor payment callback success rates
- Track booking conversion rates
- Monitor email delivery rates

## Support

For technical support or questions:
- Email: support@golfbay.com
- Phone: +254 123 456 789
- Hours: 9 AM - 6 PM, Monday to Sunday

## License

This project is licensed under the MIT License.
