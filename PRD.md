# AI Document Assistant App
## Product Requirements Document

**Date:** June 10, 2026
**Author:** Product Team
**Status:** Draft
**Version:** 1.1

---

## 1. Problem Definition

### What problem is this solving?

Analysing and extracting insight from documents is time-consuming, error-prone, and expensive for individuals and teams who lack specialised expertise. A single missed detail — in a policy, report, contract, manual, or research paper — can lead to bad decisions, wasted effort, or missed risk. Today, most users either pay experts for every review or rely on untrained staff to skim documents manually — both of which are inefficient and inadequate.

### Who are you solving this problem for?

**Primary persona:** A knowledge worker or team lead (at a business of any size) who regularly needs to understand, extract, or act on information inside documents — but lacks the time, expertise, or budget to do so thoroughly.

Key characteristics:
- Industry: Any — professional services, SaaS, consulting, research, healthcare, logistics
- Role: Operations, procurement, research, compliance, product, legal, finance
- Behaviour: Reviews 5–20 documents per month; current process involves skimming manually or forwarding to a specialist
- Pain: Spends 1–3 hours per document; misses non-obvious details; pays specialist rates for routine analysis

**Secondary persona:** A specialist (analyst, paralegal, researcher, compliance officer) at a larger organisation who manages high document volume and needs AI assistance to triage and prioritise.

### Why is this problem worth solving?

- **Quantified pain:** Knowledge workers spend an average of 2.5 hours per day searching for and reading documents (IDC, 2023). AI-assisted analysis can reduce document review time by 60–80%.
- **Market gap:** Generic LLM tools like ChatGPT require manual copy-paste, lack document context management, have no session history, and provide no structured output. Existing vertical tools are priced for enterprise, leaving SMB and mid-market users underserved.
- **Moat:** Defensibility rests on three pillars:
  1. **Workflow integration:** A purpose-built chat interface with persistent session history creates switching friction that generic AI tools lack.
  2. **Feedback-trained improvement loop:** Every interaction is rated; ratings are used to improve prompts and (in v2) fine-tune the model on domain-specific patterns.
  3. **Azure AI agent pipeline:** Enterprise-grade compliance and data residency options that users cannot configure with consumer LLM tools — a differentiator when selling to mid-market buyers with procurement requirements.

### Why Agentic AI?

- **Unstructured data involved:** Document content is free-form natural language with enormous variation in structure, terminology, and phrasing across domains and document types.
- **Why rules fail:** Regex and keyword matching cannot generalise across semantic variants. Rule-based systems miss meaning; LLMs understand it.
- **Why LLMs are necessary:** Documents require contextual reasoning — understanding that a statement later in the document modifies an earlier one, or that a term defined in an appendix changes the meaning of the main body.
- **Differentiation from ChatGPT:** This app maintains session and document context across a full conversation, structures agent execution steps visibly in a right-panel trace, persists chat history per user in Supabase, and is purpose-built with a configurable system prompt. It saves every Q&A turn and rating — enabling a proprietary feedback dataset that generic tools cannot replicate.

### How will you know the problem is solved? (Core Metrics)

**North Star Metric:** Average time to complete a document analysis session
Baseline: 90 minutes (manual review, estimated) | Target: <20 minutes | Tracked via: session start/end timestamps in Supabase

**Primary Metrics:**

| Metric | Baseline | Target | How tracked |
|---|---|---|---|
| Response accuracy (user-rated) | — | ≥4.0 / 5.0 average feedback rating | Supabase feedback table |
| Analysis latency (P95) | — | <45s per question on a 20-page document | Server-side timing logs |

**Secondary Metrics:**

| Metric | Baseline | Target | How tracked |
|---|---|---|---|
| 30-day user retention | — | >45% | Auth + session logs |
| Chat sessions per user per month | — | ≥3 | Supabase sessions table |
| Feedback submission rate | — | >70% of assistant responses | Supabase feedback table |
| NPS | — | >40 | In-app quarterly survey |
| Cost per analysis | — | <$2.50 | Azure AI billing dashboard |

---

## 2. Solution Definition

