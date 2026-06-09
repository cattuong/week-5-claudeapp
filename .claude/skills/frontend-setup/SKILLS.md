---
name: frontend-setup
description: >
  Scaffolds a complete React + Vite project by writing all necessary files,
  creates a styled landing page, and runs the app end to end.
  Use this skill whenever the user asks to:
  - Set up a React project or folder structure
  - Create a React app for a lesson or class session
  - Bootstrap a React environment with all dependencies
  - Get a React landing page up and running
  Trigger this skill immediately when the user mentions React setup or starting
  a lesson project — even if they say it casually like "let's set up React".
---

# React Setup Skill

Your job is to scaffold a complete React + Vite project end to end by writing
all files manually, then guiding the user to start the dev server.

Do every step in order. Do not skip any step.

---

## Step 1 — Ask the user about the project folder

Before creating anything, use the `AskUserQuestion` tool to ask the user:

**Question:** "Where would you like to set up the React project?"
**Header:** "Project folder"
**Options:**
- **Create a new folder** — Scaffold a fresh `react-app` folder (recommended for a clean start)
- **Use an existing folder** — Work inside a folder the user already has; ask them to type the folder path

If they choose **Create a new folder**: proceed with `react-app` as the project directory inside the outputs folder.

If they choose **Use an existing folder**: ask them to provide the path, then use that path as the project root. Still write all the same files into it (overwriting any that already exist).

---

## Step 2 — Set up the project folder

Based on the user's answer from Step 1:
- **New folder**: Create `react-app/` and `react-app/src/` inside the outputs directory.
- **Existing folder**: Use the path they provided; create a `src/` subfolder inside it if it doesn't exist.

---

## Step 3 — Write `package.json`

```json
{
  "name": "react-app",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

---

## Step 4 — Write `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

## Step 5 — Write `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## Step 6 — Write `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## Step 7 — Write `src/index.css`

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

## Step 8 — Write `src/App.jsx` (the landing page)

```jsx
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#ffffff',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
        background: 'linear-gradient(90deg, #e94560, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Welcome 🚀
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: '#a8b2d8',
        maxWidth: '520px',
        lineHeight: 1.8,
        marginBottom: '2rem',
      }}>
        Your React app is up and running. Let's build something amazing.
      </p>
      <button style={{
        padding: '0.75rem 2rem',
        borderRadius: '999px',
        border: 'none',
        background: '#e94560',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(233,69,96,0.45)',
        transition: 'transform 0.2s',
      }}
        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.target.style.transform = 'scale(1)'}
      >
        Let's get started
      </button>
    </div>
  )
}

export default App
```

---

## Step 9 — Show the final folder structure

Tell the user what was created:

```
react-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx       ← your landing page
    └── index.css
```

---

## Step 10 — Run the app (end to end)

Run it in the background:

```bash
cd <project-path> && nohup npm install && npm run dev -- --port 5173 > /tmp/react-app.log 2>&1 &
sleep 5 && cat /tmp/react-app.log
```

**If the server starts successfully**, tell the user:
> ✅ Your React app is live at **http://localhost:5173** — open it in your browser!

**If npm is blocked or the server fails**, give the user these commands to run in their own terminal:

```bash
cd react-app
npm install && npm run dev
```

Then tell them:
> Once it starts, open **http://localhost:5173** in your browser to see the landing page.

Either way, the user ends up with a running React app. Keep the tone encouraging — this is a lesson context.

---

## Notes

- If the project folder already exists, delete it and start fresh.
- Replace `<project-path>` with the actual absolute path to the project directory.
- Port 5173 is Vite's default. If it's in use, try 5174.
- Do NOT explain every file in detail — just confirm each one was written, then move on.