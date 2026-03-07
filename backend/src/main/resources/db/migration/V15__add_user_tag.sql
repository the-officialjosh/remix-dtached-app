-- Add user_tag column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_tag VARCHAR(20) UNIQUE;
