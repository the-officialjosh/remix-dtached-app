# Coach Dashboard Spec

This specification contains the full updated detailed spec for the Coach Dashboard, providing multi-team support, free agent recruitment, and split settings.

## Global Rules
1. **Team context is mandatory**: The coach account can be linked to multiple teams. All team actions are scoped to the currently selected team.
2. **Team selector affects team-scoped pages only**: Account pages such as coach profile, security, and notifications do not change when switching teams. Team pages such as roster, invite code, events, and payments do change.
3. **Hard constraints**:
   - One player can belong to only one active team at a time.
   - Players cannot leave teams by themselves.
   - Coach can remove players from own team.
   - Team players are never shown in free agent market.
   - Free agent list shows only: unassigned + verified (player card active) + visible.
   - Roster lock blocks new joins and new additions.
   - Payments are non-refundable.

## Header and Team Selector
- **Header Elements**: Coach identity (name and email), Role badge (COACH), Team selector dropdown (required if 2+ teams), Current team info chips (Team status, Roster status), Alerts icon with counts (Incoming requests, Outgoing requests, Payments due, Uncovered players for next event).
- **Behavior**: Auto-select and hide dropdown if only 1 team. Remember last selection if 2+ teams. Reload team-scoped data on switch.

## Navigation Structure
Tabs: 1. Overview, 2. Team, 3. Roster, 4. Requests, 5. Free Agents, 6. Events, 7. Payments, 8. Settings

## Tabs Breakdown
### 1. Overview (team-scoped)
- **Team Summary**: Team name, Team tag, Status, Invite code quick copy, Roster lock chip.
- **Roster Health**: Active players, Pending join requests, Player card coverage summary (Verified vs Not verified).
- **Requests Summary**: Incoming/Outgoing requests counts, Recent activity list.
- **Event Summary**: Next event info, Team registration status, Covered/Uncovered slots, Players cleared vs not cleared.
- **Payments Summary**: Outstanding player card payments count & total, Outstanding event payments total, Link to Payments tab.
- **Actions**: Copy invite code, Go to roster, Lock roster, Go to register for next event, Go to payments to pay outstanding.

### 2. Team (team-scoped)
- **Team Profile**: Name, Logo, City, Division, Description, Read-only (Team tag, Coach owner, Team status).
- **Invite Code**: Current invite code, Copy button, Regenerate button, Join instructions snippet. Roster lock blocks joins. Status pending optionally blocks joins.
- **Team Managers**: Manager accounts list, Usage cap, Add/Create manager forms. Manager permissions reminder.

### 3. Roster (team-scoped)
- **Columns**: Player tag, Name, Position, Jersey number, Player card status, Event coverage status, Membership status.
- **Actions**: View details, Remove player, Assign jersey number, Confirm jersey.
- **Roster Lock**: Toggle lock, Lock confirmation dialog with consequences.
- **Player Detail Drawer**: Team-managed fields (Team position, Jersey number, Team notes, Stats-related fields). Does not edit core identity.

### 4. Requests (team-scoped)
- **Incoming**: Sources (Invite code, Free agent acceptances). Show player tag, type, status, timestamp. Actions: Approve, Reject, Finalize add to roster.
- **Outgoing**: Requests sent to free agents. Show player name/tag, Date sent, Status, Actions: Cancel, Proceed to add. Rate limiting & anti-spam constraints.

### 5. Free Agents (team-scoped)
- **Filters**: Position, City, Age group, Height/Weight, Verified only (default on).
- **Search Results**: Unassigned, active card, visibility enabled. Card shows basic info and Verified badge.
- **Detail View**: Photo, bio, position, highlights, player card status. Button to send request. Shows if already requested. Hard blocking if roster locked or team not linked.

### 6. Events (team-scoped)
- Events List: Upcoming, Registered, Past.
- Event Detail: Event info, Team registration status, Roster eligibility breakdown, Coverage summary.
- Registration Flow:
  1. Confirm roster snapshot.
  2. Player card coverage selection (Pay for unverified players).
  3. Event slot purchase.
  4. Assign event slots to players.
  5. Review and pay (Totals, Non-refundable notice).
  6. Confirmation (Covered and cleared vs Not covered vs Needs card).

### 7. Payments (team-scoped)
- **Player Cards**: List roster with status, show team-paid vs self-paid, bulk pay, history & receipts.
- **Event Payments**: List events, slots purchased, players covered, payment total, receipts.
- **Billing History**: All payments, date/type/amount, receipt download, policy reminder.

### 8. Settings
- **Account Settings (Coach-level)**: My Profile (Name, Email, Phone, Org info), Security (Password change), Notifications.
- **Team Settings Shortcut**: Link to Team Profile, Invite Code, Team Managers.
- Display descriptions clarifying scope of settings.

## Instructions / To Do Lists for AI Updates
1. Add team selector, coach can manage multiple teams.
2. Rebuild nav to the 8 tabs listed.
3. Split Settings into Account & Team shortcuts.
4. Implement event registration flow (coverage, slots, assignment).
5. Implement payments tracking (player cards, events, receipts).
6. Enforce roster lock blocking joins and free agent actions.
7. Enforce free agent eligibility filters strictly.
