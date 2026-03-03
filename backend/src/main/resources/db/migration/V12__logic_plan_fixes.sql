-- V12: Logic Plan Fixes
-- 1. Move roster_locked from players to teams
-- 2. Add permanent player_tag and team_tag
-- 3. Add join_via (code vs request) tracking on team_requests

-- Move roster lock to team level
ALTER TABLE teams ADD COLUMN roster_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE players DROP COLUMN IF EXISTS roster_locked;

-- Permanent tags
ALTER TABLE players ADD COLUMN player_tag VARCHAR(10) UNIQUE;
ALTER TABLE teams ADD COLUMN team_tag VARCHAR(20) UNIQUE;

-- Generate player tags for existing players
UPDATE players SET player_tag = 'PLR-' || UPPER(SUBSTRING(MD5(CAST(id AS TEXT)) FROM 1 FOR 5))
WHERE player_tag IS NULL;

-- Generate team tags for existing teams
UPDATE teams SET team_tag = 'DTX-' || UPPER(SUBSTRING(MD5(CAST(id AS TEXT)) FROM 1 FOR 5))
WHERE team_tag IS NULL;
