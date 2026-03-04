# Interview Sheet Generator with Notion Integration

## Features

- Side-by-side Initial and Final Interview data entry
- Automatic student selection from Notion database
- Auto-fill Student ID when selecting a student
- Real-time calculations for all scores
- Radar charts for visualization
- Comparison charts showing Initial vs Final progress
- Print-friendly interview sheets

## Setup Instructions

### 1. Start the Proxy Server

The proxy server is required to connect to Notion API (to avoid CORS issues).

```bash
cd server
npm start
```

You should see:
```
✓ Notion Proxy Server running on:
  - Local:   http://localhost:1120
  - Network: http://192.168.68.106:1120

✓ Available endpoints:
  - Health check: http://192.168.68.106:1120/health
  - Students API: http://192.168.68.106:1120/api/students
  - AI Analysis API: http://192.168.68.106:1120/api/ai-analysis
  - Import to Notion API: http://192.168.68.106:1120/api/import-to-notion
```

### 2. Open the Interview Sheet

Simply open `index.html` in your browser:

```bash
open index.html
```

Or double-click the file in Finder.

### 3. Use the Application

1. **Select Student**:
   - The dropdown automatically populates with **only ACTIVE students** from your Notion database
   - Students are **sorted alphabetically** for easy browsing
   - **Type to search**: Just start typing a student's name to filter the list
   - Use arrow keys to navigate and Enter to select
   - Inactive students are automatically filtered out

2. **Auto-fill Student Data**: When you select a student, these fields automatically fill:
   - **Student ID** (e.g., "11" from ICN-ST-11) - Auto-filled, read-only
   - **Grade** (e.g., "3") - Auto-filled, read-only
   - **Gender** (e.g., "Male" or "Female") - Auto-filled, read-only
   - **Age** - Manually entered (not in Notion database)
   - Auto-filled fields have a gray background and are read-only

3. **Enter Data**: Fill in the Initial and Final interview data side-by-side

4. **Auto-Save & Auto-Load**:
   - **Auto-Save**: Your work is automatically saved 2 seconds after you stop typing
   - **Auto-Load**: When you select a student + date, previous data automatically loads
   - **Save Status**: Watch the status indicator show "Saving..." then "All changes saved"
   - **Last Saved Time**: See when your data was last saved
   - **Seamless**: No buttons to click - just work naturally!
   - All data is saved in your browser's localStorage (persists between sessions)

5. **View Results**: Switch to the "Initial Interview Sheet" or "Final Interview & Comparison" tabs to see formatted results

## Notion Database Structure

The integration expects the following fields in your Notion database:

- **Full Name** (Title): Student's full name
- **Student ID** (Unique ID): Student ID with ICN-ST prefix
- **Status**: Student status (Active/Inactive)

The application will load all students and sort them for easy selection.

## Troubleshooting

### Students not loading?

1. Make sure the proxy server is running: `cd server && npm start`
2. Check the browser console (F12) for errors
3. Visit http://localhost:1120/health to verify server is running
4. Make sure your Notion integration has access to the database

### Server not starting?

1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `cd server && npm install`
3. Check if port 1120 is already in use: `lsof -i :1120`

### Wrong data showing up?

The integration tries to match common field names. If your Notion database uses different field names, you can modify the field mapping in the JavaScript code (around line 1640 in index.html).

## Project Structure

```
interview-sheet-generator/
├── index.html              # Main application
├── server/                 # Proxy server
│   ├── server.js          # Server code
│   ├── package.json       # Dependencies
│   └── README.md          # Server documentation
└── README.md              # This file
```

## API Configuration

The Notion API credentials are configured in:
- `index.html` (lines 1600-1601): Frontend configuration
- `server/server.js` (lines 8-10): Backend configuration

**API Key**: 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
**Database ID**: 1abd37d666308071bfe1e37d1d155035

## Auto-Save System

### How It Works:

1. **Auto-Save (Seamless)**:
   - Starts 2 seconds after you stop typing
   - No need to click any save button
   - Status indicator shows:
     - 🟡 **"Saving..."** - When actively saving
     - 🟢 **"All changes saved"** - When data is safely stored
     - ⚪ **"Unsaved changes"** - If student or date is missing
   - Shows exact time of last save

2. **Auto-Load (Intelligent)**:
   - When you select a **student**, the system checks if dates are set
   - When you select a **date**, the system checks if a student is selected
   - If both are present, it automatically loads the most recent saved data
   - **No confirmation needed** - it just loads seamlessly
   - Each section (Initial/Final) loads independently

3. **Workflow**:
   - **Step 1**: Select a student from dropdown
   - **Step 2**: Select a date in Initial or Final section
   - **Step 3**: Previous data (if any) loads automatically
   - **Step 4**: Make your changes
   - **Step 5**: Wait 2 seconds - auto-save happens!

4. **Data Persistence**:
   - All data is stored in browser localStorage
   - Data persists even after closing the browser
   - Data is tied to this specific browser/computer
   - Each save includes: student info, date, interviewer, all scores, persuasion data, and reports

### Smart Features:
- 🔄 **Debounced Saving**: Won't save on every keystroke - waits until you're done
- 📊 **Most Recent First**: Always loads the latest save for a student/date combination
- 🎯 **Section-Specific**: Initial and Final sections save/load independently
- 💾 **Complete Snapshots**: Every save captures everything you've entered
- ⏰ **Timestamp Tracking**: Know exactly when data was last saved

## Notes

- The proxy server must be running for the student dropdown to work
- Student data is fetched fresh each time the page loads
- All calculations are performed in real-time as you enter data
- The Student ID field is read-only and auto-fills from the selected student
- Saved interview data is stored in browser localStorage (not sent to Notion)
