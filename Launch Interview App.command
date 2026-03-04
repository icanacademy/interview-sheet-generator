#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

# Display message in Terminal
echo "═══════════════════════════════════════════════════════"
echo "  🎓 ICAN Interview Sheet Generator                    "
echo "═══════════════════════════════════════════════════════"
echo ""

# Start Cloudflare tunnel if not already running
if ! pgrep -f "cloudflared tunnel run cosmodrive" > /dev/null 2>&1; then
    echo "🌐 Starting Cloudflare Tunnel..."
    cloudflared tunnel run cosmodrive &
    sleep 2
    echo "✅ Cloudflare Tunnel started"
else
    echo "🌐 Cloudflare Tunnel already running"
fi
echo "🌍 Public URL: https://interview.icanacademy.work"
echo ""

# Run the start script
./start.sh
