# Events System Plan

> Maps the current `PlayerRegistration` wizard to the database-backed `EventsPage` and admin `EventManagement`.

---

## Current State

### What Exists

| Component | Status | Description |
|-----------|--------|-------------|
| `EventsPage.tsx` | ✅ Live | Public event grid from `/api/events/published` — cards with dates, location, fee, detail modal |
| `EventManagement.tsx` | ✅ Live | Admin tab — create/edit events, divisions, fields, approve registrations |
| `PlayerRegistration.tsx` | ⚠️ Disconnected | 7-step wizard (event type → info → photos → team → pricing → verify → success) — hardcoded camp/tournament, not linked to DB events |
| Backend (Phase 5) | ✅ Live | `TournamentEvent`, `EventDivision`, `EventRegistration`, `Field` entities, full CRUD, V10 migration |
| Seed Data | ✅ Live | "Dtached Summer Camp 2026" ($45, Montreal) + "Dtached Championship Tournament" ($100, Toronto) with divisions |

### The Gap

`PlayerRegistration` still uses **hardcoded** event types ("camp" / "tournament") with image buttons (`/camp.png`, `/tournoi.png`). It doesn't know about `TournamentEvent` records in the database at all. The new `EventsPage` shows the DB events but has no registration flow — just a "View Details" modal.

---

## Proposed Architecture

### Flow: Public User Browsing Events

```
Events Nav → EventsPage
  ├─ Fetches /api/events/published → shows event cards
  ├─ Click card → Event Detail page (expanded, not just modal)
  │    ├─ Event info, divisions, schedule, fields
  │    ├─ "Register" button
  │    │    ├─ If logged in as COACH → team registration (pick team + division)
  │    │    └─ If logged in as PLAYER or not logged in → individual registration wizard
  │    └─ Photos/gallery if bannerUrl exists
  └─ Filter by: upcoming, past, city, format
```

### Flow: Individual Player Registration (Replaces PlayerRegistration)

```
Click "Register" on event card
  → Step 1: Player Info (name, DOB, gender, position, city) — autofill from profile
  → Step 2: Photos (profile + action shot)
  → Step 3: Team / Free Agent (tournament only: team name, category/division)
  → Step 4: Package Selection (event-specific pricing from DB, not hardcoded)
  → Step 5: Verification animation
  → Step 6: Success / confirmation
```

Key difference: **Step 1 is event selection** is eliminated — the user already chose the event by clicking its card on `EventsPage`.

### Flow: Coach Team Registration

```
Click "Register Team" on event card
  → Pick division (from event's divisions)
  → Roster confirmation (auto-populated from team players)
  → Payment (Stripe checkout if entry fee > 0)
  → Submitted → Pending admin approval
```

---

## What Needs to Change

### Phase A — Connect EventsPage to Registration

| # | Task | File(s) |
|---|------|---------|
| A1 | Expand Event Detail from modal to full-page view | `EventsPage.tsx` |
| A2 | Add "Register" CTA on event detail — branches by role | `EventsPage.tsx` |
| A3 | Pass selected `eventId` to registration flow | `EventsPage.tsx` → `PlayerRegistration.tsx` |
| A4 | Remove Step 1 (event type picker) from PlayerRegistration; accept `eventId` prop instead | `PlayerRegistration.tsx` |
| A5 | Fetch event details (name, divisions, pricing) by `eventId` on mount | `PlayerRegistration.tsx` |

### Phase B — Dynamic Pricing from Database

| # | Task | File(s) |
|---|------|---------|
| B1 | **Add `event_packages` table** — links pricing tiers to events (name, price, description, includes) | V11 migration, `EventPackage` entity |
| B2 | Admin can define packages per event (e.g. "$45 Starter", "$90 Complete", "$100 Camp") | `EventManagement.tsx` |
| B3 | Step 5 (pricing) reads packages from `/api/events/{id}/packages` instead of hardcoded `$45/$90/$100` | `PlayerRegistration.tsx` |
| B4 | Seed default packages for the 2 existing events | `DataSeeder.java` |

### Phase C — Backend: Individual Event Registration

