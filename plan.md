# Dtached — Full Product Plan

> A buildable platform plan with clear rules, role boundaries, and implementation phases.  
> Dtached is a multi-sided football platform with six main functions: identity & access, team & roster control, free agent discovery & matching, tournament & event operations, payments & verification, and communication, media & growth.

**The most important thing:** this platform should be built around **hard business rules**, not just screens. If the rules are strong, the UI becomes easier, the backend becomes safer, and the product remains consistent.

---

## 1. Product Vision

Dtached is a football tournament and player management platform where players, teams, coaches, and admins operate inside a **verified and controlled ecosystem**. It supports player registration, team registration, free agent discovery, team membership, roster control, admin approvals, tournament participation, and event-day operations.

> It is not just a tournament website. It is a **controlled football ecosystem** with identity, roster, and event logic.

---

## 2. Product Pillars

| Pillar | Description |
|--------|-------------|
| **Verified Player Identity** | Every serious participant should have a platform identity, profile, and status |
| **Controlled Team Membership** | Players do not freely jump between team states — governed by business rules |
| **Free Agent Marketplace** | Only eligible, unattached, verified players can be discoverable |
| **Admin Oversight** | Sensitive actions (team approval, matching, transfers) are reviewed by admin |
| **Tournament Operations** | Events, schedules, games, standings, and brackets managed in-platform |
| **Monetization** | Player verification and tournament entry are the main revenue paths |

---

## 3. Core Business Rules

> These should be written into the backend as **hard rules**.

### 3.1 Player Market Eligibility

- Only **free agents** can appear in the free agent market
- **Team players** cannot appear in the free agent market
- **Unverified players** cannot appear in the free agent market

### 3.2 Team Membership Control

- A player **cannot remove himself** from a team
- Only the **coach** (or explicitly authorized team-side role) can remove a player from a roster
- A team player **cannot directly switch teams**
- A team player **cannot directly join** the free agent market

### 3.3 Movement Between Teams

- Any movement from Team A → Team B must go through a **transfer workflow** or **coach-led release workflow**
- Admin must be able to review sensitive transfers

### 3.4 Verification & Payment

- Unverified players can create accounts and browse public information
- Only **verified players** can be eligible for active participation and coach visibility
- Team registration can waive individual player verification (depending on pricing logic)

### 3.5 Admin Authority

- Admin approves teams
- Admin reviews match approvals
- Admin reviews transfer cases if workflow requires it
- Admin has **final override power**

---

## 4. Roles & Responsibilities

### 4.1 Admin

> Controls platform-wide operations.

**Can:** approve/reject teams · review player edits · view all users · approve/reject free agent matches · approve/reject transfers · create/manage events · create/manage games · manage standings & stats · view analytics & payments · manage staff roles · broadcast announcements · suspend/deactivate accounts

**Cannot:** act as a normal team member within team-specific permissions (unless explicitly allowed)

### 4.2 Coach

> Manages football-side team operations.

**Can:** view/manage own team · view own roster · set position needs · send interest to free agents · review incoming interest & join requests · remove players from roster · approve/recommend transfers · view team schedule & standings · manage team profile

**Cannot:** approve teams globally · see hidden free agents · see team players from other teams as market candidates · approve final platform-sensitive actions (if reserved for admin)

### 4.3 Team Manager

> May overlap heavily with coach at first. Should initially share most coach views with narrower permissions.

**Can:** manage team registration · handle logistics · manage roster submission · manage event participation · handle payment-related team actions · view team schedule & roster

### 4.4 Player

> Manages personal football identity and participation.

**Can:** register & maintain profile · pay for verification · set free agent visibility (if unattached & eligible) · browse public tournament content · join a team through approved process · respond to interest (if free agent) · view status, payments, player card, & participation history

**Cannot:** leave team by himself · be market-visible while attached to a team · switch teams directly · edit team membership directly

### 4.5 Staff

> Handles assigned event or media tasks.

**Can:** upload livestream links · upload media · manage assigned game-day operational data · view staff-assigned schedules & tasks

**Cannot:** manage core admin approvals (unless explicitly delegated)

