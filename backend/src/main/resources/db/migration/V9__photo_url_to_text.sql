-- V9: Change photo_url columns from VARCHAR(500) to TEXT to support base64 data URLs
ALTER TABLE users ALTER COLUMN photo_url TYPE TEXT;
ALTER TABLE players ALTER COLUMN photo_url TYPE TEXT;
ALTER TABLE players ALTER COLUMN player_photo_url TYPE TEXT;
