# LegalGraph Design System — Design.md

> **Aesthetic in one sentence:** warm editorial law-tech — ivory & sand canvas, espresso ink, a deep "graph" ink-blue primary, a brass accent, Spectral serif headlines over precise IBM Plex Sans/Mono.

---

## Table of Contents

1. [Brand & Product Context](#1-brand--product-context)
2. [Voice & Tone](#2-voice--tone)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Elevation & Shadows](#6-elevation--shadows)
7. [Borders & Radii](#7-borders--radii)
8. [Motion](#8-motion)
9. [Iconography](#9-iconography)
10. [Components](#10-components)
11. [File Structure](#11-file-structure)
12. [Consuming the System](#12-consuming-the-system)
13. [Caveats & Open Questions](#13-caveats--open-questions)

---

## 1 · Brand & Product Context

**LegalGraph** is an AI platform that reviews contracts and analyzes legal risk for in-house legal teams. It reads agreements clause-by-clause, compares them against a team's playbook, surfaces off-market and high-risk terms, and drafts redlines in the team's own voice.

**Product surfaces:**
- Contract Review Workspace (web app) — document viewer + AI issues/redlines
- Portfolio Dashboard — risk analysis across many contracts
- Sign-in / onboarding

**Audience:** Counsel and legal-ops — sophisticated, detail-driven, risk-aware. The brand must feel **trustworthy and editorial** (closer to a great law firm's letterhead than consumer SaaS) while signalling modern AI capability through technical, precise typography and data treatments.

---

## 2 · Voice & Tone

| Principle | Description |
|---|---|
| **Confident, plain, precise** | Short declarative sentences. Lead with outcome. No hedging, no hype. |
| **Second person, active** | "You / your team." Product is the subject of capability statements. |
| **Quantified, conservatively** | "64% faster review", "a three-day review into an afternoon." Specific and believable. |
| **Trust-forward** | Security and judgment are recurring: "counsel spends time on judgment, not first passes." |
| **Legal register, lightly** | Comfortable with *playbook, redline, indemnification, off-market, obligation, counterparty.* |
| **Casing** | Sentence case for headings and UI. ALL-CAPS only for tiny mono eyebrows. Title Case avoided. |
| **No emoji** | Ever, in product or marketing. |
| **Numbers & refs** | Use the mono face: `§ 12.4(b)`, `MSA-2024-0117`, `$2,480,000`. |

**Example microcopy:**
```
Eyebrow:   CLAUSE · INDEMNIFICATION
Heading:   Liability cap below market standard
Body:      Cap is set at 12 months of fees. Your playbook requires a minimum
           of 2× annual fees for agreements above $2M.
Primary:   Approve redlines
Secondary: Dismiss
```

---

## 3 · Color System

**Token file:** `tokens/colors.css`

### Base Neutrals (warm)

| Token | Value | Role |
|---|---|---|
| `--ivory` | `#F8F4EC` | Page canvas |
| `--sand` | `#F0E9DA` | Alt surface / wells |
| `--parchment` | `#EAE1CF` | Deeper sand, dividers |
| `--paper` | `#FCFAF5` | Card / raised surface (warm white) |
| `--white` | `#FFFFFF` | Pure white, raised on raised |
| `--ink-950` | `#15120D` | Maximum-contrast headings |
| `--ink-900` | `#1C1812` | Primary text (warm near-black) |
| `--ink-700` | `#3E382D` | Strong body |
| `--ink-500` | `#6E6555` | Secondary / muted text |
| `--ink-400` | `#908674` | Placeholder / disabled text |
| `--ink-300` | `#B6AC97` | Faint text |
| `--line-strong` | `#D8CDB6` | Visible hairline on ivory |
| `--line` | `#E4DAC6` | Default hairline |
| `--line-soft` | `#EFE7D6` | Whisper hairline |

### Primary — "Graph Ink-Blue"

| Token | Value | Role |
|---|---|---|
| `--blue-900` | `#16263F` | Deep headers, app chrome |
| `--blue-600` | `#2B4C77` | **PRIMARY** — buttons, chrome, links |
| `--blue-700` | `#234063` | Primary hover |
| `--blue-800` | `#1C3253` | Primary press |
| `--blue-300` | `#94AAC6` | Tints, borders |
| `--blue-100` | `#DCE5F0` | Subtle fills |
| `--blue-50` | `#EDF2F8` | Lightest wash |

### Accent — "Brass" (warm gold)

| Token | Value | Role |
|---|---|---|
| `--brass-500` | `#C2913E` | **ACCENT** — eyebrows, highlights, active node |
| `--brass-600` | `#A87330` | Accent text on light, links |
| `--brass-400` | `#D6AC5E` | Underlines, highlights |
| `--brass-300` | `#E5C68A` | Decorative tints |
| `--brass-100` | `#F3E6CB` | Highlight wash |

### Semantic — Risk Scale

Risk states are **intentionally desaturated and warm** so they read naturally on parchment.

| Level | Foreground | Background | Border |
|---|---|---|---|
| **High** (`--danger-*`) | `#8F3320` | `#FAEDE7` | `#F4DDD4` |
| **Medium** (`--warn-*`) | `#9A6716` | `#FBF3DF` | `#F6E8C8` |
| **Low** (`--safe-*`) | `#1F5D3E` | `#ECF4EE` | `#D7E9DD` |

### Semantic Aliases (use in product code)

```css
/* Surfaces */
--surface-canvas       /* ivory */
--surface-sunken       /* sand */
--surface-card         /* paper */
--surface-raised       /* white */
--surface-inverse      /* blue-900 */
--surface-well         /* parchment */

/* Text */
--text-strong          /* ink-950 */
--text-body            /* ink-900 */
--text-secondary       /* ink-500 */
--text-muted           /* ink-400 */
--text-inverse         /* #F4EEDF */
--text-link            /* brass-600 */
--text-on-primary      /* #F6F1E6 */

/* Borders */
--border-strong        /* line-strong */
--border-default       /* line */
--border-soft          /* line-soft */
--border-focus         /* blue-600 */

/* Brand */
--brand-primary        /* blue-600 */
--brand-primary-hover  /* blue-700 */
--brand-accent         /* brass-500 */
--brand-accent-hover   /* brass-600 */

/* Risk */
--risk-high-fg / --risk-high-bg / --risk-high-border
--risk-med-fg  / --risk-med-bg  / --risk-med-border
--risk-low-fg  / --risk-low-bg  / --risk-low-border

/* Other */
--ring                 /* focus ring: 3px blue-600 @ 28% alpha */
--selection-bg         /* brass-100 */
--selection-fg         /* ink-950 */
```

### Rules
- **Never pure-white pages.** White is reserved for raised cards.
- **Brass is used sparingly** — eyebrows, links, active state. Not a fill color.
- **No gradients** in product UI. One very subtle blue-tint wash is permitted on AI panel banners.
- **No cold greys.** All neutrals are warm brown-toned.

---

## 4 · Typography

**Token file:** `tokens/typography.css`

### Typeface Roles

| Role | Family | Token | Usage |
|---|---|---|---|
| Display / Headings | **Spectral** (serif) | `--font-display`, `--font-heading` | Hero, section headings, card titles |
| Body / UI | **IBM Plex Sans** | `--font-body`, `--font-ui` | Paragraphs, buttons, labels, inputs |
| Technical / Data | **IBM Plex Mono** | `--font-data` | Clause refs, IDs, currency, eyebrow labels |

**Fallback stacks:** defined in `tokens/typography.css` and `tokens/fonts.css`. Self-hosted woff2 files in `assets/fonts/`.

### Type Scale

| Token | Size | Common use |
|---|---|---|
| `--text-6xl` | 76px | Hero display |
| `--text-5xl` | 60px | `.lg-display` |
| `--text-4xl` | 48px | `.lg-h1` |
| `--text-3xl` | 38px | Section headings |
| `--text-2xl` | 30px | `.lg-h2` |
| `--text-xl` | 24px | `.lg-h3` |
| `--text-lg` | 20px | `.lg-lead` |
| `--text-md` | 18px | Emphasized body |
| `--text-base` | 16px | `.lg-body` — default |
| `--text-sm` | 14px | `.lg-small`, UI labels |
| `--text-xs` | 13px | Dense UI |
| `--text-2xs` | 12px | `.lg-eyebrow` (mono) |
| `--text-3xs` | 11px | Minimum (data tables) |

### Line Heights

| Token | Value | Use |
|---|---|---|
| `--leading-tight` | 1.12 | Display headings |
| `--leading-snug` | 1.25 | Sub-headings |
| `--leading-normal` | 1.5 | UI text |
| `--leading-relaxed` | 1.62 | Body copy (document reading) |

### Letter Spacing

| Token | Value | Use |
|---|---|---|
| `--tracking-tighter` | −0.022em | Large serif display |
| `--tracking-tight` | −0.012em | Headings |
| `--tracking-normal` | 0 | Body |
| `--tracking-wide` | 0.02em | Small UI |
| `--tracking-wider` | 0.08em | Eyebrows / overlines |
| `--tracking-caps` | 0.14em | Mono labels, all-caps |

### Helper Classes

| Class | Style |
|---|---|
| `.lg-display` | Spectral 60px / tight / −0.022em |
| `.lg-h1` | Spectral medium 48px / tight |
| `.lg-h2` | Spectral medium 30px / snug |
| `.lg-h3` | Spectral semibold 24px / snug |
| `.lg-lead` | Plex Sans 20px / relaxed / secondary |
| `.lg-body` | Plex Sans 16px / relaxed / body |
| `.lg-small` | Plex Sans 14px / normal / secondary |
| `.lg-eyebrow` | Plex Mono medium 12px / caps / wide tracking / brass |
| `.lg-mono` | Plex Mono 14px / normal |

---

## 5 · Spacing & Layout

**Token file:** `tokens/spacing.css`

### Spacing Scale (4px base)

| Token | Value | Token | Value |
|---|---|---|---|
| `--space-1` | 4px | `--space-8` | 40px |
| `--space-2` | 8px | `--space-9` | 48px |
| `--space-3` | 12px | `--space-10` | 64px |
| `--space-4` | 16px | `--space-11` | 80px |
| `--space-5` | 20px | `--space-12` | 96px |
| `--space-6` | 24px | `--space-13` | 128px |
| `--space-7` | 32px | `--space-14` | 160px |

### Layout

| Token | Value | Role |
|---|---|---|
| `--container-sm` | 640px | Small container |
| `--container-md` | 820px | Medium container |
| `--container-lg` | 1080px | Large container |
| `--container-xl` | 1280px | XL container |
| `--container-2xl` | 1440px | Full-width |
| `--gutter` | 24px | Default page gutter |
| `--header-h` | 64px | App top bar height |
| `--sidebar-w` | 264px | App left nav width |

### Z-Index Scale

| Token | Value | Role |
|---|---|---|
| `--z-base` | 0 | Default |
| `--z-sticky` | 100 | Sticky headers |
| `--z-overlay` | 900 | Sheet overlays |
| `--z-modal` | 1000 | Dialogs |
| `--z-toast` | 1100 | Notifications |
| `--z-tooltip` | 1200 | Tooltips |

---

## 6 · Elevation & Shadows

Shadows are **warm-tinted** (brown, not black) and soft — premium, never heavy.

| Token | Value | Use |
|---|---|---|
| `--shadow-xs` | `0 1px 1px rgba(40,30,16,.05)` | Hairline lift |
| `--shadow-sm` | 2-layer, ~6px spread | **Default cards** |
| `--shadow-md` | 2-layer, ~14px spread | Hover / raised cards |
| `--shadow-lg` | 2-layer, ~32px spread | Dropdowns, sheets |
| `--shadow-xl` | 2-layer, ~56px spread | **Modals** |
| `--shadow-inset` | `inset 0 1px 2px …` | Wells, input inset |

**Card hover pattern:** interactive cards translate up `2px` and use `--shadow-md` on hover.

---

## 7 · Borders & Radii

### Border Widths

| Token | Value |
|---|---|
| `--border-hair` | 1px — default hairline |
| `--border-thick` | 1.5px — emphasis |
| `--border-heavy` | 2px — focus, selected |

### Radii

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 3px | Tight chips, table cells |
| `--radius-sm` | 5px | Small badges, tags |
| `--radius-md` | 8px | **Default controls** (buttons, inputs) |
| `--radius-lg` | 12px | **Cards** |
| `--radius-xl` | 16px | Large panels |
| `--radius-2xl` | 22px | Large floating panels |
| `--radius-pill` | 999px | Status badges, full-pill buttons |

---

## 8 · Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120ms | Hover state color/border changes |
| `--dur-base` | 200ms | Standard transitions |
| `--dur-slow` | 320ms | Complex transitions (dialogs) |
| `--ease-out` | `cubic-bezier(.22,.61,.36,1)` | Most controls |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Reversible motions |
| `--ease-emph` | `cubic-bezier(.16,1,.3,1)` | Dialog pop (slight rise + scale) |

**`--transition-control`** is the shorthand used on all interactive controls — covers `color`, `background-color`, `border-color`, `box-shadow`, and `transform`.

### Rules
- **Fades over slides.** No bounces, no looping decorative animation.
- Dialog entrance: slight scale + rise using `--ease-emph` at `--dur-slow`.
- Always respect `prefers-reduced-motion`.
- Control press: `0.5px translateY` nudge + one step darker fill.

---

## 9 · Iconography

- **Library:** [Lucide](https://lucide.dev) — clean line icons at **1.75px stroke**, squared caps.
- **Loaded via:** `unpkg.com/lucide` CDN (or import from npm).
- **Sizes:**
  - 24px — chrome / navigation
  - 16–18px — inline in buttons, badges
  - 14–15px — dense table / issue contexts
- **Color:** `currentColor` — icons inherit text color. Nav icons inherit inverse text in the dark sidebar.
- **No emoji, no unicode pictographs** as icons.

**Common icons in product:**

| Icon | Use |
|---|---|
| `file-text` | Contracts |
| `scale` | Legal / balance |
| `shield-check` | Compliant / verified |
| `triangle-alert` | Risk warning |
| `git-compare` | Redlines / diff |
| `sparkles` | AI feature |
| `search` | Search |
| `pen-line` | Edit / redline |
| `book-open` | Playbook |
| `clock` | Timeline / expiry |
| `circle-check` | Approved |
| `building-2` | Organization |
| `bar-chart-3` | Analytics |
| `lock` | Security / private |

---

## 10 · Components

All components are React (JSX). Access via:
```js
const { Button, IconButton, Badge, /* … */ } = window.LegalGraphDesignSystem_23407e;
```

---

### Button

**File:** `components/buttons/Button.jsx` · **Types:** `components/buttons/Button.d.ts`

```tsx
<Button
  variant?  = "primary" | "accent" | "secondary" | "ghost" | "danger" | "link"
  size?     = "sm" | "md" | "lg"
  block?    = boolean          // stretch to full width
  iconLeft? = ReactNode        // Lucide SVG before label
  iconRight?= ReactNode        // Lucide SVG after label
  as?       = ElementType      // render as <a> etc.
>
  Label text
</Button>
```

| Variant | Use |
|---|---|
| `primary` | Main CTA (ink-blue fill) |
| `accent` | High-emphasis alternate CTA (brass fill) |
| `secondary` | Secondary actions (outlined) |
| `ghost` | Toolbar / low-emphasis actions (transparent) |
| `danger` | Destructive actions (red fill) |
| `link` | Inline text-link style |

---

### IconButton

**File:** `components/buttons/IconButton.jsx`

```tsx
<IconButton
  label     = string           // required — used as aria-label + title
  variant?  = "ghost" | "solid" | "outline"
  size?     = "sm" | "md" | "lg"
>
  <SomeLucideIcon />
</IconButton>
```

Square, icon-only. Default `ghost`. Use in toolbars and dense UI.

---

### Badge

**File:** `components/data-display/Badge.jsx`

```tsx
<Badge
  variant? = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "outline" | "solid"
  dot?     = boolean           // leading status dot
  icon?    = ReactNode         // leading icon
>
  Label
</Badge>
```

Small status / metadata pill. Default `neutral`.

---

### RiskBadge

**File:** `components/data-display/RiskBadge.jsx`

```tsx
<RiskBadge
  level? = "high" | "medium" | "low" | "none"
  solid? = boolean             // high-emphasis fill (for headers / counts)
  label? = string              // override default label text
/>
```

**The canonical way to show clause/document risk in LegalGraph.** Uses the warm semantic risk tokens. Use `solid` for prominent counts and header areas.

---

### Card

**File:** `components/data-display/Card.jsx`

```tsx
<Card
  variant?  = "default" | "flat" | "raised" | "interactive" | "accent"
  title?    = ReactNode
  subtitle? = ReactNode
  icon?     = ReactNode        // leading header icon
  aside?    = ReactNode        // right-aligned slot (Badge, IconButton, etc.)
  footer?   = ReactNode        // tinted footer bar
>
  Body content
</Card>
```

| Variant | Use |
|---|---|
| `default` | Standard card (shadow-sm, paper bg) |
| `flat` | No shadow, hairline border only |
| `raised` | Heavier shadow, slightly elevated |
| `interactive` | Hover lift animation (translate + shadow-md) |
| `accent` | Top brass rule for emphasis |

---

### Avatar & AvatarGroup

**File:** `components/data-display/Avatar.jsx`

```tsx
<Avatar
  name? = string               // drives initials + tooltip
  src?  = string               // optional image URL
  size? = "xs" | "sm" | "md" | "lg"
  tone? = "default" | "accent" | "ink"
/>

<AvatarGroup>
  <Avatar name="…" />
  <Avatar name="…" />
</AvatarGroup>
```

Falls back to initials from `name` when no `src`. `AvatarGroup` overlaps children for a reviewer cluster.

---

### Input

**File:** `components/forms/Input.jsx`

```tsx
<Input
  label?    = string
  hint?     = string           // helper text below
  error?    = string           // triggers invalid state
  required? = boolean          // shows asterisk on label
  icon?     = ReactNode        // 16px Lucide icon (leading)
  size?     = "md" | "lg"
  // ...all standard HTML input props
/>
```

---

### Switch

**File:** `components/forms/Switch.jsx`

```tsx
<Switch
  label? = string
  size?  = "sm" | "md"
  // ...standard checkbox input props (use checked/onChange for controlled)
/>
```

On/off toggle for settings and inline boolean controls.

---

### Checkbox

**File:** `components/forms/Checkbox.jsx`

```tsx
<Checkbox
  label? = string
  // ...standard checkbox input props
/>
```

For multi-select lists, filters, and consent.

---

### Tabs

**File:** `components/navigation/Tabs.jsx`

```tsx
<Tabs
  items        = TabItem[]     // [{ id, label, icon?, count? }]
  value?       = string        // controlled active id
  defaultValue?= string        // uncontrolled initial
  onChange?    = (id) => void
  variant?     = "underline" | "pill"
/>
```

Horizontal tab bar. `underline` (default) for page/section navigation; `pill` for contextual switching.

---

### Dialog

**File:** `components/overlay/Dialog.jsx`

```tsx
<Dialog
  open        = boolean
  onClose?    = () => void
  title?      = ReactNode
  description?= ReactNode
  icon?       = ReactNode      // leading header icon
  size?       = "sm" | "md" | "lg"
  footer?     = ReactNode      // typically a row of <Button>s
  showClose?  = boolean        // default true
>
  Body content
</Dialog>
```

Modal dialog with overlay scrim. Closes on overlay click and `Escape`. Entrance uses `--ease-emph` scale + rise. Scrim: ink at ~42% with 2px backdrop blur.

---

## 11 · File Structure

```
styles.css                          ← link this (import manifest)
tokens/
  fonts.css                         ← @font-face (Spectral, IBM Plex Sans/Mono)
  colors.css                        ← palette + semantic aliases
  typography.css                    ← families, scale, weights, helper classes
  spacing.css                       ← spacing, radii, shadows, layout, motion, z
  base.css                          ← element resets + document defaults
assets/
  fonts/                            ← self-hosted woff2 (latin subset)
  logo/
    legalgraph-mark.svg
    legalgraph-wordmark.svg
    legalgraph-wordmark-inverse.svg
  ds-runtime.js                     ← exposes window.LegalGraphDesignSystem_23407e
components/
  buttons/
    Button.jsx + Button.d.ts + Button.prompt.md
    IconButton.jsx + IconButton.d.ts + IconButton.prompt.md
    buttons.card.html               ← Design System tab specimen
  data-display/
    Badge, RiskBadge, Avatar, AvatarGroup, Card
    data-display.card.html
  forms/
    Input, Switch, Checkbox
    forms.card.html
  navigation/
    Tabs
    tabs.card.html
  overlay/
    Dialog
    dialog.card.html
guidelines/                         ← Foundation specimen cards
  brand-logo.card.html
  brand-iconography.card.html
  color-primary/accent/neutrals/semantic/surfaces.card.html
  type-display/body/mono/scale.card.html
  spacing-scale / radii / shadows .card.html
ui_kits/
  contract-review/                  ← Interactive product recreation
    index.html                      ← Entry: login → dashboard → workspace
    App.jsx, LoginScreen.jsx, ContractsDashboard.jsx
    ReviewWorkspace.jsx, DocumentPane.jsx, IssuesPanel.jsx
    Sidebar.jsx, TopBar.jsx
    kit.css, data.js, icons.js
    README.md
readme.md                           ← Full narrative doc
Design.md                           ← This file (design reference)
SKILL.md                            ← Claude Code skill manifest
```

---

## 12 · Consuming the System

### In a new HTML card or prototype

```html
<link rel="stylesheet" href="../../styles.css" />
<script src="../../assets/ds-runtime.js"></script>

<script type="text/babel">
  const { Button, RiskBadge, Card } = window.LegalGraphDesignSystem_23407e;

  function MyView() {
    return (
      <Card title="Indemnification" aside={<RiskBadge level="high" />}>
        <p className="lg-body">Liability cap below market standard.</p>
        <Button variant="primary">Approve redlines</Button>
      </Card>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<MyView />);
</script>
```

### Design System tab cards

Tag any `.html` file with a `@dsCard` comment as **line 1**:

```html
<!-- @dsCard group="Components" viewport="800x400" name="My Card" subtitle="…" -->
```

Groups: `Type`, `Colors`, `Spacing`, `Components`, `Brand`.

### Starting points

Add `@startingPoint` to a `.d.ts` JSDoc **or** as an HTML comment on line 1:

```html
<!-- @startingPoint section="Forms" subtitle="Login form with validation" viewport="400x600" -->
```

---

## 13 · Caveats & Open Questions

These elements were **designed / inferred** — not sourced from official brand files:

| # | Item | Status |
|---|---|---|
| 1 | **Logo** | Original placeholder (node-graph mark + Spectral wordmark). Replace with real files in `assets/logo/`. |
| 2 | **Fonts** | Spectral + IBM Plex Sans/Mono are proposals. Not confirmed brand fonts. |
| 3 | **Color palette** | Ink-blue + brass on ivory is a designed direction. Easy to retune in `tokens/colors.css`. |
| 4 | **Icons** | Lucide via CDN as closest match. Confirm with brand team. |
| 5 | **Copy & data** | All content in the UI kit is representative placeholder. |

**To align precisely:** share a screenshot of the live site, logo files, or Figma — the palette, type, and components can be updated to match.

---


