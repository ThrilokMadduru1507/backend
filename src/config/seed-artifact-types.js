const pool = require('./database');

async function seedArtifactTypes() {
  try {
    console.log('🌱 Seeding artifact types...');

    // Check if artifact_types table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'artifact_types'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ artifact_types table does not exist!');
      console.log('Please run init-db.sql first.');
      process.exit(1);
    }

    // Insert artifact types
    const result = await pool.query(`
      INSERT INTO artifact_types (code, name, description, icon) VALUES
        ('diagrams', 'Data Model Diagrams', 'Visual ER diagrams and data models', '📊'),
        ('models', 'Data Models', 'Structured data models and schemas', '🗂️'),
        ('mappings', 'S2T Mappings', 'Source-to-target field mappings', '🔄'),
        ('validations', 'Data Validations', 'Data quality rules and validations', '✅'),
        ('documentation', 'Documentation', 'Technical documentation and guides', '📚'),
        ('metadata', 'Business Metadata', 'Business glossary and metadata', '🏷️')
      ON CONFLICT (code) DO NOTHING
      RETURNING *
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Inserted ${result.rows.length} artifact types`);
    } else {
      console.log('ℹ️  Artifact types already exist');
    }

    // Display all artifact types
    const allTypes = await pool.query('SELECT * FROM artifact_types ORDER BY id');
    console.log('\n📋 All Artifact Types:');
    allTypes.rows.forEach(type => {
      console.log(`  ${type.icon} ${type.name} (${type.code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding artifact types:', error);
    process.exit(1);
  }
}

seedArtifactTypes();