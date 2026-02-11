const pool = require('../config/database');

// Get complete hierarchy for a client
const getClientHierarchy = async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.description,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', comp.id,
            'code', comp.code,
            'name', comp.name,
            'description', comp.description,
            'location', comp.location,
            'erpSystems', (
              SELECT json_agg(
                jsonb_build_object(
                  'id', erp.id,
                  'code', erp.code,
                  'name', erp.name,
                  'description', erp.description,
                  'vendor', erp.vendor,
                  'version', erp.version,
                  'environment', erp.environment,
                  'businessFunctions', (
                    SELECT json_agg(
                      jsonb_build_object(
                        'id', bf.id,
                        'code', bf.code,
                        'name', bf.name,
                        'description', bf.description,
                        'icon', bf.icon,
                        'artifacts', (
                          SELECT jsonb_build_object(
                            'diagrams', jsonb_build_object('count', COALESCE(COUNT(*) FILTER (WHERE at.code = 'diagrams'), 0)),
                            'dataModels', jsonb_build_object('count', COALESCE(COUNT(*) FILTER (WHERE at.code = 'models'), 0)),
                            's2tMappings', jsonb_build_object('count', COALESCE(COUNT(*) FILTER (WHERE at.code = 'mappings'), 0)),
                            'dataValidations', jsonb_build_object('count', COALESCE(COUNT(*) FILTER (WHERE at.code = 'validations'), 0)),
                            'documentation', jsonb_build_object('count', COALESCE(COUNT(*) FILTER (WHERE at.code = 'documentation'), 0)),
                            'businessMetadata', jsonb_build_object('count', COALESCE(COUNT(*) FILTER (WHERE at.code = 'metadata'), 0))
                          )
                          FROM artifacts a
                          LEFT JOIN artifact_types at ON a.artifact_type_id = at.id
                          WHERE a.function_id = bf.id
                        )
                      )
                    )
                    FROM business_functions bf
                    WHERE bf.erp_id = erp.id
                  )
                )
              )
              FROM erp_systems erp
              WHERE erp.company_id = comp.id
            )
          )
        ) FILTER (WHERE comp.id IS NOT NULL) as companies
      FROM clients c
      LEFT JOIN companies comp ON c.id = comp.client_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [clientId]);

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
    console.error('Get hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hierarchy'
    });
  }
};

// Get all clients with basic company info
const getAllClientsWithCompanies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.description,
        json_agg(
          jsonb_build_object(
            'id', comp.id,
            'code', comp.code,
            'name', comp.name,
            'location', comp.location
          ) ORDER BY comp.name
        ) FILTER (WHERE comp.id IS NOT NULL) as companies
      FROM clients c
      LEFT JOIN companies comp ON c.id = comp.client_id
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({
      success: true,
      data: { clients: result.rows }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients'
    });
  }
};

module.exports = {
  getClientHierarchy,
  getAllClientsWithCompanies
};