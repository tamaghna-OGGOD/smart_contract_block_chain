#!/bin/bash
set -e  # Exit on first error

echo "🚀 Starting Energy Trading Application..."

# Check if Fabric is running
if ! docker ps | grep -q "peer0.org1.example.com"; then
    echo "❌ Fabric network is not running. Please start it first with network/start.sh"
    exit 1
fi

# Start the API server
cd application/api
echo "🚀 Starting API server..."
node app.js &
API_PID=$!

# Open frontend
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