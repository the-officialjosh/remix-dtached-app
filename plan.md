# Dtached Tournament Platform — Project Plan

## Architecture

```
Frontend (React/Vite/Tailwind) → Nginx → Backend (Spring Boot) → PostgreSQL
                                         ↕
                                    JWT Auth + Flyway Migrations
```

---

## Default Users

| Email | Password | Role |
|-------|----------|------|
| `admin@dtached.com` | `admin123` | ADMIN |
| `coach.carter@dtached.com` | `password` | COACH |
| `coach.prime@dtached.com` | `password` | COACH |
| `coach.sarah@dtached.com` | `password` | COACH |
| `coach.kelly@dtached.com` | `password` | COACH |

---

## Role System

| Role | Scope | Permissions |
|------|-------|------------|
| **Admin** | Global | Full access — dashboard, all teams/players/games, manage staff |
| **Staff** | Global | Manage livestream, update scores, upload media |
| **Coach** | Team | Lock roster, edit team, invite players, manage requests |
| **Team Manager** | Team | Logistics, not roster decisions |
| **Player** | Self | Register, view profile, accept team invites |

---

## Database (8 Tables)

`Users` · `Teams` · `Players` · `Team_Staff` · `Games` · `Media` · `Team_Requests` · `Team_Invites`

Supporting tables: `Team_Needs`

**Migrations:** V1 (init schema) → V2 (possession FK) → V3 (email confirmation) → V4 (team invites + is_verified)

---

## API Endpoints (~30)

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard?type=` | Player stats by tournament type |
| GET | `/api/teams?type=` | Team standings |
| GET | `/api/games?type=` | Games by type |
| GET | `/api/media?player_id=` | Player/team media |
| GET | `/api/players/free-agents?position=` | Browse free agents |
| GET | `/api/teams/{id}/needs` | Team position needs |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/auth/confirm?token=` | Confirm email |
| POST | `/api/auth/select-role` | Choose role after registration |
| POST | `/api/auth/resend-confirmation` | Resend email confirmation |

### Player
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/players/register` | Register player profile |
| GET | `/api/players/me` | Own player profile |
| POST | `/api/players/verify` | Verify player identity |
| GET | `/api/invites/{code}/accept` | Accept team invite |
| GET/PUT | `/api/my/profile` | Get/update profile |
| GET | `/api/my/player` | Own player details |
| GET | `/api/my/requests` | Incoming team requests |

### Coach / Team Manager
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams/register` | Register new team (→ PENDING) |
| GET | `/api/my/team` | Own team + roster |
| PUT | `/api/my/team/roster/lock` | Lock roster |
| POST | `/api/players/confirm-jersey` | Confirm jersey assignment |
| POST | `/api/team-requests/{playerId}` | Send request to player |
| PUT | `/api/team-requests/{id}/accept` | Accept request |
| PUT | `/api/team-requests/{id}/reject` | Reject request |
| POST | `/api/teams/{id}/invite` | Send email invite (unique code) |
| GET | `/api/teams/{id}/invites` | View team's invites |
| POST | `/api/teams/{id}/needs` | Add position need |
| DELETE | `/api/team-needs/{id}` | Remove position need |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats overview |
| GET | `/api/admin/teams` | All teams with status |
| PUT | `/api/admin/teams/{id}/approve` | Approve team (generates invite code) |
| PUT | `/api/admin/teams/{id}/reject` | Reject team |
| PUT | `/api/admin/players/{id}` | Edit player |
| POST | `/api/admin/games` | Create/update game |
| POST | `/api/admin/stats/update` | Update player stats |
| GET | `/api/admin/team-needs` | View all team needs |

### Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/staff/games/{id}/livestream` | Update stream URL + live scores |
| POST | `/api/staff/media` | Upload media (photo/video URL) |

---

## Registration Flows

### Flow A — Team First
1. Coach registers → selects COACH role
2. Coach creates team (`POST /api/teams/register`) → status = PENDING
3. Admin approves team → invite code generated
4. Coach shares invite code → players join via code during registration

### Flow B — Player First (Free Agent)
1. Player registers → creates player profile (status = FREE_AGENT)
2. Coaches browse free agents (`GET /api/players/free-agents`)
3. Coach sends request (`POST /api/team-requests/{playerId}`)
4. Player accepts → joins team

### Flow C — Team Needs
1. Coach submits position needs (`POST /api/teams/{id}/needs`)
2. Admin views all needs (`GET /api/admin/team-needs`)
3. Admin connects teams with available free agents

---

## Build Phases (All Complete ✅)

| Phase | What | Status |
|-------|------|--------|
| **0** | Docker + PostgreSQL + Dockerfiles | ✅ |
| **1** | Schema, entities, repos, enums | ✅ |
| **2** | Public endpoints + data seeder | ✅ |
| **3** | Auth (register/login/JWT/email/role) | ✅ |
| **4** | Profile API + player registration | ✅ |
| **5** | Coach features (team, roster, requests) | ✅ |
| **6** | Admin dashboard + team approval | ✅ |
| **7** | Staff livestream + media | ✅ |
| **V3 Gaps** | Team invites, team needs, player verify | ✅ |

---

## Deferred

- **SendGrid** — emails logged to console in dev
- **Event registration form** — pre-fill for logged-in users
