-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Designer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert test user (password is 'password123')
INSERT INTO users (name, email, password, role) 
VALUES (
    'Admin User',
    'admin@structra.com',
    '$2a$10$8ZqZ0Z0Z0Z0Z0Z0Z0Z0Z0OYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY',
    'Administrator'
) ON CONFLICT (email) DO NOTHING;