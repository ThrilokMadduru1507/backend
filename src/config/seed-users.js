const bcrypt = require('bcryptjs');
const pool = require('./database');

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('password123', 10);
    const designerPassword = await bcrypt.hash('design123', 10);
    const analystPassword = await bcrypt.hash('analyst123', 10);

    // Check if users already exist
    const existingUsers = await pool.query('SELECT email FROM users WHERE email IN ($1, $2, $3)', [
      'admin@structra.com',
      'designer@structra.com',
      'analyst@structra.com'
    ]);

    if (existingUsers.rows.length > 0) {
      console.log('⚠️  Users already exist. Updating passwords...');
      
      // Update existing users instead of deleting
      await pool.query(`
        UPDATE users SET password = $1 WHERE email = 'admin@structra.com'
      `, [adminPassword]);
      
      await pool.query(`
        UPDATE users SET password = $1 WHERE email = 'designer@structra.com'
      `, [designerPassword]);
      
      await pool.query(`
        UPDATE users SET password = $1 WHERE email = 'analyst@structra.com'
      `, [analystPassword]);

      console.log('✅ User passwords updated successfully!');
    } else {
      // Insert new users
      await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES
          ($1, $2, $3, $4),
          ($5, $6, $7, $8),
          ($9, $10, $11, $12)
      `, [
        'Admin User', 'admin@structra.com', adminPassword, 'Administrator',
        'Designer User', 'designer@structra.com', designerPassword, 'Designer',
        'Analyst User', 'analyst@structra.com', analystPassword, 'Analyst'
      ]);

      console.log('✅ Users created successfully!');
    }

    console.log('\n📋 Test Credentials:');
    console.log('  👑 admin@structra.com / password123');
    console.log('  🎨 designer@structra.com / design123');
    console.log('  📊 analyst@structra.com / analyst123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();