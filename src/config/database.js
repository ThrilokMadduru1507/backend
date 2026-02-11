const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Database configuration:');
console.log({
  DATABASE_URL: process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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
