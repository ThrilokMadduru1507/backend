CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY, 
  name VARCHAR(255) NOT NULL, 
  email VARCHAR(255) UNIQUE NOT NULL, 
  password VARCHAR(255) NOT NULL, 
  role VARCHAR(50) DEFAULT 'Designer', 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY, 
  code VARCHAR(50) UNIQUE NOT NULL, 
  name VARCHAR(255) NOT NULL, 
  description TEXT, 
  created_by INTEGER REFERENCES users(id), 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS artifact_types (
  id SERIAL PRIMARY KEY, 
  code VARCHAR(50) UNIQUE NOT NULL, 
  name VARCHAR(255) NOT NULL, 
  description TEXT, 
  icon VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS artifacts (
  id SERIAL PRIMARY KEY, 
  function_id INTEGER NOT NULL REFERENCES business_functions(id) ON DELETE CASCADE, 
  artifact_type_id INTEGER NOT NULL REFERENCES artifact_types(id), 
  name VARCHAR(255) NOT NULL, 
  description TEXT, 
  content JSONB, 
  created_by INTEGER REFERENCES users(id), 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role) VALUES 
  ('Admin User', 'admin@structra.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator'), 
  ('Designer User', 'designer@structra.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Designer'), 
  ('Analyst User', 'analyst@structra.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Analyst') 
ON CONFLICT (email) DO NOTHING;
