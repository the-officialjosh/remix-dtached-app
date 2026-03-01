-- V7: Phase 3 — Release records for player movement audit trail

CREATE TABLE IF NOT EXISTS release_records (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL,
    player_name VARCHAR(255),
    team_id BIGINT NOT NULL,
    team_name VARCHAR(255),
    released_by_user_id BIGINT NOT NULL,
    released_by_name VARCHAR(255),
    reason VARCHAR(50),
    released_at TIMESTAMP NOT NULL DEFAULT NOW()
);
