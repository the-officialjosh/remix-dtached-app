-- Team invites: per-player email invites sent by coaches
CREATE TABLE IF NOT EXISTS team_invites (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id),
    invite_code VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Add is_verified default to players if missing
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
