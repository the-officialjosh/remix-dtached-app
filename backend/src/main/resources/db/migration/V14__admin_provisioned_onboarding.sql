-- V11: Admin Provisioned Team Onboarding

-- Add mandatory password reset flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Create the new team onboarding request table
CREATE TABLE team_onboarding_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    coach_first_name VARCHAR(100) NOT NULL,
    coach_last_name VARCHAR(100) NOT NULL,
    coach_email VARCHAR(100) NOT NULL,
    coach_phone VARCHAR(50),
    city VARCHAR(100),
    province_state VARCHAR(100),
    division VARCHAR(50) NOT NULL DEFAULT 'Elite',
    type VARCHAR(50) NOT NULL DEFAULT '7v7',
    requested_manager_count INTEGER NOT NULL DEFAULT 0,
    manager_details TEXT,
    notes TEXT,
    event_interest TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    provisioned_team_id BIGINT REFERENCES teams(id)
);

-- Drop the old coach applications table since it's being replaced completely
DROP TABLE IF EXISTS coach_applications;
