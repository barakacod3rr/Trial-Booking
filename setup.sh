#!/bin/bash

echo "🏌️ Golf Bay Booking System Setup"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing client dependencies..."
cd client && npm install && cd ..

echo "✅ All dependencies installed"

# Setup environment
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Environment file created at server/.env"
    echo "⚠️  Please configure your email settings in server/.env"
else
    echo "ℹ️  Environment file already exists"
fi

# Create initial database
echo ""
echo "🗄️  Setting up database..."
echo "Database will be initialized when the server starts"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure email settings in server/.env (optional but recommended)"
echo "2. Run 'npm run dev' to start both frontend and backend"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Email setup instructions:"
echo "- Use a Gmail account with 2FA enabled"
echo "- Generate an App Password: Google Account → Security → App passwords"
echo "- Update EMAIL_USER and EMAIL_PASS in server/.env"
echo ""
echo "Happy golfing! ⛳"