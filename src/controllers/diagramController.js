const pool = require('../config/database');

// Get all diagrams for a function
const getDiagramsByFunction = async (req, res) => {
  try {
    const { functionId } = req.params;

    // First, get the artifact_type_id for 'diagrams'
    const typeResult = await pool.query(
      "SELECT id FROM artifact_types WHERE code = 'diagrams'"
    );

    if (typeResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Diagram artifact type not found in database'
      });
    }

    const diagramTypeId = typeResult.rows[0].id;

    // Get all diagrams for this function
    const result = await pool.query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.content,
        a.created_at,
        a.updated_at,
        u.name as created_by_name,
        u.email as created_by_email
      FROM artifacts a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.function_id = $1 AND a.artifact_type_id = $2
      ORDER BY a.updated_at DESC
    `, [functionId, diagramTypeId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get diagrams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diagrams'
    });
  }
};

// Get single diagram by ID
const getDiagramById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.id,
        a.function_id,
        a.name,
        a.description,
        a.content,
        a.created_at,
        a.updated_at,
        u.name as created_by_name,
        u.email as created_by_email,
        bf.name as function_name,
        bf.code as function_code
      FROM artifacts a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN business_functions bf ON a.function_id = bf.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get diagram error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diagram'
    });
  }
};

// Create new diagram
const createDiagram = async (req, res) => {
  try {
    const { functionId } = req.params;
    const { name, description, content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Diagram name is required'
      });
    }

    // Get diagram artifact type ID
    const typeResult = await pool.query(
      "SELECT id FROM artifact_types WHERE code = 'diagrams'"
    );

    if (typeResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Diagram artifact type not found'
      });
    }

    const diagramTypeId = typeResult.rows[0].id;

    // Verify function exists
    const functionCheck = await pool.query(
      'SELECT id FROM business_functions WHERE id = $1',
      [functionId]
    );

    if (functionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business function not found'
      });
    }

    // Create diagram
    const result = await pool.query(`
      INSERT INTO artifacts (
        function_id, 
        artifact_type_id, 
        name, 
        description, 
        content, 
        created_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, description, content, created_at, updated_at
    `, [functionId, diagramTypeId, name, description, JSON.stringify(content || {}), userId]);

    res.status(201).json({
      success: true,
      message: 'Diagram created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create diagram error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating diagram'
    });
  }
};

// Update diagram
const updateDiagram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content } = req.body;

    // Check if diagram exists
    const checkResult = await pool.query('SELECT id FROM artifacts WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found'
      });
    }

    // Update diagram
    const result = await pool.query(`
      UPDATE artifacts 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        content = COALESCE($3, content),
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, description, content, created_at, updated_at
    `, [name, description, content ? JSON.stringify(content) : null, id]);

    res.json({
      success: true,
      message: 'Diagram updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update diagram error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating diagram'
    });
  }
};

// Delete diagram
const deleteDiagram = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM artifacts WHERE id = $1 RETURNING id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found'
      });
    }

    res.json({
      success: true,
      message: 'Diagram deleted successfully',
      data: { id: result.rows[0].id, name: result.rows[0].name }
    });
  } catch (error) {
    console.error('Delete diagram error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting diagram'
    });
  }
};

// Save diagram content (nodes + edges)
const saveDiagramContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { nodes, edges } = req.body;

    // Validate input
    if (!nodes || !edges) {
      return res.status(400).json({
        success: false,
        message: 'Nodes and edges are required'
      });
    }

    const content = { nodes, edges };

    const result = await pool.query(`
      UPDATE artifacts 
      SET content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, updated_at
    `, [JSON.stringify(content), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found'
      });
    }

    res.json({
      success: true,
      message: 'Diagram content saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Save diagram content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving diagram content'
    });
  }
};

module.exports = {
  getDiagramsByFunction,
  getDiagramById,
  createDiagram,
  updateDiagram,
  deleteDiagram,
  saveDiagramContent
};