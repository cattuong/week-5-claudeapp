# Task 02: Design Tokens

## Status

complete

## Wave

1

## Description

Create the LegalGraph design token CSS files that define all CSS custom properties (variables) used across the app. These tokens — colors, typography, spacing, shadows, radii, motion — are the single source of truth for the visual design system. Every component in this project reads colors and sizing from these variables rather than hardcoding values. This task runs in parallel with task-01 and task-03 and has no code dependencies.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-05-app-routing-shell, task-08-ui-primitives

**Context from dependencies:** None — this is a Wave 1 foundation task.

## Files to Create

- `src/tokens/colors.css` — all color tokens (neutrals, blue primary, brass accent, semantic aliases, risk scale)
- `src/tokens/typography.css` — font families, type scale, line heights, letter spacing, helper classes
- `src/tokens/spacing.css` — spacing scale, layout tokens, radii, shadows, z-index, motion
- `src/tokens/base.css` — element resets and document defaults (applies font, background, color)

## Files to Modify

- `src/index.css` — import all four token files after the `@tailwind` directives

## Technical Details

### Implementation Steps

1. Create `src/tokens/colors.css` with the full LegalGraph color palette:

```css
/* src/tokens/colors.css */
:root {
  /* Base Neutrals */
  --ivory: #F8F4EC;
  --sand: #F0E9DA;
  --parchment: #EAE1CF;
  --paper: #FCFAF5;
  --white: #FFFFFF;
  --ink-950: #15120D;
  --ink-900: #1C1812;
  --ink-700: #3E382D;
  --ink-500: #6E6555;
  --ink-400: #908674;
  --ink-300: #B6AC97;
  --line-strong: #D8CDB6;
  --line: #E4DAC6;
  --line-soft: #EFE7D6;

  /* Primary — Graph Ink-Blue */
  --blue-900: #16263F;
  --blue-800: #1C3253;
  --blue-700: #234063;
  --blue-600: #2B4C77;
  --blue-300: #94AAC6;
  --blue-100: #DCE5F0;
  --blue-50: #EDF2F8;

  /* Accent — Brass */
  --brass-600: #A87330;
  --brass-500: #C2913E;
  --brass-400: #D6AC5E;
  --brass-300: #E5C68A;
  --brass-100: #F3E6CB;

  /* Risk Scale */
  --danger-fg: #8F3320;
  --danger-bg: #FAEDE7;
  --danger-border: #F4DDD4;
  --warn-fg: #9A6716;
  --warn-bg: #FBF3DF;
  --warn-border: #F6E8C8;
  --safe-fg: #1F5D3E;
  --safe-bg: #ECF4EE;
  --safe-border: #D7E9DD;

  /* Semantic Surface Aliases */
  --surface-canvas: var(--ivory);
  --surface-sunken: var(--sand);
  --surface-card: var(--paper);
  --surface-raised: var(--white);
  --surface-inverse: var(--blue-900);
  --surface-well: var(--parchment);

  /* Semantic Text Aliases */
  --text-strong: var(--ink-950);
  --text-body: var(--ink-900);
  --text-secondary: var(--ink-500);
  --text-muted: var(--ink-400);
  --text-inverse: #F4EEDF;
  --text-link: var(--brass-600);
  --text-on-primary: #F6F1E6;

  /* Semantic Border Aliases */
  --border-strong: var(--line-strong);
  --border-default: var(--line);
  --border-soft: var(--line-soft);
  --border-focus: var(--blue-600);

  /* Brand */
  --brand-primary: var(--blue-600);
  --brand-primary-hover: var(--blue-700);
  --brand-primary-press: var(--blue-800);
  --brand-accent: var(--brass-500);
  --brand-accent-hover: var(--brass-600);

  /* Risk Semantic */
  --risk-high-fg: var(--danger-fg);
  --risk-high-bg: var(--danger-bg);
  --risk-high-border: var(--danger-border);
  --risk-med-fg: var(--warn-fg);
  --risk-med-bg: var(--warn-bg);
  --risk-med-border: var(--warn-border);
  --risk-low-fg: var(--safe-fg);
  --risk-low-bg: var(--safe-bg);
  --risk-low-border: var(--safe-border);

  /* Focus Ring */
  --ring: 0 0 0 3px rgba(43, 76, 119, 0.28);

  /* Selection */
  --selection-bg: var(--brass-100);
  --selection-fg: var(--ink-950);
}
```

2. Create `src/tokens/typography.css`:

