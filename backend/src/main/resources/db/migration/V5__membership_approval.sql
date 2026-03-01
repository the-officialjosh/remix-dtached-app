-- V5: Membership & Approval System
-- Add player_interests table for mutual matching
-- Expand team_requests for transfer support

CREATE TABLE player_interests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id),
    player_id BIGINT NOT NULL REFERENCES players(id),
    direction VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, player_id, direction)
);

-- Add transfer support columns to team_requests
ALTER TABLE team_requests ADD COLUMN IF NOT EXISTS request_type VARCHAR(20) NOT NULL DEFAULT 'JOIN';
ALTER TABLE team_requests ADD COLUMN IF NOT EXISTS from_team_id BIGINT REFERENCES teams(id);
