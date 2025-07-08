# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an Overtime Management System (야근일지) - a Korean overtime work logging application built with Node.js, Express, Firebase, and vanilla JavaScript. The application allows employees to log their overtime hours, track dinner provisions, and export records to Excel.

## Essential Commands

```bash
# Install dependencies
npm install

# Start the server
npm start

# Run the server (direct)
node server.js
```

## Environment Setup

Before running the application, create a `.env` file with:
```
SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'
PORT=3000  # Optional, defaults to 3000
```

## Architecture

The application follows an MVC-style pattern:

```
server.js → routes/overtime.js → controllers/overtimeController.js → Firebase
     ↓
public/ (static files served to browser)
```

### Key Components:

1. **Backend API** (`/api/overtime`):
   - POST: Create overtime records
   - GET: Query records (filters: userName, year, month)
   - GET /export: Download Excel file

2. **Frontend** (`public/`):
   - Single-page application with Korean UI
   - Time selection buttons (18:00 to 09:00)
   - User dropdown with 14 predefined users
   - Filtering and Excel export features

3. **Database**:
   - Firebase Firestore collection: "OvertimeRecords"
   - Document fields: userName, date, startTime, endTime, dinner, totalHours, description, createdAt, updatedAt

## Development Notes

- **No test framework** - Consider adding tests before major changes
- **No linting setup** - Code style may vary
- **Korean UI** - All user-facing text is in Korean
- **No authentication** - This is an internal tool without access control
- **Static user list** - Users are hardcoded in public/main.js

## Common Tasks

### Adding a new user:
Edit the user list in `public/main.js`:
```javascript
const users = ['User1', 'User2', ...];  // Around line 2
```

### Modifying time options:
Edit the time arrays in `public/main.js`:
```javascript
const startTimes = ['18:00', '18:30', ...];  // Around line 4
const endTimes = ['00:00', '01:00', ...];    // Around line 5
```

### Debugging Firebase connection:
```bash
node -e "require('./config/firebase'); console.log('Firebase connected')"
```

### Testing API endpoints:
```bash
# Get all records
curl http://localhost:3000/api/overtime

# Create a test record
curl -X POST http://localhost:3000/api/overtime \
  -H "Content-Type: application/json" \
  -d '{"userName":"테스트","date":"2024-01-01","startTime":"18:00","endTime":"22:00"}'
```