### 4.6 Public User

**Can:** view schedules · standings · leaderboards · live pages · media · public event info

**Cannot:** interact with internal team, player, or admin workflows

---

## 5. State Model

> Every player and team should have a clear state. This is one of the most important parts of the entire platform.

### 5.1 Player States

| # | State | Description |
|---|-------|-------------|
| 1 | **Guest** | No account |
| 2 | **Registered Unverified** | Has account, not paid |
| 3 | **Verified Free Agent** | Paid, visible to coaches |
| 4 | **Team Player** | On an approved team roster |
| 5 | **Pending Join Request** | Submitted invite code, awaiting approval |
| 6 | **Pending Transfer** | Requested move to another team |
| 7 | **Released** | Removed from roster by coach |
| 8 | **Suspended / Inactive** | Hidden from discovery |

### 5.2 Team States

| # | State |
|---|-------|
| 1 | **Draft** |
| 2 | **Pending Approval** |
| 3 | **Approved Active** |
| 4 | **Rejected** |
| 5 | **Suspended** |
| 6 | **Archived** |

### 5.3 Match States

| # | State |
|---|-------|
| 1 | **Coach Interested** |
| 2 | **Player Interested** |
| 3 | **Mutual Match — Pending Admin Review** |
| 4 | **Approved Match** |
| 5 | **Rejected Match** |
| 6 | **Expired Match** |

### 5.4 Transfer States

| # | State |
|---|-------|
| 1 | **Requested** |
| 2 | **Receiving Team Accepted** |
| 3 | **Current Team Acknowledged** (if needed) |
| 4 | **Pending Admin Review** |
| 5 | **Approved** |
| 6 | **Rejected** |
| 7 | **Cancelled** |

---

## 6. Platform Modules

> Each module can be developed and released independently.

### 6.1 Authentication & Identity

**Purpose:** User creation, login, access control, profile linkage

**Features:** Registration · Login · JWT auth · Email confirmation · Password reset · Role assignment · Role-based access control · Profile onboarding

**Entities:** `User` · `Role` · `Permission` · `AuthToken` · `EmailVerificationToken` · `PasswordResetToken`

---

### 6.2 Profile

**Purpose:** Hold player, coach, team manager, and staff identity information

**Player Profile Fields:**
name · date of birth · photo · city · position · height · weight · school/club · bio · highlight video · stats · verification status · current team status · free agent eligibility · open-to-offers status · medical/emergency info

**Team Profile Fields:**
team name · logo · division · city · coach · manager · banner · social links · roster summary · team achievements

---

### 6.3 Team Management

**Purpose:** Team creation, approval, membership, roster structure

**Features:** Team registration · Admin team approval · Invite code generation · Roster management · Position needs · Jersey assignment · Roster lock · Player removal by coach · Team settings

**Entities:** `Team` · `TeamInviteCode` · `TeamMembership` · `RosterStatus` · `PositionNeed`

---

### 6.4 Player Movement

**Purpose:** Manage free agency, team joins, and transfers

**Features:** Free agent status toggle (unattached verified only) · Coach search of free agents · Coach interest · Player response · Mutual match creation · Admin review of match · Join request via invite code · Transfer workflow · Release workflow

**Entities:** `FreeAgentProfile` · `TeamJoinRequest` · `TeamInterest` · `PlayerResponse` · `MatchApproval` · `TransferRequest` · `ReleaseRecord`

---

### 6.5 Tournament Engine

**Purpose:** Run events properly instead of manually creating games one by one

**Features:** Event creation · Division creation · Age groups · Tournament formats · Pool generation · Bracket generation · Standings calculation · Game scheduling · Field assignment · Game rescheduling · Weather delay handling

**Entities:** `TournamentEvent` · `Division` · `Pool` · `Bracket` · `Game` · `Field` · `Timeslot` · `Standing` · `TiebreakRule`

---

### 6.6 Game-Day

**Purpose:** Support real-time tournament execution

**Features:** Live scoring · Game clock · Play-by-play updates · Coach confirmation of final scores · Livestream embeds · Media links · Push updates to viewers

