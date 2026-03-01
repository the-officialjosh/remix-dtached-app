# Dtached — Build Task Plan

> Ordered by plan.md §14 build phases. Each item maps to a gap from the codebase audit.

---

## Phase 1 — Stabilize Foundation

### 1.1 State Machine Completion
- [x] Add missing `PlayerStatus` values: `PENDING_JOIN`, `RELEASED`
- [x] Add missing `TeamStatus` values: `DRAFT`, `SUSPENDED`, `ARCHIVED`
- [x] Add `MatchStatus` enum: `COACH_INTERESTED`, `PLAYER_INTERESTED`, `MATCHED`, `APPROVED`, `REJECTED`, `EXPIRED`
- [x] Add `TransferStatus` enum: `REQUESTED`, `RECEIVING_ACCEPTED`, `PENDING_ADMIN`, `APPROVED`, `REJECTED`, `CANCELLED`
- [x] Migrate DB: new enum columns + V6 migration

### 1.2 Business Rule Enforcement
- [x] `MatchingService`: block unverified players from free agent market (`isVerified` check)
- [x] `PlayerService.getFreeAgents()`: only returns verified + openToOffers players
- [x] `PlayerController`: block team player from appearing in market search
- [x] `TransferService`: enforce rule that player cannot self-initiate (must go through coach/invite)

### 1.3 Password Reset
- [x] Password reset fields on `User` entity (token + expiry)
- [x] `AuthService.requestPasswordReset()` — generate token, console.log link (SendGrid later)
- [x] `AuthService.resetPassword()` — validate token, update password
- [x] `AuthController`: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- [x] Frontend: forgot password page + reset password page

### 1.4 Profile Field Gaps
- [x] Player: add `bio`, `schoolClub`, `openToOffers`, `emergencyContact`, `emergencyPhone` columns
- [x] Team: add `bannerUrl`, `socialLinks` (JSON), `achievements` columns
- [x] V6 migration for new columns
- [x] Update DTOs + registration forms (types.ts updated)

---

## Phase 2 — Finish Core Dashboards

### 2.1 Coach Dashboard Redesign
- [x] Coach-facing request view (pending join requests for their team)
- [x] Free agent search UI with filters (position, city, verified only)
- [x] "Express Interest" button on free agent cards
- [x] Incoming interest/match notifications
- [x] Player removal button (roster management)

### 2.2 Player Dashboard Redesign
- [x] Verification status card (verified vs unverified)
- [x] Team status section (current team, pending requests)
- [x] Free agent toggle (opt in/out of market — only if unattached + verified)
- [x] Interest notifications (teams interested in you)
- [x] Request/match status tracker

### 2.3 Admin Dashboard — Missing Sections
- [x] Separate Transfers queue tab (currently mixed into Requests)
- [x] Users management tab (all users, role filter, suspend/activate)

---

## Phase 3 — Movement Logic

### 3.1 Coach-Led Player Release
- [x] `CoachController`: `DELETE /api/my/team/players/{playerId}` — remove player from roster
- [x] `PlayerService.releasePlayer()` — set status to `RELEASED`, clear team FK
- [x] Create `ReleaseRecord` entity (who released, when, from which team)
- [x] Frontend: remove button on coach roster view, confirmation modal

### 3.2 Free Agent Visibility Toggle
- [x] `PlayerController`: `PUT /api/players/me/free-agent` — toggle visibility
- [x] Business rule: only if `isVerified = true` AND `team = null`
- [x] Add `openToOffers` boolean to Player entity
- [x] `MatchingService`: filter by `openToOffers = true` in coach search
- [x] Frontend: toggle switch on Player Dashboard

### 3.3 Verified-Only Market
- [x] `MatchingService.teamLikesPlayer()`: add `isVerified` check
- [x] `PlayerRepository`: add `findByStatusAndIsVerified()` query
- [x] Coach free agent search: only returns verified players
- [x] UI: "Verified" badge on player cards

---

## Phase 4 — Payments & Verification

### 4.1 Stripe Integration
- [x] Add `stripe-java` dependency to pom.xml
- [x] `PaymentService` — create checkout sessions, handle webhooks
- [x] `PaymentController`: `POST /api/payments/checkout`, `POST /api/payments/webhook`
- [x] `Payment` entity + `PaymentRepository`
- [x] `PricingTier` entity (Tier 0, Tier 1, Tier 2)
- [x] V8 migration: `payments`, `pricing_tiers` tables

