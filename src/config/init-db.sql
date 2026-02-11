-- =============================================
-- STRUCTRA DATABASE SCHEMA
-- =============================================

-- Users table (already created in Session 1)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Designer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, code)
);

-- ERP Systems table
CREATE TABLE IF NOT EXISTS erp_systems (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    vendor VARCHAR(100),
    version VARCHAR(50),
    environment VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

-- Business Functions table
CREATE TABLE IF NOT EXISTS business_functions (
    id SERIAL PRIMARY KEY,
    erp_id INTEGER NOT NULL REFERENCES erp_systems(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(erp_id, code)
);

-- Artifact Types table (reference data)
CREATE TABLE IF NOT EXISTS artifact_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

-- Artifacts table (diagrams, models, mappings, etc.)
CREATE TABLE IF NOT EXISTS artifacts (
    id SERIAL PRIMARY KEY,
    function_id INTEGER NOT NULL REFERENCES business_functions(id) ON DELETE CASCADE,
    artifact_type_id INTEGER NOT NULL REFERENCES artifact_types(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB, -- Stores diagram data, mapping data, etc.
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code);
CREATE INDEX IF NOT EXISTS idx_companies_client ON companies(client_id);
CREATE INDEX IF NOT EXISTS idx_erp_systems_company ON erp_systems(company_id);
CREATE INDEX IF NOT EXISTS idx_business_functions_erp ON business_functions(erp_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_function ON artifacts(function_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type_id);

-- Insert artifact types
INSERT INTO artifact_types (code, name, description, icon) VALUES
    ('diagrams', 'Data Model Diagrams', 'Visual ER diagrams and data models', '📊'),
    ('models', 'Data Models', 'Structured data models and schemas', '🗂️'),
    ('mappings', 'S2T Mappings', 'Source-to-target field mappings', '🔄'),
    ('validations', 'Data Validations', 'Data quality rules and validations', '✅'),
    ('documentation', 'Documentation', 'Technical documentation and guides', '📚'),
    ('metadata', 'Business Metadata', 'Business glossary and metadata', '🏷️')
ON CONFLICT (code) DO NOTHING;

-- Insert sample data
INSERT INTO users (name, email, password, role) VALUES
    ('Admin User', 'admin@structra.com', '$2a$10$rXqZ0Eq5vYVxR8mXqZ0EqOYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY', 'Administrator'),
    ('Designer User', 'designer@structra.com', '$2a$10$rXqZ0Eq5vYVxR8mXqZ0EqOYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY', 'Designer'),
    ('Analyst User', 'analyst@structra.com', '$2a$10$rXqZ0Eq5vYVxR8mXqZ0EqOYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY', 'Analyst')
ON CONFLICT (email) DO NOTHING;

-- Sample Client
INSERT INTO clients (code, name, description, created_by) VALUES
    ('ACME', 'Acme Corporation', 'Global manufacturing and retail company', 1),
    ('TECH', 'TechVentures Inc', 'Technology and innovation company', 1)
ON CONFLICT (code) DO NOTHING;

-- Sample Companies
INSERT INTO companies (client_id, code, name, description, location, created_by) VALUES
    (1, 'ACME-CORP', 'Acme Corporation', 'Parent company and headquarters', 'New York, USA', 1),
    (1, 'ACME-RETAIL', 'Acme Retail Division', 'Retail operations division', 'Los Angeles, USA', 1),
    (2, 'TECH-HQ', 'TechVentures HQ', 'Corporate headquarters', 'San Francisco, USA', 1)
ON CONFLICT (client_id, code) DO NOTHING;

-- Sample ERP Systems
INSERT INTO erp_systems (company_id, code, name, description, vendor, version, environment, created_by) VALUES
    (1, 'SAP-PROD', 'SAP S/4HANA', 'Enterprise resource planning system', 'SAP', '2023', 'Production', 1),
    (1, 'ORACLE-FIN', 'Oracle Financials', 'Financial management system', 'Oracle', '12c', 'Production', 1),
    (2, 'SAP-RETAIL', 'SAP Retail', 'Retail-specific ERP system', 'SAP', '2022', 'Production', 1)
ON CONFLICT (company_id, code) DO NOTHING;

-- Sample Business Functions
INSERT INTO business_functions (erp_id, code, name, description, icon, created_by) VALUES
    (1, 'FI', 'Financials', 'Financial accounting and reporting', '💰', 1),
    (1, 'MM', 'Materials Management', 'Procurement and inventory management', '📦', 1),
    (1, 'SD', 'Sales & Distribution', 'Order-to-cash processes', '🛒', 1),
    (1, 'HR', 'Human Resources', 'Employee and payroll management', '👥', 1)
ON CONFLICT (erp_id, code) DO NOTHING;