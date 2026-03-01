# Registration → Dashboard Wiring Plan (Revised)

## Core Principle

**"Register" = Event Registration. "Create Account" = Auth. Profile = All player info.**

---

## Current Problems

| Issue | Detail |
|-------|--------|
| **Two disconnected flows** | `RegisterPage` (account) and `PlayerRegistration` (player profile) never converge |
| **Profile is empty** | After signup → role select → dashboard, the user has no player info anywhere |
| **Duplicate nav concepts** | "Register" in the nav and "Create Account" overlap conceptually |
| **Dead `admin` tab** | `DashboardPage` already embeds `AdminPage` — standalone route is unused |

---

## Revised Flow

### 1. "Register" Nav Item → Becomes "Event" Registration

The nav item currently labeled **"Register"** becomes **EVENT registration** — signing up for a camp or tournament. The `PlayerRegistration` form stays as-is but with one difference:

- **If logged in:** Autofill name, email, and any known player fields from the user's profile. Skip fields already on file.
- **If not logged in:** Form works as-is (public event signup). At the end, prompt "Create an account to save your profile."

### 2. "Create Account" (RegisterPage) → Auth Only

`RegisterPage` stays minimal: name, email, password → auto-login → role selection → dashboard. No player-specific fields here.

### 3. Profile Page → Consolidates ALL Player Info

**This is the key change.** The `ProfilePage` becomes the single source of truth for player details. Everything currently in `PlayerRegistration`'s 536-line form that represents *profile* data (not event-specific) lives here:

**Profile fields (from PlayerRegistration):**
- Position, Height, Weight
- City, Province/State
- Date of Birth, Gender
- Photo upload
- Highlight video

**Event-specific fields (stay in PlayerRegistration / Event form):**
- Event type (camp/tournament)
- Plan/package selection ($45/$90)
- Payment

### 4. Dashboard Consolidation

```
Auth flow:
  Create Account → Role Select → Dashboard
    ┣━ PLAYER  → PlayerDashboard
    ┃           └ If no player profile → "Complete Your Profile" card → opens ProfilePage
    ┣━ COACH   → AdminPage (embedded) → TeamRegistration if no team
    ┣━ MANAGER → AdminPage (embedded)
    ┣━ ADMIN   → AdminPage (embedded, admin tabs visible)
    ┗━ STAFF   → AdminPage (embedded, staff tab only)
```

Remove standalone `admin` tab from `App.tsx` — dead code.

---

## Specific Changes

### Nav (`Header.tsx`)
| Before | After |
|--------|-------|
| `Register` → `PlayerRegistration` | `Events` → `PlayerRegistration` (relabeled, autofills if logged in) |
| Dropdown: Dashboard, Profile | Same, no change |

### `PlayerRegistration.tsx` (now "Event Registration")
- If `useAuth()` provides a logged-in user → prefill name, email from `user`
- If user has a player profile → prefill position, height, city, etc.
- Submit still goes to `POST /api/players/register`
- After submit (if not logged in): CTA "Create Account" → `RegisterPage`

### `ProfilePage.tsx`
- Expand from basic info to include **all** player profile fields:
  - Position, Height, Weight, City, Province, DOB, Gender
  - Photo upload, Highlight video
- Fetches from `GET /api/players/me` on mount
- Saves via `PUT /api/players/me/profile` (new endpoint)
- If no player record exists: creates one via `POST /api/players/me/profile`

### `PlayerDashboard.tsx`
- If `player === null` → show "Complete Your Profile" card with CTA that navigates to `ProfilePage`
- If `player` exists → current dashboard (verification, free agent toggle, etc.)

### Backend
1. `GET /api/players/me` — return `null` (not 404) when no player record exists  
2. `PUT /api/players/me/profile` — update existing player profile for authenticated user  
3. `POST /api/players/me/profile` — create player record linked to authenticated user  

### `App.tsx`
- Remove `activeTab === 'admin'` branch (dead code)
- Rename `register` tab label in nav to "Events"

---

## Summary

| Concept | Where It Lives |
|---------|----------------|
| **Account creation** | `RegisterPage` → `RoleSelectionPage` |
| **Player profile** (position, height, etc.) | `ProfilePage` (expanded) |
| **Event registration** (camp/tournament signup) | `PlayerRegistration` (renamed to "Events" in nav) |
| **Dashboard** | `DashboardPage` (single entry point for all roles) |
