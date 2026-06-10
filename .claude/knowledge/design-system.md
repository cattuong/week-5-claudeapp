# Harvey Design Research Notes

**Sources reviewed:** https://www.harvey.ai, https://www.harvey.ai/blog/rebuilding-harveys-design-system-from-the-ground-up, https://www.harvey.ai/blog/how-we-approach-design-at-harvey

---

## Raw Research

### Brand Theme Color
- Meta theme-color: `#1F1D1A` — confirmed as brand dark baseline

### Color System (from "Rebuilding Harvey's Design System" blog, Jan 2026)
- Warm neutral palette, hue locked at ~90° OKLCH
- Higher chroma in light tones → cleaner whites
- Lower chroma in dark tones → avoids brown shifts
- Accent families: **amber**, **olive**, **jade**
- WCAG accessible across light + dark modes
- Token naming: `hy-` prefix (e.g. `bg-hy-bg-base`, `text-hy-fg-subtle`)
- Semantic roles: `fg-base`, `fg-subtle`, `bg-base`, `bg-subtle`, etc.
- Previously chaotic: neutrals ranging 910–940 in some places, 100–1000 in others
- GitHub Action syncs Figma variables → codebase automatically

### Typography (from "How We Approach Design" blog, Nov 2025)
- "From our type system to our tone of voice, every element is crafted to convey confidence, clarity, and trust"
- Shows a "Typeface" SVG illustration — specific font not confirmed
- Production likely uses a licensed grotesque (possibly Söhne/similar)
- This DS uses Geist (closest freely available match) + Cormorant Garamond (serif display)

### Design Principles (from "How We Approach Design")
1. Design With Domain Awareness
2. Make the Complex Feel Effortless
3. Design With Intention

### Key Quotes
- "We design the way lawyers write: saying the most with the least"
- "Every pixel works hard so our users don't have to"
- "Precision in design reflects the precision our customers bring to their work"
- "Earning trust starts with how thoughtfully we design every detail"
- "For many of our customers, Harvey is their first experience using AI in a professional setting"

### Products
Assistant, Vault, Knowledge, Agents, Harvey Mobile, Ecosystem, Contract Intelligence, Command Center, Shared Spaces

### Tech Stack
- React + Tailwind CSS
- Tailwind token classes: `bg-hy-bg-base`, `text-hy-fg-subtle`, etc.
- Linter rules enforcing semantic tokens (warnings → errors at 95% adoption)
- Cursor rules for AI-assisted dev
- Figma as single source of truth via GitHub Actions sync

### Motion/Interaction
- Minimal, fast (100–150ms)
- ease-out-expo: `cubic-bezier(0.16, 1, 0.3, 1)`
- No bounces in product UI
- Opacity fades, subtle translateY entrances

### Layout Signals
- Dark mode is primary product experience
- Light mode used on marketing site
- Sidebar navigation (narrow icon strip + content list)
- Composer-style input at bottom of chat
- Dense, information-rich tables for document review (Vault)

### Copy/Voice
- No emoji, no exclamation marks
- Sentence case throughout
- "we" for Harvey as team, "you" for user
- Active voice, short sentences, no filler
- Legal vocabulary used naturally (not simplified)

---

## Inferences / Decisions Made

1. **Typography substitution:** Geist for sans (likely Söhne or similar in prod), Cormorant Garamond for serif display (likely Tiempos or similar)
2. **Color values:** Derived from OKLCH at hue ~90° per blog description, anchored to confirmed `#1F1D1A`
3. **Accent colors:** amber/olive/jade confirmed by name in blog, values derived from OKLCH principles
4. **Icon system:** Lucide (stroke, 1.5px, rounded) — inferred from component aesthetic; actual system not confirmed
5. **Border radius:** 4–8px range — standard for dense professional tool UIs
6. **No gradients on surfaces** — confirmed by "flat, clean layers" aesthetic
