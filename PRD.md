# PRD: Contract Chat Assistant
**LegalGraph | Version 1.1 | Date: 2026-06-10**

---

## 1. Problem Statement

Legal and business teams need a fast way to ask questions about contracts without reading the entire document. Today users manually scan PDFs looking for specific clauses, dates, and obligations — a slow, error-prone process. LegalGraph solves this by letting users upload a contract, then chat with an AI assistant that has read the full document and can answer questions instantly. All conversations are saved so users can return to prior sessions at any time.

---

## 2. User Persona

**Primary User: Rachel — Compliance Lead**
- Regularly reviews lease and vendor contracts
- Needs to extract specific terms quickly for audits and reporting
- Currently reads PDFs manually; no AI tooling in place
- Pain: time spent searching for specific clauses, no way to ask follow-up questions

---

## 3. Core User Flow

1. User signs up or logs in (email + password, stored in Supabase)
2. User uploads a contract PDF
3. App extracts text from the PDF on the server
4. User types a question about the contract
5. App sends the extracted PDF text + user question to the Azure AI Foundry agent
6. Agent responds with an answer grounded in the contract
7. Conversation is saved to Supabase (session + messages)
8. User can return later and see all previous chat sessions

---

## 4. Requirements

### P0 — Must Ship

- [ ] **Signup page** — email + password, stored in Supabase users table (custom auth, no Supabase built-in auth)
- [ ] **Login page** — email + password, verify against Supabase users table with bcrypt
- [ ] **Contract upload** — accept PDF files only; extract text server-side using pdfjs-dist
- [ ] **Chat interface** — text input, send button, message history display
- [ ] **Azure AI integration** — send extracted PDF text + user message to Azure Foundry agent; display response
- [ ] **Session persistence** — save each conversation (session + messages) to Supabase
- [ ] **Session history** — sidebar listing all previous sessions; clicking one loads that conversation
- [ ] **Dashboard layout** — sidebar (session list) + center (chat area) + right panel (contract info / status)

### P1 — Next Version

- [ ] DOCX file support
- [ ] Multiple contracts per session
- [ ] Rename or delete sessions
- [ ] Feedback (thumbs up/down) on AI responses

---

## 5. Out of Scope (V1)

1. IFRS 16 / ASC 842 compliance report generation
2. Lease term extraction and structured field display
3. PDF export of reports
4. DOCX file parsing
5. Auditor portal or external sharing
6. Equipment or non-real-estate lease handling

---

## 6. Database Tables

| Table | Purpose |
|---|---|
| `users` | Custom auth — email + hashed password |
| `sessions` | One row per chat session, linked to user + contract filename |
| `messages` | One row per message, linked to session, stores role + content |

---

## 7. Tech Constraints

- Custom auth only — do NOT use Supabase built-in auth
- Store userId in localStorage after login
- Parse PDF server-side only (never in the browser)
- Never call Azure from the client — always go through a Next.js API route
- Azure auth: OAuth 2.0 via MSAL (Connect with Microsoft button) or az login for local dev
- Always send contractText + userMessage together to Azure
- Use `2025-05-01` API version for Azure AI Agents endpoints
- Store Azure access token in HTTP-only cookie (never localStorage)
