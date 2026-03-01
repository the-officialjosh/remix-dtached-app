-- V8: Seed default users for each role
-- All passwords: password123 (BCrypt encoded)
-- BCrypt hash for 'password123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_confirmed)
VALUES
    ('admin@dtached.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin',   'User',    'ADMIN',        true, true),
    ('coach@dtached.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Coach',   'Demo',    'COACH',        true, true),
    ('player@dtached.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Player',  'Demo',    'PLAYER',       true, true),
    ('manager@dtached.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Manager', 'Demo',    'TEAM_MANAGER', true, true),
    ('staff@dtached.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Staff',   'Demo',    'STAFF',        true, true)
ON CONFLICT (email) DO NOTHING;
