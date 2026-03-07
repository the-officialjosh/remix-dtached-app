-- V16: Event Registration Players mapping and slot tracking

-- Track how many slots the team purchased for this event
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS purchased_slots INTEGER NOT NULL DEFAULT 0;

-- Map which players are assigned to those slots, and who had card coverage purchased by the team
CREATE TABLE IF NOT EXISTS event_registration_players (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_registration_id BIGINT NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    card_coverage_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_registration_id, player_id)
);