**Entities:** `LiveGameState` · `ScoreUpdate` · `PlayLog` · `LivestreamLink` · `GameConfirmation`

---

### 6.7 Notifications & Messaging

**Purpose:** Keep users informed and connected

**Features:** Email notifications · In-app notification center · Unread counts · Message history · Coach-to-player messages · Admin broadcasts · Team chat (later)

**Entities:** `Notification` · `NotificationPreference` · `Message` · `Conversation` · `Announcement`

---

### 6.8 Payments & Monetization

**Purpose:** Control eligibility and drive revenue

**Features:** Player card purchase · Team tournament registration payment · Promo codes · Receipts · Pricing tiers · Payment status · Non-refundable platform fee rules · Credit persistence · Revenue dashboard

**Entities:** `Payment` · `PricingTier` · `Invoice` · `PromoCode` · `CreditBalance` · `PlayerCard`

---

### 6.9 Media & Content

**Purpose:** Host the social and content layer

**Features:** Media galleries · Livestream archives · Highlight uploads · Event recaps · News posts · Premium content gates

**Entities:** `MediaAsset` · `Gallery` · `Article` · `PremiumAccess`

---

### 6.10 Analytics & Reporting

**Purpose:** Help admin, teams, and players understand performance

**Features:** Player stats trends · Team performance metrics · Event registration trends · Revenue reporting · Retention metrics · Demographic summaries

**Entities:** `PlayerStatLine` · `TeamMetric` · `RevenueReport` · `RegistrationReport`

---

## 7. Role-Based Dashboard Plans

### 7.1 Admin Dashboard

**Sections:** Overview · Users · Teams · Players · Free Agent Matches · Transfers · Events · Games · Fields · Payments · Analytics · Notifications · Content · Staff Management · System Settings

**Overview Cards:** Total registered users · Verified players · Active free agents · Active teams · Pending team approvals · Pending transfer requests · Upcoming events · Today's games · Current revenue · Recent issues

**Workflows:** Approve/reject team · Review player profile · Approve/reject match · Approve transfer · Create event/division · Generate pools/schedule · Edit standings · Resolve disputes · Issue announcements · Review revenue reports

### 7.2 Coach Dashboard

**Sections:** Overview · My Team · Roster · Position Needs · Free Agents · Requests · Matches · Events · Schedule · Settings

**Overview Cards:** Roster size · Open positions · Pending join requests · Pending player actions · Upcoming games · Team approval status

**Workflows:** Edit team profile · Manage roster details · Remove player · Search verified free agents · Send interest · Review player responses · Submit roster for tournament · View schedule & standings

### 7.3 Team Manager Dashboard

**Sections:** Overview · Team Registration · Roster Admin · Events · Payments · Schedule · Settings

**Workflows:** Submit/update team registration · Handle team payments · Manage roster list logistics · View approval status · Submit tournament participation documents

### 7.4 Player Dashboard

**Sections:** Overview · My Profile · Player Card · Verification · Team Status · Free Agent Status · Requests & Matches · Events · Payments · Settings

**Overview Cards:** Verification status · Team status · Player card status · Interest notifications (if free agent) · Upcoming events · Payment history

**Workflows:** Complete profile · Pay for player card · Toggle free agent mode (if eligible) · Respond to team interest · View join status · View assigned team · Download player card · View participation history

### 7.5 Staff Dashboard

**Sections:** Overview · Assigned Games · Livestream · Media Upload · Coverage Tasks

**Workflows:** Update livestream links · Upload media · Attach media to games/events · View assignments

---

## 8. Key Workflows

### 8.1 Player Registration

1. User signs up
2. Chooses player role
3. Completes player profile
4. Remains unverified
5. Can browse public info
6. May purchase player card
7. If verified and unattached → can opt into free agent market

### 8.2 Team Registration

1. Coach or team manager registers team
2. Submits team information
3. Team enters **pending approval**
4. Admin reviews
5. Admin approves or rejects
6. Approved team becomes active
7. Invite code becomes usable

### 8.3 Free Agent Discovery

