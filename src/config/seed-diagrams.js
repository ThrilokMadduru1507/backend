const pool = require('./database');

async function seedDiagrams() {
  try {
    console.log('🌱 Seeding sample diagrams...');

    // Get diagram artifact type
    const typeResult = await pool.query(
      "SELECT id FROM artifact_types WHERE code = 'diagrams'"
    );
    const diagramTypeId = typeResult.rows[0].id;

    // Get first business function
    const functionResult = await pool.query(
      'SELECT id FROM business_functions LIMIT 1'
    );
    
    if (functionResult.rows.length === 0) {
      console.log('⚠️  No business functions found. Run init-db.sql first.');
      process.exit(1);
    }

    const functionId = functionResult.rows[0].id;

    // Sample diagram content
    const sampleContent = {
      nodes: [
        {
          id: '1',
          type: 'entity',
          position: { x: 100, y: 100 },
          data: {
            name: 'Customer',
            description: 'Customer master data',
            columns: [
              { name: 'customer_id', type: 'INTEGER', isPrimaryKey: true, isNullable: false },
              { name: 'first_name', type: 'VARCHAR(50)', isPrimaryKey: false, isNullable: false },
              { name: 'email', type: 'VARCHAR(100)', isPrimaryKey: false, isNullable: false }
            ]
          }
        },
        {
          id: '2',
          type: 'entity',
          position: { x: 500, y: 100 },
          data: {
            name: 'Order',
            description: 'Sales orders',
            columns: [
              { name: 'order_id', type: 'INTEGER', isPrimaryKey: true, isNullable: false },
              { name: 'customer_id', type: 'INTEGER', isForeignKey: true, isNullable: false },
              { name: 'order_date', type: 'DATE', isPrimaryKey: false, isNullable: false }
            ]
          }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          type: 'relationship',
          data: {
            cardinality: '1:N',
            type: 'identifying',
            name: 'places'
          }
        }
      ]
    };

    // Insert sample diagrams
    await pool.query(`
      INSERT INTO artifacts (function_id, artifact_type_id, name, description, content, created_by, created_at, updated_at)
      VALUES 
        ($1, $2, 'Customer Order Model', 'Basic customer and order entities', $3, 1, NOW(), NOW()),
        ($4, $5, 'Financial Transactions', 'GL and AP/AR data model', $6, 1, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, [
      functionId, diagramTypeId, JSON.stringify(sampleContent),
      functionId, diagramTypeId, JSON.stringify({ nodes: [], edges: [] })
    ]);

    console.log('✅ Sample diagrams created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding diagrams:', error);
    process.exit(1);
  }
}

seedDiagrams();