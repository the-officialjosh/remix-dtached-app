-- Add email confirmation and make role nullable for post-login selection
ALTER TABLE users ADD COLUMN email_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN confirmation_token VARCHAR(64);
ALTER TABLE users ADD COLUMN confirmation_expires_at TIMESTAMP;
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT NULL;