| # | Task | File(s) |
|---|------|---------|
| C1 | `POST /api/events/{id}/register/player` — individual player registration (not team-based) | `EventController.java`, `EventService.java` |
| C2 | `PlayerEventRegistration` entity — player_id, event_id, division_id, package_id, status, payment fields | New entity + V11 migration |
| C3 | Admin sees individual registrations alongside team registrations | `EventManagement.tsx` |

### Phase D — Admin Event Setup Improvements

| # | Task | File(s) |
|---|------|---------|
| D1 | Event type selector when creating (Camp / Tournament / Showcase) — stored as `event_type` column | `TournamentEvent` entity, migration, `EventManagement.tsx` |
| D2 | Event banner image upload | `EventManagement.tsx` |
| D3 | Event-specific form configuration (e.g. camps need jersey/shorts size; tournaments need team info) | `TournamentEvent` entity: `required_fields` JSON column |
| D4 | Pre-built event templates: admin can clone from "Camp Template" or "Tournament Template" | `EventManagement.tsx` |

---

## Data Model Changes

### New: `event_packages` table

```sql
CREATE TABLE event_packages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES tournament_events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,        -- "Starter Pack", "Complete Pack", "Camp Registration"
    price DECIMAL(10,2) NOT NULL,      -- 45.00, 90.00, 100.00
    description TEXT,                   -- "Dtached Gloves + Admission"
    includes TEXT,                      -- JSON array of included items
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);
```

### New: `player_event_registrations` table

```sql
CREATE TABLE player_event_registrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES tournament_events(id),
    player_id BIGINT REFERENCES players(id),
    user_id BIGINT REFERENCES users(id),
    division_id BIGINT REFERENCES event_divisions(id),
    package_id BIGINT REFERENCES event_packages(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    jersey_size VARCHAR(10),
    shorts_size VARCHAR(10),
    team_name VARCHAR(100),
    category VARCHAR(50),
    has_team BOOLEAN DEFAULT FALSE,
    video_url TEXT,
    payment_status VARCHAR(30) DEFAULT 'UNPAID',
    notes TEXT,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, player_id)
);
```

### Modify: `tournament_events` table

```sql
ALTER TABLE tournament_events ADD COLUMN event_type VARCHAR(30) DEFAULT 'TOURNAMENT';
-- Values: CAMP, TOURNAMENT, SHOWCASE, COMBINE
ALTER TABLE tournament_events ADD COLUMN required_fields TEXT;
-- JSON: ["jersey_size","shorts_size"] for camps, ["team_name","category","video_url"] for tournaments
```

---

## Mapping: PlayerRegistration Fields → Where They Live

| PlayerRegistration Field | Profile (permanent) | Event Registration (per-event) |
|--------------------------|--------------------|---------------------------------|
| first_name, last_name | ✅ Profile | Autofilled |
| dob, gender | ✅ Profile | Autofilled |
| position | ✅ Profile | Autofilled |
| height, weight | ✅ Profile | Autofilled |
| city, province | ✅ Profile | Autofilled |
| photo, player_photo | ✅ Profile | Autofilled |
| event_type | — | Determined by which event card was clicked |
| jersey_size, shorts_size | — | ✅ Per-event (camp-specific) |
| has_team, team_name, category | — | ✅ Per-event (tournament-specific) |
| video_url | ✅ Profile | Optional override per-event |
| plan_package ($45/$90/$100) | — | ✅ Per-event (from event_packages) |
| order_number, purchase_email | — | ✅ Per-event (payment verification) |

---

## Priority Order

1. **Phase A** (connect EventsPage → registration) — highest impact, users can register for actual DB events
2. **Phase B** (dynamic pricing) — replaces hardcoded $45/$90/$100
3. **Phase C** (backend individual registration) — stores registrations properly
4. **Phase D** (admin event setup) — admin quality-of-life

---

## Current Hardcoded Values to Replace

| Hardcoded in PlayerRegistration | Replace With |
|--------------------------------|--------------|
| `camp.png` / `tournoi.png` image cards | Event cards from database with `bannerUrl` |
| `"camp"` / `"tournament"` event types | `event_type` column on `tournament_events` |
| `$45` / `$90` / `$100` pricing | `event_packages` table per event |
| `"Camp Retour à l'Origine 2026"` | `event.name` from database |
| `"Tournoi Dtached 2026"` | `event.name` from database |
| Categories: `Elite` / `16U` / `14U` | `event_divisions` for each event (already exists) |