### 4.2 Player Card Purchase (Tier 1 — $9.99)
- [x] Checkout flow: player clicks "Get Player Card" → Stripe session → webhook confirms
- [x] On payment success: set `isVerified = true` on player
- [x] `PlayerCard` entity (name, photo, position, verified badge, QR code)
- [x] Frontend: Player Card page with purchase button
- [x] Frontend: digital player card display (downloadable)

### 4.3 Team Tournament Entry (Tier 2 — $45)
- [x] Checkout flow: coach pays for team → all members verified
- [x] On payment success: set all team players `isVerified = true`
- [x] Link payment to specific event (when events exist)
- [x] Frontend: payment button on coach dashboard

### 4.4 Revenue Dashboard (Admin)
- [x] `AdminController`: `GET /api/admin/payments` — list all payments
- [x] Admin tab: revenue summary, payment list, filters by tier/date
- [x] Stats cards: total revenue, Tier 1 count, Tier 2 count

---

## Phase 5 — Tournament Operations

### 5.1 Event Entity & CRUD
- [ ] `TournamentEvent` entity (name, date, location, deadline, format, status)
- [ ] `Division` entity (linked to event, name, age group, max teams)
- [ ] `EventRepository`, `DivisionRepository`
- [ ] `EventService` — CRUD + validation
- [ ] `EventController`: full CRUD endpoints
- [ ] V8 migration: `events`, `divisions` tables
- [ ] Admin dashboard: Events tab (create, edit, list events)

### 5.2 Event Registration
- [ ] Link teams to events via `EventRegistration` entity
- [ ] Coach submits roster for a specific event
- [ ] Admin approves event registrations
- [ ] Frontend: event list page, registration flow

### 5.3 Improved Game Model
- [ ] Link `Game` to `TournamentEvent` and `Division`
- [ ] `Field` entity (name, GPS, capacity, condition)
- [ ] Standings calculation from game results
- [ ] Admin: improved game management within event context

---

## Phase 6 — SendGrid & Notifications

### 6.1 SendGrid Email Integration
- [ ] Add SendGrid Java SDK dependency
- [ ] `EmailService` — send templated emails
- [ ] Welcome email on registration
- [ ] Email confirmation (replace console.log)
- [ ] Team approved/rejected notification
- [ ] Join request received/approved/rejected
- [ ] Password reset email
- [ ] Payment receipt email

### 6.2 In-App Notifications
- [ ] `Notification` entity (user, type, message, read, createdAt)
- [ ] `NotificationRepository`
- [ ] `NotificationService` — create + mark read
- [ ] `NotificationController`: `GET /api/notifications`, `PUT /api/notifications/{id}/read`
- [ ] V9 migration: `notifications` table
- [ ] Frontend: notification bell with unread count
- [ ] WebSocket push for real-time notifications

---

## Phase 7 — Tournament Automation & Game-Day

### 7.1 Pool & Bracket Generation
- [ ] `Pool` entity (linked to division)
- [ ] Auto-assign teams to pools (balanced)
- [ ] Round-robin schedule generation within pools
- [ ] `Bracket` entity + bracket generation from pool standings
- [ ] Frontend: bracket visualization

### 7.2 Live Scoring
- [ ] `LiveGameState` entity (game, score, possession, clock)
- [ ] WebSocket real-time score broadcasting
- [ ] Play-by-play logging
- [ ] Coach confirmation of final scores
- [ ] Frontend: live game page with real-time updates

### 7.3 Media & Content Improvements
- [ ] File upload (not just URL) for photos
- [ ] Livestream archives
- [ ] Event recaps / news posts
- [ ] Premium content gates (behind player card)

---

## Backlog (Post-MVP)

- [ ] Audit logging (`audit_logs` table — who did what)
- [ ] Coach-to-player messaging
- [ ] Admin broadcast announcements
- [ ] Team chat
- [ ] PWA support
- [ ] QR code system (venue check-in)
- [ ] Sponsor management
- [ ] CSV/PDF data export
- [ ] Advanced analytics (trends, comparisons)
- [ ] Player card QR support
- [ ] Staff scheduling