```css
/* src/tokens/typography.css */
:root {
  --font-display: 'Spectral', Georgia, 'Times New Roman', serif;
  --font-heading: 'Spectral', Georgia, 'Times New Roman', serif;
  --font-body: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-ui: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-data: 'IBM Plex Mono', 'Menlo', 'Courier New', monospace;

  /* Type Scale */
  --text-6xl: 76px;
  --text-5xl: 60px;
  --text-4xl: 48px;
  --text-3xl: 38px;
  --text-2xl: 30px;
  --text-xl: 24px;
  --text-lg: 20px;
  --text-md: 18px;
  --text-base: 16px;
  --text-sm: 14px;
  --text-xs: 13px;
  --text-2xs: 12px;
  --text-3xs: 11px;

  /* Line Heights */
  --leading-tight: 1.12;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.62;

  /* Letter Spacing */
  --tracking-tighter: -0.022em;
  --tracking-tight: -0.012em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.08em;
  --tracking-caps: 0.14em;
}

/* Helper classes */
.lg-display {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tighter);
}
.lg-h1 {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: 500;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}
.lg-h2 {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 500;
  line-height: var(--leading-snug);
}
.lg-h3 {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: var(--leading-snug);
}
.lg-lead {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
.lg-body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-body);
}
.lg-small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}
.lg-eyebrow {
  font-family: var(--font-data);
  font-size: var(--text-2xs);
  font-weight: 500;
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--brand-accent);
}
.lg-mono {
  font-family: var(--font-data);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}
```

3. Create `src/tokens/spacing.css`:

```css
/* src/tokens/spacing.css */
:root {
  /* Spacing Scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;
  --space-11: 80px;
  --space-12: 96px;

  /* Layout */
  --container-sm: 640px;
  --container-md: 820px;
  --container-lg: 1080px;
  --container-xl: 1280px;
  --gutter: 24px;
  --header-h: 64px;
  --sidebar-w: 264px;

  /* Radii */
  --radius-xs: 3px;
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 22px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-xs: 0 1px 1px rgba(40, 30, 16, 0.05);
  --shadow-sm: 0 1px 3px rgba(40, 30, 16, 0.08), 0 1px 2px rgba(40, 30, 16, 0.06);
  --shadow-md: 0 4px 6px rgba(40, 30, 16, 0.07), 0 2px 4px rgba(40, 30, 16, 0.06);
  --shadow-lg: 0 10px 15px rgba(40, 30, 16, 0.08), 0 4px 6px rgba(40, 30, 16, 0.05);
  --shadow-xl: 0 20px 25px rgba(40, 30, 16, 0.1), 0 10px 10px rgba(40, 30, 16, 0.04);
  --shadow-inset: inset 0 1px 2px rgba(40, 30, 16, 0.08);

  /* Z-Index Scale */
  --z-base: 0;
  --z-sticky: 100;
  --z-overlay: 900;
  --z-modal: 1000;
  --z-toast: 1100;
  --z-tooltip: 1200;

  /* Motion */
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --dur-slow: 320ms;
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-emph: cubic-bezier(0.16, 1, 0.3, 1);
  --transition-control: color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);

  /* Border widths */
  --border-hair: 1px;
  --border-thick: 1.5px;
  --border-heavy: 2px;
}
```

4. Create `src/tokens/base.css`:

```css
/* src/tokens/base.css */
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background-color: var(--surface-canvas);
  color: var(--text-body);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

::selection {
  background-color: var(--selection-bg);
  color: var(--selection-fg);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

5. Update `src/index.css` to import token files after the Tailwind directives. The final `src/index.css` should be:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/base.css';
```

## Acceptance Criteria

- [ ] `npm run build` succeeds with all token files present
- [ ] CSS variable `--surface-canvas` resolves to `#F8F4EC` when inspected in browser DevTools
- [ ] CSS variable `--brand-primary` resolves to `#2B4C77`
- [ ] Body background is ivory (`#F8F4EC`), not white or gradient
- [ ] `.lg-eyebrow` class renders in IBM Plex Mono with brass color and wide letter-spacing
- [ ] All four token files are importable without PostCSS errors

## Notes

- These are plain CSS custom properties — no Sass, no CSS Modules. They're global and available everywhere.
- The `@import` statements in `index.css` must come AFTER the `@tailwind` directives, not before, to avoid PostCSS ordering issues.
- Do not add any gradient backgrounds — the design system explicitly forbids them in product UI.
