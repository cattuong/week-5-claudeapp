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

## Home / Default View
Describe what the user sees when no item is selected:
- What content is shown (welcome message, stats, recent items, CTA buttons)
- What each element does
- What props this component receives
- What it looks like in the empty/first-use state vs. with existing data

---

## Sidebar
Describe the sidebar in full detail:
- Width and background style
- Every element it contains (logo, navigation items, item list, user footer)
- How the active/selected item is visually indicated
- How the item list behaves (scrollable, truncation, dates)
- What the user footer contains (avatar, email, logout)
- What logout does (what it clears, where it redirects)
- What props the sidebar component receives

---

## Right Panel (if applicable)
If your layout has a right panel:
- What it shows in each state (e.g. preview when file loaded, tracker when empty)
- What props it receives
- How its content changes dynamically

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
