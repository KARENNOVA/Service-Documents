-- DROP table if EXISTS datails_user cascade;
DROP table if EXISTS documents;

CREATE TABLE IF NOT EXISTS documents (
	id VARCHAR(100) PRIMARY KEY,

  name VARCHAR(120) NOT NULL,
  original_name VARCHAR(120) NOT NULL,
  path VARCHAR (2000) NOT NULL,

  status int not null,
  audit_trail JSON not null
);