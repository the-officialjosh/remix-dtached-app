-- V6: Phase 1 — Stabilize Foundation
-- State machine completion + profile field gaps + password reset support

-- 1.1 Profile fields for players
ALTER TABLE players ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS school_club VARCHAR(200);
ALTER TABLE players ADD COLUMN IF NOT EXISTS open_to_offers BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(200);
ALTER TABLE players ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(30);

-- 1.1 Profile fields for teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS social_links TEXT; -- JSON string
ALTER TABLE teams ADD COLUMN IF NOT EXISTS achievements TEXT;

-- 1.3 Password reset tokens
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP;
