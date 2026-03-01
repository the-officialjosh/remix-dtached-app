-- Dtached Tournament Platform — Initial Schema
-- This migration creates all core tables

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    photo_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'PLAYER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL DEFAULT '7v7',
    division VARCHAR(10) NOT NULL DEFAULT 'Elite',
    logo_url VARCHAR(500),
    city VARCHAR(100),
    province_state VARCHAR(100),
    bio TEXT,
    invite_code VARCHAR(20) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    gp INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    ties INT NOT NULL DEFAULT 0,
    pts INT NOT NULL DEFAULT 0,
    pf INT NOT NULL DEFAULT 0,
    pa INT NOT NULL DEFAULT 0,
    pd INT NOT NULL DEFAULT 0,
    l5 VARCHAR(20) DEFAULT ''
);

CREATE TABLE team_staff (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    team_id BIGINT NOT NULL REFERENCES teams(id),
    role VARCHAR(30) NOT NULL DEFAULT 'HEAD_COACH',
    UNIQUE(user_id, team_id)
);

CREATE TABLE players (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    team_id BIGINT REFERENCES teams(id),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    dob VARCHAR(20),
    gender VARCHAR(10),
    position VARCHAR(10),
    height VARCHAR(20),
    weight VARCHAR(20),
    city VARCHAR(100),
    province_state VARCHAR(100),
    photo_url VARCHAR(500),
    player_photo_url VARCHAR(500),
    current_program VARCHAR(200),
    event_type VARCHAR(20),
    plan_package VARCHAR(30),
    jersey_size VARCHAR(10),
    shorts_size VARCHAR(10),
    video_url VARCHAR(500),
    number INT,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE_AGENT',
    registration_status VARCHAR(20),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    jersey_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    roster_locked BOOLEAN NOT NULL DEFAULT FALSE,
    total_yards INT NOT NULL DEFAULT 0,
    total_catches INT NOT NULL DEFAULT 0,
    total_interceptions INT NOT NULL DEFAULT 0,
    total_touchdowns INT NOT NULL DEFAULT 0,
    total_pass_yards INT NOT NULL DEFAULT 0,
    total_pass_attempts INT NOT NULL DEFAULT 0,
    total_pass_completions INT NOT NULL DEFAULT 0,
    total_sacks INT NOT NULL DEFAULT 0
);

CREATE TABLE team_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id),
    player_id BIGINT NOT NULL REFERENCES players(id),
    direction VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_needs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id),
    position VARCHAR(10) NOT NULL,
    count INT NOT NULL DEFAULT 1
);

CREATE TABLE games (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    home_team_id BIGINT NOT NULL REFERENCES teams(id),
    away_team_id BIGINT NOT NULL REFERENCES teams(id),
    field VARCHAR(50),
    type VARCHAR(10) NOT NULL DEFAULT '7v7',
    start_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    home_score INT NOT NULL DEFAULT 0,
    away_score INT NOT NULL DEFAULT 0,
    possession_team_id BIGINT,
    current_down INT,
    distance VARCHAR(20),
    yard_line VARCHAR(20),
    stream_url VARCHAR(500)
);

CREATE TABLE media (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    player_id BIGINT REFERENCES players(id),
    team_id BIGINT REFERENCES teams(id),
    uploaded_by BIGINT REFERENCES users(id),
    url VARCHAR(500) NOT NULL,
    type VARCHAR(10) NOT NULL DEFAULT 'photo',
    is_premium BOOLEAN NOT NULL DEFAULT FALSE
);
