const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const oracledb = require('oracledb');

// Configure node-oracledb to use Thick mode for Oracle 11g compatibility
// You need to install Oracle Instant Client and set the path below
try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_HOME || 'C:\\instantclient_23_9' });
} catch (err) {
    console.log('Oracle Instant Client not found. Please install it and set ORACLE_HOME environment variable.');
    console.log('Download from: https://www.oracle.com/database/technologies/instant-client/downloads.html');
}

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');

// Simple in-memory session store
const sessions = new Map();

// Helper function to parse cookies
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = value;
        });
    }
    return cookies;
}

// Helper function to generate session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Helper function to get user from session
function getUserFromSession(sessionId) {
    const session = sessions.get(sessionId);
    return session ? session.username : null;
}

// Oracle DB connection config
const dbConfig = {
    user: 'system',
    password: 'admin1234',
    connectString: 'localhost:1521/ORCL'
};

// Connect to Oracle DB
async function initializeDatabase() {
    let connection;
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connected to Oracle database');

        // Create table if it doesn't exist (Oracle 11g compatible)
        connection = await oracledb.getConnection();
        await connection.execute(`
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE users (
                    id NUMBER PRIMARY KEY,
                    username VARCHAR2(50) UNIQUE NOT NULL,
                    email VARCHAR2(100) UNIQUE NOT NULL,
                    password VARCHAR2(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN
                        RAISE;
                    END IF;
            END;
        `, [], { autoCommit: true });

        // Create sequence for ID generation
        await connection.execute(`
            BEGIN
                EXECUTE IMMEDIATE 'CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN
                        RAISE;
                    END IF;
            END;
        `, [], { autoCommit: true });
        console.log('Users table ready');
    } catch (err) {
        console.error('Database initialization failed:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// Helper function to serve static files
function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Helper function to parse POST data
function parsePostData(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (err) {
            callback(err);
        }
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    if (req.method === 'GET') {
        if (pathname === '/' || pathname === '/index.html') {
            // Check for session
            const cookies = parseCookies(req.headers.cookie);
            const sessionId = cookies.sessionId;
            const username = getUserFromSession(sessionId);

            if (username) {
                // Serve personalized dashboard
                const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SE Lab Final - Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main>
        <div class="branding">
            <img src="ius-logo.png" alt="IUS Logo" class="logo">
            <h1>Welcome Back!</h1>
            <p class="subtitle">Hello, ${username}</p>
        </div>

        <div class="dashboard">
            <div class="welcome-card">
                <h2>🎉 Login Successful!</h2>
                <p>You are now logged in to the SE Lab Final Project system.</p>
                <p>This application demonstrates user authentication with Oracle database connectivity.</p>
                <button onclick="logout()" class="logout-btn">Logout</button>
            </div>
        </div>
    </main>

    <script>
        function logout() {
            window.location.href = '/logout';
        }
    </script>
</body>
</html>`;
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            } else {
                // Serve login/registration homepage
                serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html');
            }
        } else if (pathname === '/style.css') {
            serveStaticFile(res, path.join(PUBLIC_DIR, 'style.css'), 'text/css');
        } else if (pathname === '/register.html' || pathname === '/login.html') {
            // Redirect to homepage for authentication
            res.writeHead(302, { 'Location': '/' });
            res.end();
        } else if (pathname === '/register.js') {
            serveStaticFile(res, path.join(PUBLIC_DIR, 'register.js'), 'application/javascript');
        } else if (pathname === '/login.js') {
            serveStaticFile(res, path.join(PUBLIC_DIR, 'login.js'), 'application/javascript');
        } else if (pathname === '/ius-logo.png') {
            serveStaticFile(res, path.join(PUBLIC_DIR, 'ius-logo.png'), 'image/png');
        } else if (pathname === '/logout') {
            // Handle logout
            const cookies = parseCookies(req.headers.cookie);
            const sessionId = cookies.sessionId;
            if (sessionId) {
                sessions.delete(sessionId);
            }
            res.writeHead(302, {
                'Location': '/',
                'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0'
            });
            res.end();
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
        return;
    }

    // Handle POST requests
    if (req.method === 'POST') {
        if (pathname === '/register') {
            parsePostData(req, async (err, data) => {
                if (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid JSON' }));
                    return;
                }

                const { username, email, password } = data;
                let connection;

                try {
                    connection = await oracledb.getConnection();
                    // Get next sequence value for ID
                    const seqResult = await connection.execute(
                        `SELECT users_seq.NEXTVAL FROM dual`,
                        [],
                        { outFormat: oracledb.OUT_FORMAT_OBJECT }
                    );
                    const userId = seqResult.rows[0].NEXTVAL;

                    const result = await connection.execute(
                        `INSERT INTO users (id, username, email, password) VALUES (:id, :username, :email, :password)`,
                        [userId, username, email, password],
                        { autoCommit: true }
                    );
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User registered successfully' }));
                } catch (error) {
                    if (error.errorNum === 1) { // ORA-00001: unique constraint violated
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Username or email already exists' }));
                    } else {
                        console.error(error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Registration failed' }));
                    }
                } finally {
                    if (connection) {
                        try {
                            await connection.close();
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            });
        } else if (pathname === '/login') {
            parsePostData(req, async (err, data) => {
                if (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid JSON' }));
                    return;
                }

                const { username, password } = data;
                let connection;

                try {
                    connection = await oracledb.getConnection();
                    const result = await connection.execute(
                        `SELECT * FROM users WHERE username = :username AND password = :password`,
                        [username, password]
                    );

                    if (result.rows.length > 0) {
                        // Create session
                        const sessionId = generateSessionId();
                        sessions.set(sessionId, { username });

                        // Set session cookie
                        res.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=3600`
                        });
                        res.end(JSON.stringify({
                            message: 'Login successful',
                            redirect: '/?loggedin=true'
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Invalid username or password' }));
                    }
                } catch (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Login failed' }));
                } finally {
                    if (connection) {
                        try {
                            await connection.close();
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
        return;
    }

    res.writeHead(405);
    res.end('Method not allowed');
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    initializeDatabase();
});