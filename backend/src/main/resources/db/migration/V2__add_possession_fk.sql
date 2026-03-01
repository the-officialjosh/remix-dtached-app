-- Add foreign key constraint on possession_team_id
ALTER TABLE games ADD CONSTRAINT fk_games_possession_team
    FOREIGN KEY (possession_team_id) REFERENCES teams(id);
