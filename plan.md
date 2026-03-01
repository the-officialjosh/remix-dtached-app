# Dtached Tournament Platform — Product Roadmap

> What's built vs what's needed to be a complete, production-grade tournament platform.

---

## ✅ What's Built (v1.0)

- Auth (register, login, JWT, email confirm, role selection)
- 5 roles (Admin, Staff, Coach, Team Manager, Player)
- Team registration + admin approval + invite codes
- Player registration + free agent browse + team requests
- Coach tools (invites, roster lock, jersey confirm, position needs)
- Admin dashboard (stats, team approval, player edit, game CRUD, stats update)
- Staff panel (livestream URL, media upload)
- Public pages (leaderboard, standings, schedule, live, media)
- Profile management
- Docker deployment (PostgreSQL, Spring Boot, Nginx)

---

## 🔴 Phase A — Tournament Engine

The core missing piece. Right now games are manually created one by one. A real tournament needs:

### A1. Event/Tournament Creation
- Create named events (e.g. "Dtached Summer Classic 2026")
- Set dates, location, venue details, registration deadline
- Set tournament format (round robin, single elim, double elim, pool play → bracket)
- Set divisions and age groups per event
- Set max teams per division
- Event-specific registration fees

### A2. Pool Play & Brackets
- Auto-generate pools (balanced by region or skill)
- Round-robin scheduling within pools
- Automatic standings calculation from results
- Tiebreaker rules (head-to-head, point differential, points against)
- Bracket generation from pool standings (top N advance)
- Single/double elimination bracket visualization
- Bye management for odd-number pools

### A3. Automated Game Scheduling
- Input: fields available, time slots, team constraints
- Output: balanced schedule (no team plays back-to-back, fair rest time)
- Conflict detection (team double-booked, field overlap)
- Reschedule / swap games
- Weather delay support (push all remaining games)

### A4. Field Management
- Define fields with names, GPS coordinates, capacity
- Map view for venue layout
- Field assignment per game
- Field condition status (playable, wet, closed)

---

## 🟡 Phase B — Game Day Experience

### B1. Live Scoring (Real-Time)
- WebSocket-powered live score updates (already have basic structure)
- Play-by-play logging (touchdown, interception, sack — with player attribution)
- Live game state (down, distance, yard line, possession, game clock)
- Push updates to all viewers watching that game
- Score submission workflow (both coaches confirm final score)

### B2. Enhanced Livestream
- Embed stream directly in game page (YouTube/Twitch iframe)
- Multi-game view (watch 2-4 games at once)
- Game highlights auto-generated from play-by-play (e.g. "TD — #7 Marcus, 45-yard catch")
- Chat/reactions during live games

### B3. Game Clock
- Configurable half/quarter length per division
- Countdown timer synced across viewers
- Timeout tracking
- Halftime indicator

---

## 🟡 Phase C — Player & Team Profiles

### C1. Rich Player Profile
- Profile photo upload (actual file upload, not just URL)
- Highlight video embed (YouTube/Hudl link)
- Stats history across events (career stats)
- Combine results (40-yard dash, shuttle, vertical)
- Awards / badges (MVP, All-Tournament, Most Improved)
- Player rating / ranking system
- Recruitment visibility toggle ("open to offers")

### C2. Rich Team Profile
- Team logo upload
- Team photo / banner
- Full roster with positions + jersey numbers
- Team record history across events
- Social media links
- Team achievements / trophies

### C3. Scouting / Recruitment
- Coaches can "favorite" or "star" players
- Saved searches with filters (position, age, city, stats)
- Contact request (coach → player/parent, requires approval)
- Scout notes (private, per coach)
- Player comparison tool (side-by-side stats)

---

## 🟡 Phase D — Communication & Notifications

### D1. Email Notifications (SendGrid)
- Welcome email on registration
- Email confirmation (currently console-logged)
- Team approved / rejected notification
- Team request received / accepted / rejected
- Game reminder (24h before, 1h before)
- Score posted notification
- Event registration confirmation
- Password reset email

### D2. In-App Notifications
- Notification bell with unread count
- Real-time notifications via WebSocket
- Types: team request, game starting, score posted, admin message
- Mark as read / dismiss
- Notification preferences (which types to receive)

### D3. Messaging
- Coach-to-player messaging (in-app)
- Admin broadcast to all teams / all players
- Team group chat
- Message history

