const pool = require('../config/database');

// Get all clients for current user
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.description,
        c.created_at,
        c.updated_at,
        u.name as created_by_name,
        COUNT(DISTINCT comp.id) as company_count
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN companies comp ON c.id = comp.client_id
      GROUP BY c.id, c.code, c.name, c.description, c.created_at, c.updated_at, u.name
      ORDER BY c.name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients'
    });
  }
};

// Get single client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        c.*,
        u.name as created_by_name,
        json_agg(
          json_build_object(
            'id', comp.id,
            'code', comp.code,
            'name', comp.name,
            'description', comp.description,
            'location', comp.location
          ) ORDER BY comp.name
        ) FILTER (WHERE comp.id IS NOT NULL) as companies
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN companies comp ON c.id = comp.client_id
      WHERE c.id = $1
      GROUP BY c.id, u.name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client'
    });
  }
};

// Create new client
const createClient = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Code and name are required'
      });
    }

    const result = await pool.query(`
      INSERT INTO clients (code, name, description, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [code, name, description, userId]);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create client error:', error);
    if (error.constraint === 'clients_code_key') {
      return res.status(400).json({
        success: false,
        message: 'Client with this code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating client'
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;

    const result = await pool.query(`
      UPDATE clients 
      SET code = $1, name = $2, description = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [code, name, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client'
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting client'
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};