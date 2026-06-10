# LexAI — Legal Contract Review App

An AI-powered legal contract review tool for SMBs. Upload a PDF or DOCX contract, ask questions in plain English, and get instant analysis of risks, clauses, and obligations.

---

## Clone the Repo

```bash
git clone https://github.com/sachin0034-tech/week-5-claudeapp.git
cd week-5-claudeapp
```

---

## Folder Structure

> **Status: pre-implementation.** No app code exists yet — only planning and config files.

```
week-5-claudeapp/
│
├── PRD.md                          # Full product requirements document for LexAI
├── README.md                       # This file
│
├── prompts/
│   └── azure_intergration.md       # Notes on calling the Azure AI endpoint
│
└── .claude/                        # Claude Code config — not app source code
    ├── CLAUDE.md                   # Claude instructions for building this project
    ├── settings.local.json         # Local Claude Code permission settings
    │
    ├── knowledge/                  # Reference docs Claude reads before coding
    │   ├── design-system.md        # Colors, fonts, spacing, component styles
    │   └── azure-endpoint.md       # Azure AI client setup details
    │
    ├── specs/                      # Feature specs (what to build per area)
    │   ├── auth.md
    │   ├── chat.md
    │   ├── dashboard.md
    │   ├── database.md
    │   ├── file-upload.md
    │   └── feedback.md
    │
    └── skills/                     # Custom Claude Code skill scripts
        ├── rules/rules.md          # Tech stack rules and hard constraints
        ├── implementation/         # Step-by-step build instructions
        ├── create-spec/            # Skill + templates for generating specs
        ├── frontend-setup/         # Skill for scaffolding the frontend
        └── blueprint/              # High-level project blueprint
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (custom auth — no Supabase Auth) |
| AI | Azure OpenAI |
| PDF parsing | pdfjs-dist |
| DOCX parsing | mammoth |

---

## Key Decisions

- **Custom auth** — login and signup use a `users` table with bcrypt-hashed passwords. Supabase Auth is not used.
- **Azure calls are server-only** — the `/api/chat` route proxies all AI requests. The Azure endpoint is never exposed to the browser.
- **File parsing is client-side** — PDFs and DOCX files are parsed to plain text in the browser before being sent to the API.
