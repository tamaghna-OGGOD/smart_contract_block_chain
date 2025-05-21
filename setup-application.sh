#!/bin/bash
set -e  # Exit on first error

echo "🚀 Starting Energy Trading Application..."

# Navigate to application API directory
cd application/api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install fabric-network fabric-ca-client express axios dotenv cors
else
    echo "📦 Node modules already installed."
fi

# Create wallet directory if it doesn't exist
mkdir -p ../wallet

# Check if appUser exists in the wallet
if [ ! -d "../wallet/appUser" ]; then
    echo "🔑 Enrolling admin and registering app user..."
    node enrollAdmin.js
    node registerUser.js
else
    echo "🔑 User identities already exist in wallet."
fi

# Start the API server
echo "🚀 Starting API server..."
node app.js &
API_PID=$!

# Open frontend in browser
echo "🌐 Opening frontend in browser..."
FRONTEND_PATH="$(pwd)/../../frontend/index.html"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open $FRONTEND_PATH
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open $FRONTEND_PATH
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
    start $FRONTEND_PATH
else
    echo "📂 Please open the frontend manually at: $FRONTEND_PATH"
fi

# Wait for user to press Ctrl+C
echo "⚡ Energy Trading Platform is running. Press Ctrl+C to stop."
trap "kill $API_PID; echo '🛑 Shutting down application...'; exit 0" INT
wait