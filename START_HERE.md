# Quick Start Guide - Interview Sheet Generator

## Your Server Configuration

**Local IP:** 192.168.68.106
**Port:** 1120

---

## Starting the Application

### 🎯 EASIEST WAY (Recommended)

**Just double-click:** `Launch Interview App.command`

This will:
- ✅ Start the server automatically
- ✅ Wait for it to be ready
- ✅ Open the app in your browser
- ✅ Show you the server status

### Option 2: Using the Terminal

1. **Start the server:**
   ```bash
   cd /Users/icanacademy/interview-sheet-generator/server
   npm start
   ```

2. **Open the app in your browser:**
   ```bash
   open /Users/icanacademy/interview-sheet-generator/index.html
   ```

### Option 3: Using the Scripts

1. Double-click: `Start Interview App.command` (old version)
2. Or run: `./start.sh` from Terminal

---

## Access Points

Once the server is running, you can access it from:

### On This Computer:
- http://localhost:1120
- http://192.168.68.106:1120

### From Other Devices on Your Network:
- http://192.168.68.106:1120

### Test Endpoints:
- Health Check: http://192.168.68.106:1120/health
- Students API: http://192.168.68.106:1120/api/students

---

## Stopping the Application

### 🎯 EASIEST WAY
Double-click: `Stop Interview App.command`

### Option 2: Using Terminal
Press `Ctrl+C` in the terminal where the server is running

### Option 3: Using the Script
Run: `./stop.sh` from Terminal

---

## Troubleshooting

### Server won't start?
Check if port 1120 is already in use:
```bash
lsof -i :1120
```

### Can't access from other devices?
Make sure:
1. Both devices are on the same WiFi network
2. Your firewall allows connections on port 1120

### Students not loading?
1. Make sure the server is running
2. Visit http://localhost:1120/health to verify
3. Check browser console (F12) for errors

---

## What Changed?

✅ Server now runs on port **1120** (instead of 3000)
✅ Server listens on **0.0.0.0** (accessible from network)
✅ Shows your **local IP address** on startup
✅ All API endpoints updated to use port 1120

---

## Want a Custom Icon?

See `HOW_TO_ADD_CUSTOM_ICON.md` for instructions on adding the ICAN logo or any custom icon to your Launch command file!

---

Enjoy using the Interview Sheet Generator! 🎉