---

## 🟡 Phase E — Payments & Registration

### E1. Event Registration Flow
- Multi-step registration form (player info → team selection → waiver → payment)
- Pre-fill form for logged-in users
- Waiver / consent form (digital signature)
- Parent/guardian info for minors
- Medical info / emergency contact
- Registration confirmation PDF

### E2. Payments (Stripe)
- Team registration fee
- Individual player registration fee
- Early bird pricing
- Promo codes / discounts
- Payment receipt email
- Refund management
- Revenue dashboard for admin
- Split payments (team fee divided among players)

### E3. Merchandise
- Jersey ordering (size, number, name)
- Shorts / gear ordering
- Order tracking
- Add-on purchases (premium media, replay access)

---

## 🟢 Phase F — Analytics & Reporting

### F1. Player Analytics
- Career stats dashboard (trends over time)
- Per-game stat breakdown
- Comparison vs position averages
- Efficiency metrics (catch rate, completion %, INT rate)
- Heat maps (if tracking field position)

### F2. Team Analytics
- Win/loss trends
- Scoring offense / defense rankings
- Roster depth chart
- Strength of schedule

### F3. Admin Analytics
- Registration trends (signups over time)
- Revenue reports
- Demographic breakdown (age, city, province)
- Retention rate (returning teams/players)
- Event comparison (year over year)

---

## 🟢 Phase G — Mobile & UX

### G1. PWA (Progressive Web App)
- Install to home screen
- Offline mode (cached schedule, standings, roster)
- Push notifications (game starting, score updates)
- Fast load on mobile data

### G2. QR Code System
- Player check-in via QR (scan at venue)
- Team check-in (coach scans, confirms roster)
- QR on wristbands for premium media access
- Venue map with QR links for field navigation

### G3. Accessibility
- Screen reader support
- High contrast mode
- Font size controls
- Keyboard navigation

---

## 🟢 Phase H — Content & Social

### H1. Media Gallery
- Photo galleries per game/event
- Video highlights per game
- Premium content paywall
- Photographer upload portal
- Auto-tag players in photos (future: AI-based)
- Download / share to social media

### H2. Social Features
- Follow players / teams
- Activity feed (scores, highlights, roster moves)
- Share game results as image cards (Instagram-ready)
- Leaderboard challenge (weekly top performers)

### H3. Blog / News
- Admin-published articles
- Event recaps
- Player spotlights
- SEO-optimized event pages

---

## 🟢 Phase I — Platform Operations

### I1. Multi-Event Support
- Multiple concurrent events
- Event archive (past events stay browsable)
- Event templates (clone settings from previous year)
- Event-specific branding (logo, colors, sponsors)

### I2. Sponsor Management
- Sponsor logos on event pages
- Sponsored content sections
- Banner ad slots
- Sponsor analytics (impressions, clicks)

### I3. Staff Management
- Staff scheduling (who covers which field)
- Volunteer sign-up
- Staff check-in / attendance
- Role-specific dashboards (scorekeeper, photographer, announcer)

### I4. Data Export
- CSV export for all tables (players, teams, games, stats)
- PDF generation (rosters, schedules, brackets)
- API access for partner integrations
- Google Sheets sync for live bracket display

---

## Priority Matrix

| Priority | Phase | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 Must | A. Tournament Engine | Critical | High |
| 🔴 Must | D1. Email (SendGrid) | Critical | Low |
| 🔴 Must | E1. Event Registration | Critical | Medium |
| 🟡 Should | B. Game Day Experience | High | Medium |
| 🟡 Should | C1. Rich Profiles | High | Medium |
| 🟡 Should | D2. In-App Notifications | High | Medium |
| 🟡 Should | E2. Payments (Stripe) | High | Medium |
| 🟢 Nice | F. Analytics | Medium | Medium |
| 🟢 Nice | G. Mobile/PWA | Medium | Low |
| 🟢 Nice | H. Content/Social | Medium | High |
| 🟢 Nice | I. Platform Ops | Low | High |

---

## Default Users

| Email | Password | Role |
|-------|----------|------|
| `admin@dtached.com` | `admin123` | ADMIN |
| `coach.carter@dtached.com` | `password` | COACH |
| `coach.prime@dtached.com` | `password` | COACH |
| `coach.sarah@dtached.com` | `password` | COACH |
| `coach.kelly@dtached.com` | `password` | COACH |
