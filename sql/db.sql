DROP table if EXISTS status cascade;
DROP table if EXISTS images cascade;
DROP table if EXISTS documents;

-- GENERAL TABLES
CREATE TABLE IF NOT EXISTS status (
	id INT PRIMARY KEY,
	name VARCHAR(25) UNIQUE
);

CREATE TABLE IF NOT EXISTS documents (
	id VARCHAR(100) PRIMARY KEY,

  original_name VARCHAR(120) NOT NULL,
  path VARCHAR (500) NOT NULL,

  type INT,
  name VARCHAR(120),
  description VARCHAR(100),
  person_type INT,
  rectifiable INT,
  active INT,
  rectifiable_status INT,
  competitor_path VARCHAR (500),

  status int not null,
  audit_trail JSON not null,

  CONSTRAINT fk_documents_status
    FOREIGN KEY(status) 
	  REFERENCES status(id)
);

CREATE TABLE IF NOT EXISTS images (
	id VARCHAR(100) PRIMARY KEY,
  
  original_name VARCHAR(120) NOT NULL,
  path VARCHAR (500) NOT NULL,

  status int not null,
  audit_trail JSON not null,

  CONSTRAINT fk_images_status
    FOREIGN KEY(status) 
	  REFERENCES status(id)
);

-- INSERTS
INSERT INTO status VALUES (0, 'Inactivo'), (1, 'Activo'), (2, 'Eliminado');
