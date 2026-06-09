# Task 01: TypeScript + Tailwind Setup

## Status

complete

## Wave

1

## Description

Convert the existing plain JSX React project to TypeScript and add Tailwind CSS. This is the foundation task — every subsequent task writes TypeScript files and uses Tailwind utility classes. The project currently has `src/App.jsx` and `src/main.jsx` (plain JS) and no Tailwind. After this task, the project compiles TypeScript with strict mode, Vite resolves `.tsx` files, and Tailwind's JIT compiler processes all `src/**/*.tsx` files.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-04-supabase-client-auth, task-05-app-routing-shell, task-07-contract-parser, task-08-ui-primitives

**Context from dependencies:** None — this is the first task.

## Files to Create

- `tsconfig.json` — TypeScript compiler config (strict mode, react-jsx, bundler module resolution)
- `tsconfig.node.json` — TypeScript config for Vite config file
- `tailwind.config.ts` — Tailwind content paths and theme extension with CSS variable references
- `postcss.config.js` — PostCSS config required by Tailwind

## Files to Modify

- `package.json` — add TypeScript, @types/react, @types/react-dom, tailwindcss, postcss, autoprefixer, pdfjs-dist, @supabase/supabase-js, react-router-dom as dependencies
- `vite.config.js` → rename to `vite.config.ts` (update import to use TypeScript)
- `src/App.jsx` → rename to `src/App.tsx` (replace welcome screen with a plain placeholder that compiles cleanly)
- `src/main.jsx` → rename to `src/main.tsx` (no logic changes, just extension)
- `index.html` — add Google Fonts link tags for Spectral, IBM Plex Sans, IBM Plex Mono
- `src/index.css` — add Tailwind directives at top

## Technical Details

### Implementation Steps

1. Install all dependencies in one shot:
   ```bash
   npm install react-router-dom @supabase/supabase-js pdfjs-dist
   npm install -D typescript @types/react @types/react-dom tailwindcss postcss autoprefixer @vitejs/plugin-react
   ```

2. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true,
       "noUnusedLocals": false,
       "noUnusedParameters": false,
       "noFallthroughCasesInSwitch": true
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   ```

3. Create `tsconfig.node.json`:
   ```json
   {
     "compilerOptions": {
       "composite": true,
       "skipLibCheck": true,
       "module": "ESNext",
       "moduleResolution": "bundler",
       "allowSyntheticDefaultImports": true
     },
     "include": ["vite.config.ts"]
   }
   ```

4. Rename `vite.config.js` → `vite.config.ts` (content stays identical, import already uses ESM).

5. Create `tailwind.config.ts`:
   ```ts
   import type { Config } from 'tailwindcss'

   export default {
     content: ['./index.html', './src/**/*.{ts,tsx}'],
     theme: {
       extend: {
         colors: {
           canvas: 'var(--surface-canvas)',
           sunken: 'var(--surface-sunken)',
           card: 'var(--surface-card)',
           raised: 'var(--surface-raised)',
           inverse: 'var(--surface-inverse)',
           well: 'var(--surface-well)',
           primary: 'var(--brand-primary)',
           'primary-hover': 'var(--brand-primary-hover)',
           accent: 'var(--brand-accent)',
           'accent-hover': 'var(--brand-accent-hover)',
           'text-strong': 'var(--text-strong)',
           'text-body': 'var(--text-body)',
           'text-secondary': 'var(--text-secondary)',
           'text-muted': 'var(--text-muted)',
           'text-inverse': 'var(--text-inverse)',
           border: 'var(--border-default)',
           'border-strong': 'var(--border-strong)',
         },
         fontFamily: {
           display: ['Spectral', 'Georgia', 'serif'],
           body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
           mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
         },
         borderRadius: {
           xs: 'var(--radius-xs)',
           sm: 'var(--radius-sm)',
           md: 'var(--radius-md)',
           lg: 'var(--radius-lg)',
           xl: 'var(--radius-xl)',
           pill: 'var(--radius-pill)',
         },
         boxShadow: {
           xs: 'var(--shadow-xs)',
           sm: 'var(--shadow-sm)',
           md: 'var(--shadow-md)',
           lg: 'var(--shadow-lg)',
           xl: 'var(--shadow-xl)',
         },
       },
     },
   } satisfies Config
   ```

6. Create `postcss.config.js`:
   ```js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

7. Update `src/index.css` — replace entire content with:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   (Token imports will be added in task-02.)

8. Rename `src/App.jsx` → `src/App.tsx` and replace its content with a minimal valid TypeScript placeholder:
   ```tsx
   export default function App() {
     return <div className="min-h-screen bg-canvas font-body text-text-body" />
   }
   ```

9. Rename `src/main.jsx` → `src/main.tsx` — content is identical, just change the extension.

10. Update `index.html` — add Google Fonts inside `<head>` before the closing tag:
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
    ```
    Also update the `<title>` to `LegalGraph`.

11. Delete the old `.jsx` files (`src/App.jsx`, `src/main.jsx`) to avoid duplicate module errors.

### Environment Variables

Create `.env.example` at project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Acceptance Criteria

- [ ] `npm run build` completes without TypeScript errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Dev server starts with `npm run dev` and renders a blank ivory page (no gradient, no welcome text)
- [ ] Tailwind utility classes are recognized in `.tsx` files (verify by adding `className="text-primary"` and confirming no build error)
- [ ] Google Fonts link tags are present in `index.html`

## Notes

- Do NOT delete `AGENTS.md`, `CLAUDE.md`, or `DESIGN.md` — these are project meta files.
- `noUnusedLocals` and `noUnusedParameters` are set to `false` intentionally — the project is mid-construction and these would fire constantly.
- The old `src/App.jsx` and `src/main.jsx` must be deleted after creating the `.tsx` versions to prevent Vite's module resolution from picking up the wrong file.
