-- V11: Event packages, player event registrations, event type

-- Event-specific pricing packages
CREATE TABLE event_packages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES tournament_events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    includes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

-- Individual player event registrations
CREATE TABLE player_event_registrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES tournament_events(id),
    player_id BIGINT REFERENCES players(id),
    user_id BIGINT REFERENCES users(id),
    division_id BIGINT REFERENCES event_divisions(id),
    package_id BIGINT REFERENCES event_packages(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    jersey_size VARCHAR(10),
    shorts_size VARCHAR(10),
    team_name VARCHAR(100),
    category VARCHAR(50),
    has_team BOOLEAN DEFAULT FALSE,
    video_url TEXT,
    payment_status VARCHAR(30) DEFAULT 'UNPAID',
    notes TEXT,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, player_id)
);

-- Add event_type and required_fields to tournament_events
ALTER TABLE tournament_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(30) DEFAULT 'TOURNAMENT';
ALTER TABLE tournament_events ADD COLUMN IF NOT EXISTS required_fields TEXT;