### Pages & User Flows

The app has four distinct page types:

1. **Landing page** — public marketing page, unauthenticated
2. **Auth pages** — `/signup` and `/login`
3. **Dashboard** — post-login home, shows KPIs + activity feed
4. **Chat** — document upload + AI conversation interface

**Primary flow:**

Landing page → Sign up / Log in → Dashboard → New Chat → Upload Document → Ask Question → Receive AI Response → Submit Feedback → Return to Dashboard

### Technology User Flow

How the tech stack serves each step of the user journey:

| User step | What happens | Technology |
|---|---|---|
| Opens the app | Page is served with routing and API support | Next.js 14 (App Router) + TypeScript |
| Signs up / logs in | Password hashed and stored; user ID saved to localStorage | bcryptjs + Supabase (PostgreSQL) |
| Views dashboard | KPIs and activity feed queried from database | Supabase JS SDK |
| Uploads a PDF | File parsed client-side into plain text | pdfjs-dist |
| Uploads a DOCX | File parsed client-side into plain text | mammoth |
| Asks a question | Text sent to server route; Azure called server-side only | Next.js API Route → Azure OpenAI GPT-4o |
| Receives AI response | Response returned and rendered in chat | Azure OpenAI GPT-4o → Next.js API Route |
| Submits feedback | Rating and comment saved to database | Supabase (PostgreSQL) |
| App is deployed | Hosted with zero-config deployment | Vercel |

---



---

### 3.3 Dashboard (`/dashboard`)

The dashboard is the post-login home screen. It gives users a quick overview of their activity and provides entry points to start or resume work.

#### KPI Cards

Display the following metrics in a card grid (3–4 columns, responsive):

| KPI | Description | Update cadence |
|---|---|---|
| Total documents processed | All-time count of files uploaded | On session load |
| Documents processed today | Files uploaded in the last 24h | On session load |
| Total AI queries | All-time message count (user role) | On session load |
| AI queries this week | Messages in last 7 days | On session load |
| Active chat sessions | Sessions with messages in last 7 days | On session load |
| Pinned chats | Count of pinned sessions | Real-time |
| Documents uploaded | Total file uploads | On session load |
| Average processing time | Avg ms from message send to response received | On session load |
| Total reports generated | Count of exported sessions (v1.1) | On session load |
| Total clauses extracted | Count of AI-identified key passages (v1.1) | On session load |
| AI accuracy / confidence | Average feedback rating across all sessions | On session load |
| Failed processing jobs | Count of sessions with error status | On session load |
| Storage used | Total size of uploaded files (if persisted, v1.1) | On session load |



#### Dashboard Actions

- **New Chat** button (primary, top-right) → navigates to `/chat` and creates a new session
- **Recent Chats** section below activity feed — last 5 sessions as quick-access cards (title, date, status icon) with "Open" button

---


