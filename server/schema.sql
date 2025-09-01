-- Create users table for SE Lab Final project (Oracle 11g compatible)
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for ID generation
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

COMMIT;