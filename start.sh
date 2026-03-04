#!/bin/bash

# Interview Sheet Generator - Startup Script
# This script starts the server and opens the application

# Use Node.js 20 LTS (required for better-sqlite3 compatibility)
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

echo "🚀 Starting Interview Sheet Generator..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm modules are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd server
    npm install
    cd ..
    echo ""
fi

# Start the server in the background
echo "🔧 Starting Node.js server..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to be ready (check if port 1120 is responding)
echo "⏳ Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:1120/health > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Server failed to start after 30 seconds"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n 1 | awk '{print $2}')

echo ""
echo "🌐 Opening application in browser..."
open index.html

echo ""
echo "✅ Interview Sheet Generator is running!"
echo ""
echo "📝 Server is running on:"
echo "   - Local:   http://localhost:1120"
echo "   - Network: http://$LOCAL_IP:1120"
echo ""
echo "📄 Application opened in browser"
echo ""
echo "⚠️  To stop the server, press Ctrl+C or run: kill $SERVER_PID"
echo "   Server PID: $SERVER_PID"
echo ""

# Keep script running and forward server logs
wait $SERVER_PID
