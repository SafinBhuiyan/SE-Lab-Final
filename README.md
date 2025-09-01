# SE Lab Final - Web Application with Oracle Database

A simple web application demonstrating user registration and login with Oracle database connectivity and automated Selenium testing.

## Technologies Used
- HTML, CSS, JavaScript
- Pure Node.js (no frameworks)
- Oracle Database 11g
- Selenium WebDriver

## Prerequisites
- Node.js installed
- Oracle Database 11g running
- Oracle Instant Client installed (for database connectivity)
- Chrome browser for Selenium tests

## Oracle Instant Client Setup

Since you're using Oracle 11g, you need to install Oracle Instant Client for database connectivity:

1. **Download Oracle Instant Client:**
   - Go to: https://www.oracle.com/database/technologies/instant-client/downloads.html
   - Download the "Basic" package for your platform (Windows 64-bit)
   - Also download the "SDK" package

2. **Install Oracle Instant Client:**
   - Extract both packages to the same directory (e.g., `C:\oracle\instantclient`)
   - Add the directory to your system PATH environment variable
   - Or set the `ORACLE_HOME` environment variable to point to this directory

3. **Alternative: Use existing Oracle installation:**
   - If you have Oracle Database installed locally, you can use its client libraries
   - Set `ORACLE_HOME` to your Oracle installation directory (e.g., `C:\app\oracle\product\11.2.0\dbhome_1`)

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   - Ensure Oracle Database is running
   - Update database connection details in `server/server.js` if needed
   - The application will automatically create the `users` table on startup

3. **Run the Application:**
   ```bash
   npm start
   ```
   The server will start on http://localhost:3000

4. **Testing:**
   Testing will be performed using Chrome extension instead of automated scripts.
   Open Chrome browser and use your testing extension to verify:
   - Homepage loads correctly
   - User registration works
   - User login functions properly
   - Session management operates as expected

4. **Run Selenium Tests:**
   ```bash
   node tests/test.js
   ```

## Features
- 🎓 IUS University branding and professional logo
- 🔐 User registration and login with tabbed interface
- 👤 Session management with personalized dashboard
- 🗄️ Oracle database connectivity (11g compatible)
- 📱 Responsive design with clean white UI
- 🎨 Minimal design inspired by modern UI components
- 🚀 Single-page application experience

## Project Structure
```
/
├── public/          # Static web files
│   ├── index.html   # Homepage with authentication
│   ├── style.css    # Stylesheet
│   ├── login.js     # Login client-side logic
│   └── register.js  # Registration client-side logic
├── server/          # Backend
│   ├── server.js    # Node.js HTTP server
│   └── schema.sql   # Database schema
├── package.json     # Dependencies
└── README.md        # This file
```

## Database Configuration
Default connection (update in server/server.js if different):
- User: system
- Password: admin1234
- Connect String: localhost:1521/ORCL

**Note:** The connect string format for Oracle 11g is typically `hostname:port:SID` where SID is usually `ORCL` or `XE`. Make sure your Oracle listener is running and accessible.

**Troubleshooting:**
- If you get connection errors, verify Oracle Database is running
- Check that Oracle Instant Client is properly installed and in PATH
- Ensure the connect string matches your Oracle configuration
- Try using SQL*Plus to test the connection: `sqlplus system/admin1234@localhost:1521/ORCL`

## Testing
The Selenium tests cover:
- Homepage loading
- User registration
- Login with valid credentials
- Login with invalid credentials

Run tests after starting the server.