1. Verified unattached player enables free agent visibility
2. Coach searches free agents by filters
3. Coach sends interest
4. Player receives notification
5. Player responds positively
6. Mutual match enters **admin review**
7. Admin approves
8. Player becomes team player → disappears from market

### 8.4 Join by Invite Code

1. Approved team has invite code
2. Eligible player enters invite code
3. System validates code
4. Request is created
5. Coach and admin are notified
6. Request is approved
7. Player joins team

### 8.5 Player Release

1. Coach removes player from roster
2. Membership record is ended
3. Player becomes released / unattached
4. If verified → player may enter free agent market again

### 8.6 Transfer

> This must respect the rule that players **cannot leave by themselves**.

1. Coach from receiving team expresses interest or initiates request
2. Current team side is involved
3. Admin reviews
4. If approved → membership changes from Team A → Team B
5. Player never self-removes

---

## 9. Pricing Model

### Tier 0 — Free Account ($0)

> Let users enter the platform and browse.

- Account & profile creation
- Public browsing
- ❌ No market visibility
- ❌ No roster eligibility
- ❌ No event participation

### Tier 1 — Player Card (~$9.99 promo / ~$18 regular)

> Verified player identity and platform eligibility.

- ✅ Verified player badge
- ✅ Market visibility (if unattached)
- ✅ Digital player card
- ✅ Coach discoverability
- ✅ Premium access
- ✅ Future event participation eligibility
- **Non-refundable** · Persistent beyond one event · Can be promotional

### Tier 2 — Team Tournament Entry ($45)

> Register team for an event.

- ✅ Team event participation
- ✅ Team roster activation for tournament
- ✅ Waived/included player verification for team members
- ✅ Branding/gear options

> **Pricing logic should be simple enough for users to understand.** Complicated pricing kills trust.

---

## 10. Technical Architecture

### Backend

- Spring Boot + Spring Security (JWT)
- PostgreSQL
- Redis (later — caching & real-time)
- WebSocket (live notifications & scoring)
- Stripe (payments)
- SendGrid (email)
- Cloud storage (media uploads)
- Nginx (reverse proxy)
- Docker

### Frontend

- React
- Role-based routing
- Shared component system
- Dashboard layout with dynamic sidebar per role
- Responsive mobile-first views

### Infrastructure

- Docker Compose initially → Cloud hosting later
- Object storage for uploads
- Monitoring & logging
- Background job runner (emails, notifications, scheduled tasks)

---

## 11. Database Structure (High Level)

| Category | Tables |
|----------|--------|
| **Identity** | `users` · `roles` · `permissions` |
| **Profiles** | `player_profiles` · `team_profiles` · `staff_profiles` |
| **Teams** | `team_memberships` · `team_invite_codes` · `team_join_requests` |
| **Matching** | `team_interest` · `match_reviews` · `transfer_requests` |
| **Events** | `events` · `divisions` · `games` · `fields` · `standings` |
| **Payments** | `payments` · `pricing_tiers` · `player_cards` |
| **Communication** | `notifications` · `messages` |
| **Content** | `media_assets` · `articles` |
| **System** | `audit_logs` |

---

## 12. Audit & Safety Requirements

> For a platform like this, you need strong audit tracking.

**Log these actions:**

- Who approved/rejected a team
- Who removed a player
- Who approved a transfer
- Who changed payment status
- Who updated event schedule
- Who edited standings

*This matters for trust, debugging, and admin disputes.*

---

## 13. Version Plan

### 13.1 MVP — Business-Valid Product

**Include:**
Auth & roles · Player profiles · Team registration & approval · Coach dashboard · Player dashboard · Admin dashboard · Invite codes · Free agent market (verified only) · Coach interest & player response · Admin match approval · Coach-led player removal · Basic event creation · Manual games · Basic notifications · Stripe (player card + team registration) · SendGrid emails

**Do not include yet:** Advanced brackets · Deep analytics · Social feed · Multi-event sponsor tools · AI tagging · Complex chat systems

### 13.2 Version 1.1

Tournament engine basics · Pool creation · Standings automation · Bracket generation · Field management · In-app notification center · Better media uploads · Player card QR support

### 13.3 Version 2.0

