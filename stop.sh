#!/bin/bash

# Interview Sheet Generator - Stop Script
# This script stops the running server

echo "🛑 Stopping Interview Sheet Generator server..."

# Find and kill all node processes running server.js
PIDS=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ No server processes found (already stopped)"
else
    for PID in $PIDS; do
        kill $PID 2>/dev/null
        echo "✅ Stopped server process: $PID"
    done
fi

# Also kill any processes on port 1120
PORT_PID=$(lsof -ti:1120)
if [ ! -z "$PORT_PID" ]; then
    kill $PORT_PID 2>/dev/null
    echo "✅ Freed port 1120"
fi

echo ""
echo "✅ All server processes stopped!"
