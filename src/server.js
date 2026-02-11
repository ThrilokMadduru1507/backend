const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const hierarchyRoutes = require('./routes/hierarchyRoutes');
const diagramRoutes = require('./routes/diagramRoutes');

const app = express();

// Initialize database on startup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query(`
  CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'Designer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS clients (id SERIAL PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS companies (id SERIAL PRIMARY KEY, client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE, code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, location VARCHAR(255), created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(client_id, code));
  CREATE TABLE IF NOT EXISTS erp_systems (id SERIAL PRIMARY KEY, company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE, code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, vendor VARCHAR(100), version VARCHAR(50), environment VARCHAR(50), created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(company_id, code));
  CREATE TABLE IF NOT EXISTS business_functions (id SERIAL PRIMARY KEY, erp_id INTEGER NOT NULL REFERENCES erp_systems(id) ON DELETE CASCADE, code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, icon VARCHAR(50), created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(erp_id, code));
  CREATE TABLE IF NOT EXISTS artifact_types (id SERIAL PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, icon VARCHAR(50));
  CREATE TABLE IF NOT EXISTS artifacts (id SERIAL PRIMARY KEY, function_id INTEGER NOT NULL REFERENCES business_functions(id) ON DELETE CASCADE, artifact_type_id INTEGER NOT NULL REFERENCES artifact_types(id), name VARCHAR(255) NOT NULL, description TEXT, content JSONB, created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@structra.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator'), ('Designer User', 'designer@structra.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Designer'), ('Analyst User', 'analyst@structra.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Analyst') ON CONFLICT (email) DO NOTHING;
`).then(() => console.log('✅ Database initialized')).catch(err => console.error('❌ DB Error:', err));

// Middleware
app.use(cors({
  origin: ['https://structra-eight.vercel.app', process.env.CLIENT_URL || '*'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/diagrams', diagramRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Structra API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Structra API running on port ${PORT}`);
});

module.exports = app;
