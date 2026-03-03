-- V13: Coach application flow
-- Separate onboarding: players self-signup, coaches apply + admin approves

CREATE TABLE coach_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    team_name VARCHAR(255),
    league_or_org VARCHAR(255),
    city VARCHAR(255),
    social_or_website VARCHAR(500),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP
);
