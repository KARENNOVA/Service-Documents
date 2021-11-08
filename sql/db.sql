DROP table if EXISTS status cascade;
DROP table if EXISTS documents;

-- GENERAL TABLES
CREATE TABLE IF NOT EXISTS status (
	id INT PRIMARY KEY,
	name VARCHAR(25) UNIQUE
);

CREATE TABLE IF NOT EXISTS documents (
	id VARCHAR(100) PRIMARY KEY,

  type VARCHAR(120),
  name VARCHAR(120) NOT NULL,
  original_name VARCHAR(120) NOT NULL,
  path VARCHAR (2000) NOT NULL,

  status int not null,
  audit_trail JSON not null,

  CONSTRAINT fk_documents_status
    FOREIGN KEY(status) 
	  REFERENCES status(id)
);

-- INSERTS
INSERT INTO status VALUES (0, 'Inactivo'), (1, 'Activo'), (2, 'Eliminado');
