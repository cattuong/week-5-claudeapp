---
name: frontend-setup
description: >
  Scaffolds a complete Next.js 14 (App Router) project by writing all necessary
  files, creates a styled landing page, and runs the app end to end.
  Use this skill whenever the user asks to:
  - Set up a Next.js project or folder structure
  - Create a Next.js app for a lesson or class session
  - Bootstrap a Next.js environment with all dependencies
  - Get a Next.js landing page up and running
  - Start a new Next.js project (even casually, e.g. "let's set up Next.js" or "new Next app")
  Trigger this skill immediately when the user mentions Next.js setup or starting
  a Next.js project — even if they say it casually like "let's set up Next".
---

# Next.js Setup Skill

Your job is to scaffold a complete Next.js 14 (App Router) project end to end
by writing all files manually, then guiding the user to start the dev server.

Do every step in order. Do not skip any step.

---

## Step 1 — Ask the user about the project folder

Before creating anything, use the `AskUserQuestion` tool to ask the user:

**Question:** "Where would you like to set up the Next.js project?"
**Header:** "Project folder"
**Options:**
- **Create a new folder** — Scaffold a fresh `nextjs-app` folder (recommended for a clean start)
- **Use an existing folder** — Work inside a folder the user already has; ask them to type the folder path

If they choose **Create a new folder**: proceed with `nextjs-app` as the project directory inside the outputs folder.

If they choose **Use an existing folder**: ask them to provide the path, then use that path as the project root. Still write all the same files into it (overwriting any that already exist).

---

## Step 2 — Set up the project folder

Based on the user's answer from Step 1:
- **New folder**: Create `nextjs-app/` and `nextjs-app/app/` inside the outputs directory.
- **Existing folder**: Use the path they provided; create an `app/` subfolder inside it if it doesn't exist.

---

## Step 3 — Write `package.json`

```json
{
  "name": "nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

---

## Step 4 — Write `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

---

## Step 5 — Write `app/layout.jsx`

```jsx
export const metadata = {
  title: 'Next.js App',
  description: 'Built with Next.js 14 App Router',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
```

---

## Step 6 — Write `app/globals.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

---

## Step 7 — Write `app/page.jsx` (the landing page)

```jsx
export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      color: '#ffffff',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
        background: 'linear-gradient(90deg, #00c6ff, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Hello, Next.js 🚀
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: '#a8b2d8',
        maxWidth: '520px',
        lineHeight: 1.8,
        marginBottom: '2rem',
      }}>
        Your Next.js 14 app is up and running with the App Router. Let's build something amazing.
      </p>
      <a
        href="https://nextjs.org/docs"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '0.75rem 2rem',
          borderRadius: '999px',
          background: '#00c6ff',
          color: '#0f0c29',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(0,198,255,0.4)',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Read the Docs
      </a>
    </main>
  )
}
```

---

## Step 8 — Write `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXTAUTH_URL
```

Tell the user to replace the placeholder values with their actual Supabase project credentials from the [Supabase dashboard](https://supabase.com/dashboard) under **Project Settings → API**.

---

## Step 9 — Show the final folder structure

Tell the user what was created:

```
nextjs-app/
├── next.config.mjs
├── package.json
├── .env.local          ← Supabase credentials (fill in your values)
└── app/
    ├── layout.jsx      ← root layout (metadata, html/body tags)
    ├── globals.css     ← global styles
    └── page.jsx        ← your landing page
```

---

## Step 10 — Run the app (end to end)

Run it in the background:

```bash
cd <project-path> && nohup npm install && npm run dev -- --port 3000 > /tmp/nextjs-app.log 2>&1 &
sleep 8 && cat /tmp/nextjs-app.log
```

**If the server starts successfully**, tell the user:
> ✅ Your Next.js app is live at **http://localhost:3000** — open it in your browser!

**If npm is blocked or the server fails**, give the user these commands to run in their own terminal:

```bash
cd nextjs-app
npm install && npm run dev
```

Then tell them:
> Once it starts, open **http://localhost:3000** in your browser to see the landing page.

Either way, the user ends up with a running Next.js app. Keep the tone encouraging — this is a lesson context.

---

## Notes

- If the project folder already exists, delete it and start fresh.
- Replace `<project-path>` with the actual absolute path to the project directory.
- Port 3000 is Next.js's default. If it's in use, try 3001.
- This scaffold uses the **App Router** (`app/` directory), which is the modern default since Next.js 13+. Do NOT use the old `pages/` directory unless the user explicitly asks.
- Do NOT explain every file in detail — just confirm each one was written, then move on.
- TypeScript is intentionally omitted to keep things simple for beginners. If the user asks for TypeScript, rename files to `.tsx`/`.ts` and add a `tsconfig.json`.
