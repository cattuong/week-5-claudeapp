# Dashboard / Layout Spec Template

Use this template to write the dashboard and layout spec for any app after planning.
Replace all guidance text with real content from your app plan.

---

## Feature Name
Name this feature clearly. Example: "Dashboard Layout", "App Shell", "Home Screen".

---

## Description
Describe:
- The overall layout structure (how many panels, what each panel does)
- What the app shell includes (sidebar, header, main content, right panel)
- What the default view shows when nothing is selected (overview, stats, feed, empty state)
- How the view transitions between states (e.g. list view → detail view, home → active item)

---

## Layout

Draw a simple ASCII diagram or describe in plain words:
- How many panels or zones exist, their widths or proportions
- What each zone contains at rest and when an item is active
- Which zones are always visible vs. contextually shown

Example structure (3-panel):
```
┌───────────────────────────────────────────────────┐
│  Sidebar (fixed)  │  Main (flex-1)  │  Panel (fixed) │
└───────────────────────────────────────────────────┘
```

Describe what changes in each zone when the user selects an item or takes an action.

---

## State Architecture

Document what state the root dashboard component owns and why it must live there:
- List every piece of shared state (IDs, lists, loaded content, loading flags, etc.)
- For each: which child components need it, and why it cannot live lower in the tree
- List every callback child components call to update parent state
- Note callback signatures and what each one triggers

---

## Home / Default View

Describe what the user sees when no item is selected or the app first loads.

### KPI / Metric Cards (if applicable)
If the home view shows summary metrics:
- List every metric to display (total items, today's count, weekly activity, status breakdowns, etc.)
- For each metric: where the data comes from (which table/field), how it is calculated
- Single API call vs. derived from already-loaded data — document the choice
- Loading state: skeleton placeholders (same dimensions as the value) while fetching
- Error state: show `--` and a muted sub-label when the API call fails
- Card layout: describe the grid (e.g. 3-column, responsive to 2 on tablet, 1 on mobile)
- Card anatomy: label, primary value, optional sub-label or trend indicator

### Recent Activity Feed (if applicable)
If the home view shows a chronological event timeline:
- List every event type that appears (item created, action taken, status changed, export generated, etc.)
- For each: the icon to use, the label format, what data it references
- Data source: derived from existing tables (list which) or a dedicated activity table
- Sort order and cap (e.g. most recent 20 events)
- Each row: icon, label text, relative timestamp
- Relative time format: "just now", "Xm ago", "Xh ago", "yesterday", full date fallback
- Empty state: what to show when there are no events yet

---

## Sidebar

Document every element the sidebar contains, top to bottom:
- Logo / app name area
- Primary action button (e.g. New Item, Compose, Create)
- Search input (if present — see Search section below)
- Filter or navigation tabs (if present — see Filter Tabs section)
- Item list (scrollable — see Item List section)
- User footer (profile, settings, logout)

**Width and background:** document the exact values.

### Search (if applicable)
- Where the input appears relative to the item list
- What it searches: titles only, or all fields
- Whether search is client-side (filter already-loaded data) or server-side
- Does search compose with active filter? (Usually yes — document clearly)
- What is shown when no results match

### Filter Tabs (if applicable)
List every filter option and what it does:
| Tab label | Filter logic (plain English) |
|---|---|
| All | no filter applied |
| [Tab 2] | [what condition this matches] |
| [Tab 3] | [what condition this matches] |
| ... | ... |

- Default active tab on load
- Active tab visual style vs. inactive style
- Whether filter and search compose (applied simultaneously)

### Item List
Describe each row in the item list:
- Height, padding, border-radius
- Left indicator (status icon, avatar, color dot, etc.) and what it represents
- Primary text (truncated title, name, etc.)
- Secondary text (timestamp, count, status label — placement and format)
- Active / selected state visual treatment
- Sort order (e.g. pinned first, then by last-updated descending)

**Status icons (if applicable):** document the mapping from status value to icon and color.

**Special indicators (if applicable):** e.g. pin dot, unread badge, attachment icon — position and meaning.

### Item Context Menu (if applicable)
If items have a right-click or hover menu:
- What triggers it (hover button, right-click, long-press)
- Every action it contains: label, icon, API call, effect on local state
- Destructive actions: visual treatment (error color), confirmation if needed
- How the menu closes (outside click, Escape, action taken)

### User Footer
- What is shown: display name, email, avatar
- Actions available: settings link, logout
- What logout does: what it clears (localStorage, cookies), where it redirects

---

## Right Panel (if applicable)

If your layout has a right panel:
- Width and background
- What it shows in each state (empty vs. item selected vs. file loaded)
- What props it receives
- How it is divided into sections (e.g. preview section above, metadata section below)

**Content Preview (if applicable)**
- What content types can be previewed (PDF, image, text, video, etc.)
- How each type is rendered (iframe, canvas, img, pre, etc.)
- What proportion of the panel height the preview takes
- What is shown while loading (skeleton, spinner)
- What is shown when no content is available

**Activity / Steps (if applicable)**
- What the secondary section shows (execution steps, metadata, related items, etc.)
- Empty state text

---

## Database Changes Required (if applicable)

If new columns or tables are needed to support this feature, document:
- The exact SQL to add each column or create each table
- Any triggers or functions needed (e.g. auto-updating timestamps)
- Any indexes needed for performance

---

## API Routes

Document every API route this feature adds or modifies:

### `GET /api/[resource]?[params]`
Purpose, params, response shape.

### `POST /api/[resource]`
Purpose, request body, response shape.

### `PATCH /api/[resource]/[id]`
Which fields can be updated, response shape.

### `DELETE /api/[resource]/[id]`
What is deleted (and cascades if applicable), response shape.

---

## Components

List every new component this feature requires:

| Component | File | Responsibility | Key props |
|---|---|---|---|
| [Name] | components/[Name].tsx | What it renders | prop1, prop2 |

---

## Edge Cases

Cover the important ones — tailor to your feature:
- Empty state: no items, no data — what does the user see?
- Load failure: API errors — how are they surfaced?
- Destructive action on the active item — what happens to the active view?
- Invalid input (e.g. empty rename, out-of-range value) — how is it rejected?
- Filter + search with zero results — what is shown?
- Rapid switching between items — how is stale data avoided?