Live scoring · Game clock · Play-by-play · Advanced analytics · PWA · Sponsor system · Content & social features · Staff scheduling · Data export & integrations

---

## 14. Recommended Build Order

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **Phase 1** | Stabilize Foundation | Finalize role-based permissions · Finalize state machine (players + teams) · Clean up registration & profile setup · Lock business rules into backend services |
| **Phase 2** | Finish Core Dashboards | Admin dashboard (approvals) · Coach dashboard (roster + recruitment) · Player dashboard (profile, verification, status) |
| **Phase 3** | Implement Movement Logic | Free agent visibility rules · Coach interest workflow · Player response workflow · Admin match approval · Coach-led player removal · Transfer workflow |
| **Phase 4** | Payments & Verification | Stripe integration · Player card purchase · Team registration purchase · Payment-driven eligibility checks |
| **Phase 5** | Tournament Operations | Event creation · Division setup · Manual schedule with improved event model · Standings & leaderboards · Roster submission per event |
| **Phase 6** | Tournament Automation | Pool generation · Brackets · Game scheduling · Field assignment |
| **Phase 7** | Game-Day & Growth | Live scoring · Livestream embeds · Notifications · Media · Content |

---

## 15. UX Principles

| Principle | Description |
|-----------|-------------|
| **Role-scoped views** | Each role sees only what matters to them |
| **Visible status** | Sensitive statuses should be obvious (pending, approved, rejected) |
| **State transparency** | Every action should show its current state |
| **Clear blocking reasons** | Users should always know why something is blocked |
| **Payment clarity** | Payment and eligibility rules must be very clear |
| **Fast admin queues** | Admin review queues should be fast and easy to process |
| **Explicit visibility rules** | Free agent visibility rules should be explicit to players |

---

## 16. Screen Map

### Admin
Dashboard · Team Approvals List · Players Directory · Matches Queue · Transfers Queue · Events Manager · Games Manager · Payments Dashboard · Analytics Page

### Coach
Overview · My Team · Roster · Requests · Free Agent Search · Matches · Events · Schedule · Settings

### Player
Overview · Profile Editor · Verification & Player Card · Free Agent Settings · Requests & Matches · Team Status · Payments · Event History

### Staff
Overview · Assigned Coverage · Livestream Manager · Media Uploader

### Public
Home · Events · Schedule · Standings · Leaderboard · Live · Media · Player/Team Public Pages

---

## 17. Product Risks

| Risk | Description |
|------|-------------|
| **Too many features too early** | The biggest danger — shipping tournament engine, social, analytics, and recruitment all at once |
| **Weak business rules** | If team players can accidentally become free agents or bypass membership control, the model breaks |
| **Over-complicated roles** | Coach and team manager should share many screens early on |
| **Confusing pricing** | If users don't understand what $9.99 and $45 get them, they hesitate |
| **Admin overload** | If every action requires manual review, admin becomes a bottleneck — approve only where it matters |

---

## 18. What Makes Dtached Different

- ✅ **Verified football identities**
- ✅ **Strict roster-state logic**
- ✅ **Free agent marketplace** — unattached players only
- ✅ **Coach-led roster control**
- ✅ **Admin-approved matching**
- ✅ **Controlled transfer workflow**
- ✅ **Tournament participation** in the same ecosystem

> That is stronger than just "another tournament site."

---

## 19. Immediate Next Actions

1. **Freeze** the business rules
2. **Define** the exact permissions per role
3. **Define** the player and team state machine
4. **Finalize** the three main dashboards (admin, coach, player)
5. **Implement** free agent and roster movement logic
6. **Add** payments
7. **Add** tournament event structure

---

## Architecture Layers

| Layer | Purpose | Modules |
|-------|---------|---------|
| **Layer 1 — Operational Core** | Business engine | Auth · Roles · Profiles · Teams · Rosters · Free Agents · Approvals · Payments |
| **Layer 2 — Tournament & Growth** | Platform richness | Events · Games · Standings · Brackets · Live Scoring · Media · Notifications · Analytics |

> **Layer 1 is the business engine.** Layer 2 makes the platform richer and more competitive.
