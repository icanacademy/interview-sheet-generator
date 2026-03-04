# Quick Start Guide

## 🚀 Easy Way (Recommended)

### Start Everything:
```bash
./start.sh
```
This will:
- ✅ Start the Node.js server
- ✅ Open the application in your browser
- ✅ Automatically check if server is ready

### Stop the Server:
```bash
./stop.sh
```

---

## 🔧 Manual Way

### Start Server Only:
```bash
cd server
npm start
```

### Open Application:
- Double-click `index.html` in Finder
- Or run: `open index.html`

### Stop Server:
Press `Ctrl+C` in the terminal where server is running

---

## 📋 Requirements

- Node.js installed ([download here](https://nodejs.org/))
- Dependencies installed (run `npm install` in server folder)

---

## 🆘 Troubleshooting

### "Server failed to start"
- Check if port 3000 is already in use
- Run `./stop.sh` first to kill any existing processes
- Check server logs in terminal

### "Failed to load students"
- Make sure server is running (`./start.sh`)
- Check your API keys in `server/server.js`
- Check internet connection (for Notion API)

### Text Bank not loading
- This should now work even if server is offline
- Clear browser cache and refresh (Cmd+Shift+R)
- Check browser console for errors (F12 → Console)

---

## 📝 Notes

- **Text Bank** works offline (doesn't need server)
- **Student Data** requires server + internet (Notion API)
- **AI Reports** require server + internet (OpenAI API)
- Server runs on: http://localhost:3000
