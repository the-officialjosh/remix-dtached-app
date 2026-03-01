-- V10: Tournament Operations — Events, Divisions, Event Registrations, Fields
-- Also links games to events

CREATE TABLE tournament_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    address VARCHAR(300),
    city VARCHAR(100),
    province_state VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE,
    format VARCHAR(50) NOT NULL DEFAULT '7v7',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    max_teams INTEGER,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    banner_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_divisions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES tournament_events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age_group VARCHAR(50),
    max_teams INTEGER,
    format VARCHAR(50)
);

CREATE TABLE event_registrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES tournament_events(id),
    division_id BIGINT REFERENCES event_divisions(id),
    team_id BIGINT NOT NULL REFERENCES teams(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_id BIGINT REFERENCES payments(id),
    roster_locked BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, team_id)
);

CREATE TABLE fields (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    event_id BIGINT REFERENCES tournament_events(id),
    location VARCHAR(200),
    gps_lat DECIMAL(10,7),
    gps_lng DECIMAL(10,7),
    capacity INTEGER,
    surface_type VARCHAR(50) DEFAULT 'GRASS',
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
);

-- Link games to events and fields
ALTER TABLE games ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES tournament_events(id);
ALTER TABLE games ADD COLUMN IF NOT EXISTS division_id BIGINT REFERENCES event_divisions(id);
ALTER TABLE games ADD COLUMN IF NOT EXISTS field_id BIGINT REFERENCES fields(id);
ALTER TABLE games ADD COLUMN IF NOT EXISTS round VARCHAR(50);
