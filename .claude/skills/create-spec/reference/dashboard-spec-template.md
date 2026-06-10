# Dashboard / Layout Spec Template

Use this template to write the dashboard and layout spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this feature. Example: "Dashboard Layout" or "App Shell".

---

## Description
Describe:
- The overall layout structure (how many panels, what each panel contains)
- What the app shell includes (sidebar, header, content area, right panel)
- What the main default view shows when nothing is selected
- How the app transitions between different states (e.g. home view vs. active session)

---

## Layout
Draw a simple ASCII diagram or describe in words:
- How many panels exist and their widths/proportions
- What each panel contains
- How panels change based on app state (e.g. right panel shows preview when file is loaded)

---

## State Architecture
Document what state lives at the dashboard level and why:
- List every piece of shared state owned by the root dashboard component
- Explain why each piece must live at the top level (which child components need it)
- List the key callbacks that child components call to update this state
- Describe the callback signatures and what each one does

---

## Home / Default View (Dashboard)
Describe what the user sees when no item is selected:
- What content is shown (welcome message, stats, recent items, CTA buttons)
- What each element does
- What props this component receives
- What it looks like in the empty/first-use state vs. with existing data

**KPI Cards**
If the home view includes metric cards:
- List every metric shown (total sessions, documents uploaded, AI queries, pinned chats, etc.)
- Which metrics are computed client-side from already-loaded data
- Which metrics require a separate API call (`GET /api/stats?userId=`)
- How the stats API response shape looks
- What is shown while stats are loading (keep the value `0` or show a skeleton)
- How the grid is laid out (e.g. 3-column grid, responsive)

**Recent Activity Feed**
If the home view includes a chronological event timeline:
- What event types appear (chat started, contract uploaded, query executed, etc.)
- Where the events come from (derived from sessions/messages data, or a dedicated activity table)
- How events are sorted and capped (e.g. last 10 events, sorted by timestamp desc)
- What each item shows: icon, label, relative timestamp

---

## Sidebar
Describe the sidebar in full detail:
- Width and background style
- Every element it contains (logo, search, filter tabs, session list, user footer)
- How the active/selected item is visually indicated
- How the item list behaves (scrollable, truncation, timestamps)
- What the user footer contains (email, logout)
- What logout does (what it clears, where it redirects)
- What props the sidebar component receives

**Search**
- Where the search input appears (above or below the New Chat button)
- What it searches (session titles only, or also filenames)
- Whether search is client-side (filter already-loaded sessions) or server-side
- What is shown when no results match

**Filter Tabs**
- List every filter option (All, Pinned, Recent, etc.)
- What each filter does (e.g. Recent = sessions from last 7 days)
- Whether filters and search compose (both applied simultaneously)
- Default active filter on load

**Session Item Actions**
Each item in the session list should support:
- **Pin / Unpin**: persists to DB via PATCH /api/sessions/[id]; pinned items sort to top; show a small dot indicator when pinned
- **Rename**: inline edit — clicking Rename replaces the title with an `<input>`, Enter/blur saves it; PATCH /api/sessions/[id] with `{ title }`
- **Delete**: DELETE /api/sessions/[id]; removes from local state; if the deleted session was active, clear the center panel
- Actions appear on hover via a 3-dot `MoreHorizontal` icon button; clicking opens a dropdown menu
- Dropdown items: Pin/Unpin, Rename, (divider), Delete (in error color)

**Notes / Planning Panel (if applicable)**
Remove this section if your sidebar has no notes panel.

---

## Right Panel (if applicable)
If your layout has a right panel:
- What it shows in each state (e.g. metadata + content preview when item loaded, empty prompt otherwise)
- What props it receives (item metadata, fetched content, loading state)
- How its content changes dynamically as the user selects different items

**Content Preview (if applicable)**
Always spec this section even if you're unsure — omitting it means preview never gets built.

- Where the preview data comes from:
  - PDF: `URL.createObjectURL(file)` blob URL created on the client before parsing
  - DOCX: the extracted `contractText` string already in state (no blob URL needed)
- What props the right panel receives:
  - `contractPreview: { url: string; type: string; filename: string } | null`
  - `contractText?: string` — for DOCX text rendering
- How to render based on type:
  - PDF (`application/pdf`): `<iframe src={contractPreview.url}>` — browser native viewer
  - DOCX: scrollable `<pre>` with `contractText`, truncated at ~4000 chars
- Layout inside the right panel:
  - When a file is loaded: document preview takes ~55% of height, Activity section below
  - When no file: Activity fills the full panel
- What is shown while loading (skeleton, spinner, empty div)
- What is shown when the content is null (just "Waiting for activity…" in Activity section)

Remove this section if your layout has no right panel.

---

## Center Panel Switching
Describe how the center content area switches between views:
- What condition determines which view is shown
- What component renders in each case
- What props each component receives
- What state is cleared or reset when switching views

---

## Components
List every component that makes up the layout:
- Component name and file path
- What it is responsible for
- What props it receives (just the names and types, not full interfaces)

---

## Edge Cases
Cover the important layout edge cases:
- What shows when there is no data yet (empty state)
- What happens when data fails to load
- What happens when the user switches between items rapidly
- How titles/labels update dynamically
