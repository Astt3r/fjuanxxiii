-- Hardening migration: invitations table + unique index safeguard
CREATE TABLE IF NOT EXISTS invitations (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	code_hash VARCHAR(64) NOT NULL,
	email VARCHAR(255) NULL,
	role VARCHAR(32) DEFAULT 'admin',
	expires_at DATETIME NULL,
	used_at DATETIME NULL,
	created_by BIGINT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	INDEX (email),
	INDEX (expires_at)
);

-- Ensure unique index on usuarios.email (already defined at creation but enforce idempotent)
ALTER TABLE usuarios ADD UNIQUE KEY IF NOT EXISTS usuarios_email_unique (email);
-- MySQL prior to 8.0.29 doesn't support IF NOT EXISTS in ADD UNIQUE KEY; ignore duplicate error
