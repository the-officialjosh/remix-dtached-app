import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("tournament.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT DEFAULT '7v7', -- '7v7' or 'Flag'
    division TEXT DEFAULT 'Elite', -- 'Elite', '16U', '14U'
    logo TEXT,
    coach_name TEXT,
    coach_photo TEXT,
    gp INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    pts INTEGER DEFAULT 0,
    pf INTEGER DEFAULT 0,
    pa INTEGER DEFAULT 0,
    pd INTEGER DEFAULT 0,
    l5 TEXT DEFAULT '',
    city TEXT,
    province_state TEXT,
    bio TEXT,
    coach_id TEXT -- User ID of the coach
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    name TEXT NOT NULL,
    number INTEGER,
    position TEXT,
    height TEXT,
    weight TEXT,
    city TEXT,
    province_state TEXT,
    instagram TEXT,
    photo TEXT,
    is_premium BOOLEAN DEFAULT 0,
    dob TEXT,
    gender TEXT, -- 'Boy', 'Girl'
    is_verified INTEGER DEFAULT 0,
    registration_status TEXT DEFAULT 'manual', -- 'manual', 'pending', 'accepted'
    pending_team_name TEXT,
    pending_category TEXT,
    jersey_confirmed INTEGER DEFAULT 0,
    linked_user_id TEXT, -- Simulates account linking
    FOREIGN KEY(team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS roster_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    team_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player_id) REFERENCES players(id),
    FOREIGN KEY(team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    game_id INTEGER,
    yards INTEGER DEFAULT 0,
    catches INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    touchdowns INTEGER DEFAULT 0,
    pass_yards INTEGER DEFAULT 0,
    pass_attempts INTEGER DEFAULT 0,
    pass_completions INTEGER DEFAULT 0,
    sacks INTEGER DEFAULT 0,
    FOREIGN KEY(player_id) REFERENCES players(id)
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team_id INTEGER,
    away_team_id INTEGER,
    field TEXT,
    type TEXT DEFAULT '7v7', -- '7v7' or 'Flag'
    start_time DATETIME,
    status TEXT DEFAULT 'scheduled', -- scheduled, live, finished
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    possession_team_id INTEGER,
    current_down INTEGER DEFAULT 1,
    distance TEXT DEFAULT '10',
    yard_line TEXT DEFAULT 'Own 20',
    stream_url TEXT,
    FOREIGN KEY(home_team_id) REFERENCES teams(id),
    FOREIGN KEY(away_team_id) REFERENCES teams(id),
    FOREIGN KEY(possession_team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    team_id INTEGER,
    url TEXT NOT NULL,
    type TEXT, -- photo, video
    is_premium BOOLEAN DEFAULT 1,
    FOREIGN KEY(player_id) REFERENCES players(id),
    FOREIGN KEY(team_id) REFERENCES teams(id)
  );
`);

// Migration: Ensure new columns exist in existing tables
const migrations = [
  { table: 'teams', column: 'coach_name', type: 'TEXT' },
  { table: 'teams', column: 'coach_photo', type: 'TEXT' },
  { table: 'teams', column: 'division', type: 'TEXT DEFAULT "Elite"' },
  { table: 'teams', column: 'city', type: 'TEXT' },
  { table: 'teams', column: 'province_state', type: 'TEXT' },
  { table: 'teams', column: 'bio', type: 'TEXT' },
  { table: 'teams', column: 'coach_id', type: 'TEXT' },
  { table: 'players', column: 'linked_user_id', type: 'TEXT' },
  { table: 'players', column: 'dob', type: 'TEXT' },
  { table: 'players', column: 'gender', type: 'TEXT' },
  { table: 'players', column: 'is_verified', type: 'INTEGER DEFAULT 0' },
  { table: 'players', column: 'registration_status', type: 'TEXT DEFAULT "manual"' },
  { table: 'players', column: 'pending_team_name', type: 'TEXT' },
  { table: 'players', column: 'pending_category', type: 'TEXT' },
  { table: 'players', column: 'jersey_confirmed', type: 'INTEGER DEFAULT 0' },
  { table: 'games', column: 'possession_team_id', type: 'INTEGER' },
  { table: 'games', column: 'current_down', type: 'INTEGER DEFAULT 1' },
  { table: 'games', column: 'distance', type: 'TEXT DEFAULT "10"' },
  { table: 'games', column: 'yard_line', type: 'TEXT DEFAULT "Own 20"' },
  { table: 'games', column: 'stream_url', type: 'TEXT' },
  { table: 'stats', column: 'pass_yards', type: 'INTEGER DEFAULT 0' },
  { table: 'stats', column: 'pass_attempts', type: 'INTEGER DEFAULT 0' },
  { table: 'stats', column: 'pass_completions', type: 'INTEGER DEFAULT 0' },
  { table: 'stats', column: 'sacks', type: 'INTEGER DEFAULT 0' },
  { table: 'media', column: 'player_id', type: 'INTEGER' },
  { table: 'media', column: 'team_id', type: 'INTEGER' },
];

migrations.forEach(({ table, column, type }) => {
  try {
    db.prepare(`SELECT ${column} FROM ${table} LIMIT 1`).get();
  } catch (e) {
    try {
      console.log(`Adding '${column}' column to ${table}...`);
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    } catch (err) {
      console.error(`Failed to add ${column} to ${table}:`, err);
    }
  }
});

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // API Routes
  app.get("/api/teams", (req, res) => {
    const type = req.query.type;
    let query = "SELECT * FROM teams";
    let params: any[] = [];
    if (type) {
      query += " WHERE type = ?";
      params.push(type);
    }
    const teams = db.prepare(query).all(...params);
    
    // Attach roster to each team
    const teamsWithRoster = teams.map(team => {
      const roster = db.prepare("SELECT * FROM players WHERE team_id = ?").all((team as any).id);
      return { ...team, roster };
    });
    
    res.json(teamsWithRoster);
  });

  app.get("/api/media", (req, res) => {
    const { player_id, team_id } = req.query;
    let query = "SELECT * FROM media WHERE 1=1";
    let params: any[] = [];
    
    if (player_id) {
      query += " AND player_id = ?";
      params.push(player_id);
    }
    if (team_id) {
      query += " AND team_id = ?";
      params.push(team_id);
    }
    
    const media = db.prepare(query).all(...params);
    res.json(media);
  });

  app.get("/api/players", (req, res) => {
    const type = req.query.type;
    let query = `
      SELECT p.*, t.name as team_name, t.type as team_type
      FROM players p 
      JOIN teams t ON p.team_id = t.id
    `;
    let params: any[] = [];
    if (type) {
      query += " WHERE t.type = ?";
      params.push(type);
    }
    const players = db.prepare(query).all(...params);
    res.json(players);
  });

  app.post("/api/players/register", (req, res) => {
  const { name, dob, gender, height, weight, city, province_state, position, photo, has_team, team_name, category, linked_user_id, number } = req.body;
  
  const result = db.prepare(`
    INSERT INTO players (name, dob, gender, height, weight, city, province_state, position, photo, registration_status, pending_team_name, pending_category, linked_user_id, number, jersey_confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 0)
  `).run(name, dob, gender, height, weight, city, province_state, position, photo, team_name, category, linked_user_id, number);

  const playerId = result.lastInsertRowid;

  // If they have a team, we could automatically create a roster request if the team exists
  if (has_team && team_name) {
    const team = db.prepare("SELECT id FROM teams WHERE name = ?").get(team_name) as { id: number } | undefined;
    if (team) {
      db.prepare("INSERT INTO roster_requests (player_id, team_id) VALUES (?, ?)").run(playerId, team.id);
    }
  }

  res.json({ success: true, playerId });
});

app.post("/api/players/verify", (req, res) => {
  const { player_id } = req.body;
  db.prepare("UPDATE players SET is_verified = 1 WHERE id = ?").run(player_id);
  res.json({ success: true });
});

app.get("/api/roster-requests", (req, res) => {
  const { coach_id } = req.query;
  const requests = db.prepare(`
    SELECT rr.*, p.name as player_name, p.photo as player_photo, p.position, p.gender, t.name as team_name
    FROM roster_requests rr
    JOIN players p ON rr.player_id = p.id
    JOIN teams t ON rr.team_id = t.id
    WHERE t.coach_id = ? AND rr.status = 'pending'
  `).all(coach_id);
  res.json(requests);
});

app.post("/api/roster-requests/handle", (req, res) => {
  const { request_id, status } = req.body; // status: 'accepted' or 'rejected'
  
  const request = db.prepare("SELECT * FROM roster_requests WHERE id = ?").get(request_id) as any;
  if (!request) return res.status(404).json({ error: "Request not found" });

  if (status === 'accepted') {
    const player = db.prepare("SELECT gender FROM players WHERE id = ?").get(request.player_id) as { gender: string };
    const team = db.prepare("SELECT type FROM teams WHERE id = ?").get(request.team_id) as { type: string };
    
    // Check roster limits
    const currentRosterCount = db.prepare("SELECT COUNT(*) as count FROM players WHERE team_id = ?").get(request.team_id) as { count: number };
    const limit = player.gender === 'Girl' ? 12 : 15;

    if (currentRosterCount.count >= limit) {
      return res.status(400).json({ error: `Roster limit reached (${limit} for ${player.gender}s)` });
    }

    db.prepare("UPDATE players SET team_id = ?, registration_status = 'accepted' WHERE id = ?").run(request.team_id, request.player_id);
  }

  db.prepare("UPDATE roster_requests SET status = ? WHERE id = ?").run(status, request_id);
  res.json({ success: true });
});

app.post("/api/players/confirm-jersey", (req, res) => {
  const { player_id, number } = req.body;
  db.prepare("UPDATE players SET number = ?, jersey_confirmed = 1 WHERE id = ?").run(number, player_id);
  res.json({ success: true });
});

app.get("/api/leaderboard", (req, res) => {
    const type = req.query.type;
    let query = `
      SELECT p.*, t.name as team_name, t.type as team_type, t.division as team_division,
             SUM(s.yards) as total_yards,
             SUM(s.catches) as total_catches,
             SUM(s.interceptions) as total_interceptions,
             SUM(s.touchdowns) as total_touchdowns,
             SUM(s.pass_yards) as total_pass_yards,
             SUM(s.pass_attempts) as total_pass_attempts,
             SUM(s.pass_completions) as total_pass_completions,
             SUM(s.sacks) as total_sacks
      FROM players p
      JOIN teams t ON p.team_id = t.id
      LEFT JOIN stats s ON p.id = s.player_id
    `;
    let params: any[] = [];
    if (type) {
      query += " WHERE t.type = ?";
      params.push(type);
    }
    query += " GROUP BY p.id ORDER BY total_touchdowns DESC, total_yards DESC";
    const leaderboard = db.prepare(query).all(...params);
    res.json(leaderboard);
  });

  app.get("/api/games", (req, res) => {
    const type = req.query.type;
    let query = `
      SELECT g.*, t1.name as home_team, t2.name as away_team
      FROM games g
      JOIN teams t1 ON g.home_team_id = t1.id
      JOIN teams t2 ON g.away_team_id = t2.id
    `;
    let params: any[] = [];
    if (type) {
      query += " WHERE g.type = ?";
      params.push(type);
    }
    query += " ORDER BY start_time ASC";
    const games = db.prepare(query).all(...params);
    res.json(games);
  });

  app.post("/api/stats/update", (req, res) => {
    const { player_id, game_id, yards, catches, interceptions, touchdowns, pass_yards, pass_attempts, pass_completions, sacks } = req.body;
    
    const existing = db.prepare("SELECT id FROM stats WHERE player_id = ? AND game_id = ?").get(player_id, game_id);
    
    if (existing) {
      db.prepare(`
        UPDATE stats 
        SET yards = yards + ?, catches = catches + ?, interceptions = interceptions + ?, touchdowns = touchdowns + ?,
            pass_yards = pass_yards + ?, pass_attempts = pass_attempts + ?, pass_completions = pass_completions + ?,
            sacks = sacks + ?
        WHERE id = ?
      `).run(yards, catches, interceptions, touchdowns, pass_yards || 0, pass_attempts || 0, pass_completions || 0, sacks || 0, (existing as any).id);
    } else {
      db.prepare(`
        INSERT INTO stats (player_id, game_id, yards, catches, interceptions, touchdowns, pass_yards, pass_attempts, pass_completions, sacks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(player_id, game_id, yards, catches, interceptions, touchdowns, pass_yards || 0, pass_attempts || 0, pass_completions || 0, sacks || 0);
    }

    const updatedStats = db.prepare(`
      SELECT p.name, SUM(s.yards) as yards, SUM(s.touchdowns) as touchdowns
      FROM players p JOIN stats s ON p.id = s.player_id
      WHERE p.id = ?
    `).get(player_id);

    broadcast({ type: "STATS_UPDATED", data: updatedStats });
    res.json({ success: true });
  });

  app.post("/api/teams", (req, res) => {
    const { id, name, type, division, coach_name, city, province_state, bio } = req.body;
    if (id) {
      db.prepare(`
        UPDATE teams SET name = ?, type = ?, division = ?, coach_name = ?, city = ?, province_state = ?, bio = ?
        WHERE id = ?
      `).run(name, type, division, coach_name, city, province_state, bio, id);
    } else {
      db.prepare(`
        INSERT INTO teams (name, type, division, coach_name, city, province_state, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(name, type, division, coach_name, city, province_state, bio);
    }
    res.json({ success: true });
  });

  app.post("/api/players", (req, res) => {
    const { id, team_id, name, number, position, height, weight, city, province_state, dob, gender, jersey_confirmed } = req.body;
    if (id) {
      db.prepare(`
        UPDATE players SET team_id = ?, name = ?, number = ?, position = ?, height = ?, weight = ?, city = ?, province_state = ?, dob = ?, gender = ?, jersey_confirmed = ?
        WHERE id = ?
      `).run(team_id, name, number, position, height, weight, city, province_state, dob, gender, jersey_confirmed, id);
    } else {
      db.prepare(`
        INSERT INTO players (team_id, name, number, position, height, weight, city, province_state, dob, gender, jersey_confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(team_id, name, number, position, height, weight, city, province_state, dob, gender, jersey_confirmed || 0);
    }
    res.json({ success: true });
  });

  app.post("/api/games", (req, res) => {
    const { id, home_team_id, away_team_id, field, type, start_time, status, home_score, away_score } = req.body;
    if (id) {
      db.prepare(`
        UPDATE games SET home_team_id = ?, away_team_id = ?, field = ?, type = ?, start_time = ?, status = ?, home_score = ?, away_score = ?
        WHERE id = ?
      `).run(home_team_id, away_team_id, field, type, start_time, status, home_score, away_score, id);
    } else {
      db.prepare(`
        INSERT INTO games (home_team_id, away_team_id, field, type, start_time, status, home_score, away_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(home_team_id, away_team_id, field, type, start_time, status || 'scheduled', home_score || 0, away_score || 0);
    }
    res.json({ success: true });
  });

  // Proxy unmapped /api routes to Spring Boot backend (Docker)
  app.use("/api", async (req, res, next) => {
    const backendUrl = `http://localhost:8080${req.originalUrl}`;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (req.headers.authorization) headers["Authorization"] = req.headers.authorization as string;
      const fetchOpts: any = { method: req.method, headers };
      if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
        fetchOpts.body = JSON.stringify(req.body);
      }
      const upstream = await fetch(backendUrl, fetchOpts);
      res.status(upstream.status);
      upstream.headers.forEach((v, k) => { if (k !== "transfer-encoding") res.setHeader(k, v); });
      const text = await upstream.text();
      res.send(text);
    } catch (e: any) {
      // Backend not reachable — fall through
      console.error(`[proxy] ${req.method} ${req.originalUrl} → backend error:`, e.message);
      res.status(502).json({ error: "Backend not reachable" });
    }
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Seed data if empty
  const teamCount = db.prepare("SELECT COUNT(*) as count FROM teams").get() as any;
  if (teamCount.count === 0) {
    console.log("Seeding database...");
    
    // Boys 7v7 Teams
    const team1 = db.prepare("INSERT INTO teams (name, type, division, coach_name, coach_photo, gp, wins, losses, ties, pts, pf, pa, pd, l5, city, province_state, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      "Titans", "7v7", "Elite", "Coach Carter", "https://picsum.photos/seed/coach1/200/200", 5, 4, 1, 0, 8, 120, 85, 35, "W-W-L-W-W", "Toronto", "ON", "The Titans are a premier 7v7 program focused on developing elite skill position players."
    ).lastInsertRowid;
    const team2 = db.prepare("INSERT INTO teams (name, type, division, coach_name, coach_photo, gp, wins, losses, ties, pts, pf, pa, pd, l5, city, province_state, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      "Warriors", "7v7", "16U", "Coach Prime", "https://picsum.photos/seed/coach2/200/200", 5, 3, 2, 0, 6, 110, 95, 15, "L-W-W-L-W", "Hamilton", "ON", "Building champions on and off the field through discipline and hard work."
    ).lastInsertRowid;

    // Girls Flag Teams
    const team3 = db.prepare("INSERT INTO teams (name, type, division, coach_name, coach_photo, gp, wins, losses, ties, pts, pf, pa, pd, l5, city, province_state, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      "Valkyries", "Flag", "Elite", "Coach Sarah", "https://picsum.photos/seed/coach3/200/200", 4, 4, 0, 0, 8, 90, 20, 70, "W-W-W-W", "Ottawa", "ON", "The Valkyries represent the next generation of female athletes in competitive flag football."
    ).lastInsertRowid;
    const team4 = db.prepare("INSERT INTO teams (name, type, division, coach_name, coach_photo, gp, wins, losses, ties, pts, pf, pa, pd, l5, city, province_state, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      "Sirens", "Flag", "14U", "Coach Kelly", "https://picsum.photos/seed/coach4/200/200", 4, 2, 2, 0, 4, 60, 65, -5, "L-W-L-W", "Toronto", "ON", "Fast, agile, and determined. The Sirens are making waves in the 14U division."
    ).lastInsertRowid;
    
    // Players
    const p1 = db.prepare("INSERT INTO players (team_id, name, number, position, height, weight, city, province_state, instagram, linked_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      team1, "John Doe", 12, "QB", "6'2\"", "210 lbs", "Toronto", "ON", "@johndoe_qb", "user_123"
    ).lastInsertRowid;
    
    // Stats for QB
    db.prepare("INSERT INTO stats (player_id, game_id, pass_yards, pass_attempts, pass_completions, touchdowns, sacks) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      p1, 1, 250, 30, 22, 3, 0
    );
    db.prepare("INSERT INTO players (team_id, name, number, position, height, weight, city, province_state, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      team1, "Mike Smith", 88, "WR", "6'0\"", "195 lbs", "Hamilton", "ON", "@mikesmith_wr"
    );
    db.prepare("INSERT INTO players (team_id, name, number, position, height, weight, city, province_state, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      team3, "Sarah Connor", 7, "DB", "5'9\"", "160 lbs", "Ottawa", "ON", "@sarah_db"
    );
    // Add some sacks for Sarah
    db.prepare("INSERT INTO stats (player_id, game_id, sacks, interceptions) VALUES (?, ?, ?, ?)").run(
      3, 1, 4, 2
    );
    db.prepare("INSERT INTO players (team_id, name, number, position, height, weight, city, province_state, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      team4, "Jane Doe", 10, "WR", "5'7\"", "145 lbs", "Toronto", "ON", "@janedoe_flag"
    );

    // Media
    db.prepare("INSERT INTO media (player_id, team_id, url, type, is_premium) VALUES (?, ?, ?, ?, ?)").run(
      p1, team1, "https://picsum.photos/seed/p1_1/800/800", "photo", 1
    );
    db.prepare("INSERT INTO media (team_id, url, type, is_premium) VALUES (?, ?, ?, ?)").run(
      team1, "https://picsum.photos/seed/t1_1/800/800", "photo", 0
    );
    
    // Games
    db.prepare("INSERT INTO games (home_team_id, away_team_id, field, type, start_time, status, possession_team_id, current_down, distance, yard_line) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      team1, team2, "Field 1", "7v7", new Date().toISOString(), "live", team1, 1, "10", "Own 20"
    );
    db.prepare("INSERT INTO games (home_team_id, away_team_id, field, type, start_time, status, possession_team_id, current_down, distance, yard_line) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      team3, team4, "Field 3", "Flag", new Date(Date.now() + 3600000).toISOString(), "scheduled", null, 1, "10", "Own 20"
    );
  }
}

startServer();