```


---

## 4. Functional Requirements

### Complete Feature List

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-001 | Landing page with hero, features, pricing, and auth CTAs | P0 | Redirect to /dashboard if already logged in |
| FR-002 | User signup with email/password; stored in custom `users` table with bcrypt hash | P0 | No Supabase Auth |
| FR-003 | User login; userId + userEmail stored in localStorage | P0 | Generic error message — no field enumeration |
| FR-004 | Auth guard: dashboard/chat redirect to /login if no userId in localStorage | P0 | — |
| FR-005 | Dashboard KPI card grid (13 metrics) | P0 | See KPI table in §3.3 |
| FR-006 | Dashboard recent activity feed (chronological, 50 events, load more) | P0 | User-specific events only |
| FR-007 | "New Chat" button from dashboard creates session and navigates to chat | P0 | — |
| FR-008 | Three-panel chat layout (sidebar 256px / centre flex-1 / right panel 304px) | P0 | — |
| FR-009 | File upload accepts PDF and DOCX only; max 10MB; client-side validation | P0 | Error shown for unsupported types or oversized files |
| FR-010 | Client-side PDF parsing via pdfjs-dist | P0 | Scanned PDFs detected and blocked with user-facing error |
| FR-011 | Client-side DOCX parsing via mammoth | P0 | — |
| FR-012 | Document text sent to `/api/chat` server-side route with every message | P0 | Azure never called from client |
| FR-013 | AI response displayed in chat after full response received | P0 | Streaming in v1.1 |
| FR-014 | Streaming AI responses (SSE token-by-token) | P1 | v1.1 |
| FR-015 | Right panel execution steps — live status during AI request | P0 | 5 step states: parsing / sending / waiting / completed / error |
| FR-016 | PDF preview in right panel with controls (zoom, fit, page count, download) | P0 | iframe with blob URL |
| FR-017 | DOCX preview in right panel (plain text, truncated at 4,000 chars) | P0 | — |
| FR-018 | Document preview persists while chatting | P0 | Not cleared on message send |
| FR-019 | Feedback widget (1–5 stars + optional comment) after every assistant message | P0 | — |
| FR-020 | Feedback saved to Supabase `feedback` table | P0 | — |
| FR-021 | AI-generated session titles (first 55 chars of first user message + `…`) | P0 | Only when title is still "New session" |
| FR-022 | Session list in sidebar with title, created timestamp, last-updated, status icon | P0 | — |
| FR-023 | Pinned chats — pin/unpin from context menu; pinned section at top of sidebar | P0 | Pinned state stored in Supabase sessions table |
| FR-024 | Rename chat — inline edit from context menu, confirmed with Enter | P0 | PATCH /api/sessions/[id] |
| FR-025 | Delete chat — confirmation dialog before deletion | P0 | DELETE /api/sessions/[id]; cascade deletes messages + feedback |
| FR-026 | Search sessions — real-time client-side filter by title | P0 | — |
| FR-027 | Filter sessions by status — All / Pinned / Recent / Processing / Completed / Error | P0 | — |
| FR-028 | Complete conversation history per session — reload all messages from Supabase on session select | P0 | Immediately clear stale messages before loading new |
| FR-029 | Reopen past chats and continue conversation | P0 | Document text NOT reloaded (user must re-attach if needed) |
| FR-030 | Auto-save: every user message written to Supabase before API call | P0 | — |
| FR-031 | Infinite scroll — load 25 messages at a time when scrolling up | P1 | Cursor-based pagination |
| FR-032 | Message timestamps — `HH:MM` per bubble; full date for messages older than today | P0 | — |
| FR-033 | Logout — clears localStorage, redirects to /login | P0 | — |
| FR-034 | Password reset via email | P1 | Supabase email template |
| FR-035 | Export chat session to PDF | P2 | v1.1 |
| FR-036 | Mobile-responsive layout | P2 | v1.1 — MVP targets desktop |

### Non-Functional Requirements

- **Performance:** P95 end-to-end response latency < 45s for documents up to 20 pages; response starts within 3s of submission; dashboard KPIs load within 1s
- **Scalability:** 100 concurrent users at MVP; scale to 1,000 via Azure autoscaling in v1.1
- **Security:** TLS 1.3 in transit; AES-256 at rest; document files never persisted server-side; bcrypt passwords; no credentials in client-side code
- **Reliability:** 99.5% uptime SLA; AI agent errors shown as user-facing messages, never silent
- **Usability:** Core flow (upload → question → response) completable without any onboarding by a non-technical user
- **Compliance:** GDPR-aware — document content not stored after session; user data deletion supported (P1)

---

## 5. Technical Requirements


### Prompt Strategy

| Task | Technique | Output |
|---|---|---|
| Document Q&A | Context injection: document text + conversation history + zero-shot question | Plain text with inline source references |
| Uncertainty handling | System prompt: "If answer not in document, say so explicitly; do not speculate" | Flagged disclaimer message |

**System prompt:**
> You are an AI assistant. Answer questions based solely on the document text provided. Always cite the specific section or part you are referencing. If the answer cannot be found in the provided text, say: "I cannot find this in the document." Do not speculate beyond what the document contains.

### Model Requirements

| Criteria | Requirement |
|---|---|
| Model | Azure OpenAI GPT-4o (or equivalent Azure AI Foundry agent) |
| Context window | ≥100k tokens |
| Latency target | <30s per LLM call |
| Cost target | <$1.50 per document Q&A |

### Technology Choices

| Item | What we use | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | API routes + React in one repo |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Fast + consistent with design system |
| LLM | Azure OpenAI GPT-4o | Enterprise compliance, data residency, large context |
| PDF parsing | pdfjs-dist | Client-side, no upload to third party |
| DOCX parsing | mammoth | Client-side |
| Database | Supabase (PostgreSQL) | Easy setup, real-time, JS SDK |
| Auth | Custom `users` table + bcryptjs | Full control; no Supabase Auth |
| Hosting | Vercel | Low ops overhead |

---

## 6. Roadmap

| Release | Features | Duration | Priority |
|---|---|---|---|
| **v0.1 — Internal Alpha** | Landing page, auth (signup/login), dashboard (KPI cards + activity feed), chat 3-panel layout, file upload + client-side extraction, single-turn Azure AI Q&A, messages saved to Supabase | 3 weeks | P0 |
| **v0.2 — Closed Beta** | Multi-turn conversation history, sidebar session list with search/filter/pin/rename/delete, right panel execution steps + PDF preview with controls, feedback widget, auto-save | 3 weeks | P0 |
| **v1.0 — Public Launch** | Session title auto-generation, source citations, uncertainty disclaimer, infinite scroll, message timestamps, session status icons, password reset, performance optimisation, security audit | 4 weeks | P0 |
| **v1.1 — Growth** | Streaming AI responses (SSE), Google OAuth, mobile-responsive layout, export session to PDF, session search improvements, activity feed real-time updates | 6 weeks | P1 |
| **v2.0 — Scale** | Multi-document comparison, domain fine-tuning on feedback corpus, team workspaces, API access, advanced analytics dashboard | Q3 2026 | P2 |

---

## 7. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI agent hallucinates content not in document | Medium | High | System prompt grounding; uncertainty disclaimer; user feedback loop |
| Scanned PDF fails text extraction | High | Medium | Detect and warn user; recommend text-based PDF |
| Document too long for context window | Medium | Medium | Truncate at 80k tokens; warn user |
| Supabase RLS misconfiguration exposes other users' sessions | Low | Critical | Enforce Row-Level Security; pentest before launch |
| Azure AI latency spikes above 45s | Low | Medium | Timeout + retry logic; progress animation; fallback error |
| Sensitive content uploaded; data residency concern | Medium | High | Documents not persisted post-session; Azure data residency configured |
| Dashboard KPI queries slow with large data | Low | Medium | Add indexes on `user_id` + `created_at`; aggregate on read |

---

## 8. Evaluations

### Evaluation Plan

| Eval type | Method | Target | Cadence |
|---|---|---|---|
| Q&A accuracy (user-rated) | Average feedback rating | ≥4.0 / 5.0 | Weekly post-beta |
| Source citation accuracy | Manual review: does cited section contain the answer? | >85% correct | Per release |
| Hallucination rate | % responses where AI invents content not in document | <5% | Per release |
| Latency (P95) | End-to-end from question submit to response complete | <45s | Per release, automated |
| Uncertainty recall | % unanswerable questions that trigger the disclaimer | >90% | Per release |
| Feedback submission rate | % assistant messages with a submitted rating | >70% | Weekly post-launch |
| Dashboard load time | Time to first contentful paint on /dashboard | <1s | Per release |

### Launch Criteria

| Stage | Go criteria |
|---|---|
| Alpha (5 internal users) | <1% crash rate; all P0 flows end-to-end functional; dashboard loads |
| Beta (50 users) | Avg rating ≥3.8; hallucination rate <10%; latency <45s P95; feedback rate >50% |
| Public launch | Avg rating ≥4.0; hallucination rate <5%; security audit passed; 30-day retention >40% |

---

## 9. Responsible AI

| Pillar | Strength | Risk | Mitigation |
|---|---|---|---|
| Helpful | Reduces document review time by 60–80%; surfaces details non-experts miss | Response too long or too technical | System prompt specifies plain English; max 200 words per explanation |
| Honest | All answers grounded in uploaded document; source references cited | LLM may hallucinate or misread ambiguous content | "Cannot find in document" disclaimer; user feedback flags errors |
| Harmless | Domain is factual text; no personal data in analysis | User acts on incorrect output without expert review | Prominent disclaimer: "Not professional advice — consult a qualified expert" |

**Disclaimer shown on every session:**
> "This app provides AI-generated analysis only. Always consult a qualified professional before acting on the findings."

---

## 10. Pricing

### Development Costs (MVP)

| Item | Estimated cost |
|---|---|
| Azure OpenAI API credits (dev + test) | $500 |
| Supabase Pro (3 months) | $75 |
| Vercel Pro (3 months) | $60 |
| Security pentest | $2,000 |
| Miscellaneous | $200 |
| **Infrastructure subtotal** | **~$2,835** |
| Lead Full-Stack Engineer (3 months) | $25,000 |
| Backend / AI Integration Engineer (3 months) | $20,000 |
| Product Manager (3 months) | $15,000 |
| UX Designer (part-time, 3 months) | $8,000 |
| QA Engineer (part-time, 3 months) | $6,000 |
| **Manpower subtotal** | **$74,000** |
| **Total MVP** | **~$76,835** |

### Operational Costs (500 active users/month)

| Item | Monthly |
|---|---|
| Azure OpenAI API (5,000 analyses × ~$0.50) | $2,500 |
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Monitoring (Sentry + Azure Monitor) | $50 |
| **Total** | **~$2,595** |

Cost per analysis: ~$0.52 (infra) + ~$1.50 (Azure AI) = **~$2.02** — within the <$2.50 target.

### Pricing Tiers

| Plan | Price | Includes | Target user |
|---|---|---|---|
| Free trial | $0 / 14 days | 5 document analyses | All new signups |
| Starter | $29 / month | 20 analyses, 1 user | Solo user, freelancer |
| Growth | $79 / month | 100 analyses, 5 users | SMB team |
| Pro | $199 / month | Unlimited analyses, 20 users, priority support | Mid-market |

---

## 11. Open Questions

1. **Azure AI endpoint:** Which specific Azure AI Foundry endpoint and model deployment? Who owns the subscription and budget? (Owner: Engineering Lead — resolve before v0.1)
2. **Scanned document handling:** Support OCR via Azure Document Intelligence in v1.0, or strictly block scanned uploads? (Owner: PM + Engineering — resolve before v0.2)
3. **Data retention:** Delete document text immediately after session, or retain 24h to support session reload? (Owner: PM — resolve before public launch)
4. **Dashboard KPI queries:** Computed on-read from existing tables, or materialised into a separate `analytics` table? (Owner: Engineering — resolve in v0.1 sprint planning)
5. **Pinned chats storage:** Stored in `sessions.pinned` column (recommended) or a separate `pinned_sessions` table? (Owner: Engineering — resolve in v0.1)
6. **Feedback data use:** Are ratings + comments used for model fine-tuning in v2? What consent mechanism is required? (Owner: PM — resolve before v1.1)

---

## 12. Assumptions

- Azure AI agent supports ≥100k token context window, sufficient for ~80-page documents.
- Custom `users` table (not Supabase Auth); user ID managed via localStorage.
- Documents are text-based, not scanned images; scanned support is out of scope for MVP.
- Right-panel execution steps are simulated client-side based on known pipeline stages; full agent-side event streaming is a v1.1 enhancement.
- Dashboard KPI data is derived from existing Supabase tables on read (no separate analytics table in MVP).
- Team size for MVP: 3–4 engineers. Timeline: 10 weeks from kickoff (v0.1: 3w, v0.2: 3w, v1.0 hardening: 4w).
- Feedback ratings used for monitoring and prompt improvement only — no model fine-tuning in MVP without explicit consent mechanisms.
- No multi-tenancy or team workspaces in MVP; individual accounts only.
- GDPR compliance addressed by not persisting document content beyond the session; full legal review before public launch.
