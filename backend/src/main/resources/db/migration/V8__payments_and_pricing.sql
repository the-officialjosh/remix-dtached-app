-- V8: Phase 4 — Payments & Verification

CREATE TABLE IF NOT EXISTS pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    player_id BIGINT,
    team_id BIGINT,
    pricing_tier_id BIGINT REFERENCES pricing_tiers(id),
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_type VARCHAR(30) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Seed pricing tiers
INSERT INTO pricing_tiers (name, description, price_cents, currency) VALUES
    ('FREE',        'Free tier — basic access',                     0,    'CAD'),
    ('PLAYER_CARD', 'Player Card — verified status + digital card', 999,  'CAD'),
    ('TEAM_ENTRY',  'Team Tournament Entry — all members verified', 4500, 'CAD')
ON CONFLICT (name) DO NOTHING;
