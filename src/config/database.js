const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Database configuration:');
console.log({
  host: process.env.PGHOST || 'NOT SET',
  port: process.env.PGPORT || 'NOT SET',
  user: process.env.PGUSER || 'NOT SET',
  database: process.env.PGDATABASE || 'NOT SET',
  password: process.env.PGPASSWORD ? '✅ SET' : '❌ NOT SET'
});

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: false  // No SSL needed for internal Railway connections
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

module.exports = pool;
