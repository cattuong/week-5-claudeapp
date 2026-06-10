# LexAI — Legal Contract Review App
## Product Requirements Document

**Date:** June 10, 2026
**Author:** Product Team
**Status:** Draft
**Version:** 1.0

---

## 1. Problem Definition

### What problem is this solving?

Reviewing legal contracts is time-consuming, error-prone, and expensive for small and mid-size businesses that lack in-house legal teams. A single missed clause — around indemnification, auto-renewal, or liability limits — can expose a business to significant financial or legal risk. Today, most SMBs either pay expensive lawyers for every review or rely on untrained staff to skim contracts, both of which are inefficient and inadequate.

### Who are you solving this problem for?

**Primary persona:** Operations Manager or Business Owner at an SMB (10–200 employees) who signs vendor, employment, or partnership contracts regularly but has no in-house legal counsel.

Key characteristics:
- Industry: Professional services, SaaS, consulting, retail, logistics
- Role: Ops lead, founder, procurement manager
- Behaviour: Reviews 5–20 contracts per month; current process involves emailing a lawyer or skimming the document manually
- Pain: Spends 1–3 hours per contract review; misses non-obvious risks; pays $300–$700/hr for outside counsel on routine reviews

**Secondary persona:** In-house paralegal or legal ops specialist at a mid-market company who manages high contract volume and needs AI assistance to triage and prioritise.

### Why is this problem worth solving?

- **Quantified pain:** According to the World Commerce & Contracting Association (2019), poor contract management costs businesses an average of 9% of annual revenue. For a $2M SMB, that's $180,000/year in leakage.
- **Market gap:** Generic LLM tools like ChatGPT require manual copy-paste, lack document context management, have no session history, and provide no structured clause analysis. Existing vertical tools (Kira, Luminance) are priced for large enterprise (>$50k/year), leaving the SMB and mid-market segment underserved.
- **MOAT:** LexAI's defensibility rests on three pillars:
  1. **Workflow integration:** A purpose-built chat interface with persistent session history creates switching friction that generic AI tools lack.
  2. **Feedback-trained improvement loop:** Every interaction is rated; ratings are used to improve prompts and (in v2) fine-tune the model on SMB-specific contract patterns.
  3. **Azure AI agent pipeline:** Enterprise-grade compliance and data residency options (Azure regions) that SMBs cannot configure with consumer LLM tools — a differentiator when selling to mid-market buyers with procurement requirements.

### Why Agentic AI?

- **Unstructured data involved:** Contract text is free-form natural language with enormous variation in structure, clause naming, and legal phrasing across jurisdictions and industries. No two NDAs are formatted the same way.
- **Why rules fail:** Regex and keyword matching cannot generalise across clause variants. "The party shall indemnify" and "Vendor agrees to hold harmless and defend" are semantically equivalent but lexically unrelated. Rule-based systems miss one; LLMs catch both.
- **Why LLMs are necessary:** Contracts require contextual reasoning — understanding that a clause 8 pages in overrides a clause on page 2, or that an ambiguous term defined in an appendix changes the meaning of the main body. LLMs maintain this cross-document reasoning that rules cannot.
- **Differentiation from ChatGPT:** LexAI maintains session and document context across a full conversation, structures agent execution steps visibly (right-panel trace), persists chat history per user in Supabase, and is purpose-built with a legal-domain system prompt and clause-specific output schemas. It also saves every Q&A turn and rating — enabling a proprietary feedback dataset that generic tools cannot replicate.

### How will you know the problem is solved? (Core Metrics)

**North Star Metric:** Average time to complete a contract review session  
Baseline: 90 minutes (manual review, estimated)  Target: <20 minutes  Tracked via: session start/end timestamps in Supabase

**Primary Metrics:**

| Metric | Baseline | Target | How tracked |
|---|---|---|---|
| Response accuracy (user-rated) | — | ≥4.0 / 5.0 average feedback rating | Supabase feedback table |
| Contract analysis latency (P95) | — | <45s per question on a 20-page contract | Server-side timing logs |

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

### User Flows

**Primary flow:**

Sign up / Log in → Dashboard → Upload Contract → Ask Question → Receive AI Response → Submit Feedback → Continue or Start New Chat

**Detailed flow:**

1. **Authentication:** User signs up or logs in via a custom Supabase `users` table with email/password. JWT token stored in session.
2. **Dashboard landing:** Three-panel layout loads — left sidebar (chat history + New Chat button), centre panel (chat interface + file attachment), right panel (execution steps trace).
3. **Contract upload:** User clicks the file attachment button and uploads a PDF or DOCX contract (max 20MB, max ~100 pages). The frontend extracts raw text client-side (PDF.js / Mammoth.js) or sends the file to the backend for server-side extraction.
4. **Question input:** User types a question (e.g. "What are the termination conditions?") and submits.
5. **AI pipeline:** The backend sends extracted contract text + conversation history + user question to the Azure AI agent. The right panel shows real-time execution steps (e.g. "Parsing document…", "Identifying relevant clauses…", "Generating response…").
6. **Response display:** The AI response is streamed into the centre chat panel with source clause references where applicable.
7. **Feedback capture:** After each assistant message, a feedback widget appears inline — star rating (1–5) and optional comment field. Submission saves to Supabase `feedback` table.
8. **Session persistence:** All messages (user + assistant), session metadata, and feedback are saved to Supabase in real time.
9. **Chat history:** Left sidebar lists all previous sessions. Clicking one reloads the full conversation.
10. **Hallucination safeguard:** System prompt instructs the Azure AI agent to cite clause locations and add a disclaimer if a question cannot be answered from the contract text alone. Low-confidence responses are flagged with a UI indicator.

### Functional Requirements

**User Stories:**

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-001 | As a business owner, I want to sign up with my email and password so that I have a personal account with saved history | Account created in Supabase `users` table; JWT issued; user redirected to dashboard | P0 |
| US-002 | As a returning user, I want to log in and see my previous chat sessions so that I can continue past reviews | Login authenticates via Supabase; left sidebar shows sessions ordered by most recent | P0 |
| US-003 | As a user, I want to upload a PDF or DOCX contract so that the AI can analyse it | File accepted up to 20MB; text extracted and stored in session context; error shown for unsupported types | P0 |
| US-004 | As a user, I want to type a question about the contract and receive an AI answer so that I can understand specific clauses | Question + contract text sent to Azure AI agent; response displayed in chat within 45s (P95) | P0 |
| US-005 | As a user, I want to see execution steps on the right panel so that I understand what the AI is doing | Right panel updates in real time with labelled steps during AI processing | P0 |
| US-006 | As a user, I want to rate and comment on each AI response so that I can flag inaccurate answers | Feedback widget appears after every assistant message; rating 1–5 + optional comment; saved to Supabase | P0 |
| US-007 | As a user, I want to start a new chat session so that I can review a different contract | "New Chat" button in sidebar clears centre panel and creates a new session record in Supabase | P0 |
| US-008 | As a user, I want to click on a past session in the sidebar and see the full conversation so that I can refer back to previous analysis | Clicking a session loads all messages from Supabase for that session | P1 |
| US-009 | As a user, I want AI responses to cite the clause or section of the contract they reference so that I can verify the answer | Responses include clause reference (e.g. "Section 4.2") where applicable | P1 |
| US-010 | As a user, I want to be warned if the AI is uncertain or cannot find an answer in the contract so that I don't act on hallucinated output | AI returns a flagged disclaimer message; right panel shows "Low confidence" step | P1 |

**Functional Requirements Table:**

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-001 | User signup and login with email/password stored in Supabase `users` table | P0 | No OAuth in MVP; add Google OAuth in v1.1 |
| FR-002 | JWT-based session management; token refreshed automatically | P0 | Supabase Auth handles token lifecycle |
| FR-003 | File upload accepts PDF and DOCX; max 20MB; rejects other formats with a user-facing error | P0 | Client-side validation + server-side check |
| FR-004 | Text extraction from PDF (PDF.js or server-side PyMuPDF) and DOCX (Mammoth.js or python-docx) | P0 | Scanned PDFs out of scope for MVP; flagged to user |
| FR-005 | Three-panel dashboard layout: left sidebar, centre chat, right execution trace | P0 | Responsive: collapses to single panel on mobile (P2) |
| FR-006 | "New Chat" button creates a new session record in Supabase `sessions` table | P0 | Session tied to `user_id` and `created_at` |
| FR-007 | Chat messages (user + assistant) saved to Supabase `messages` table in real time | P0 | Includes `session_id`, `role`, `content`, `timestamp` |
| FR-008 | Contract text + conversation history + user question sent to Azure AI agent API | P0 | Context window managed: truncate oldest messages if >100k tokens |
| FR-009 | Right panel shows labelled execution steps streamed in real time during AI processing | P0 | Steps: Parsing → Retrieving context → Generating response → Complete |
| FR-010 | AI response displayed via streaming in centre chat panel | P0 | Token-by-token streaming via SSE or WebSocket |
| FR-011 | Feedback widget (1–5 stars + comment) displayed after each assistant message | P0 | Widget dismissed after submission; can skip |
| FR-012 | Feedback (rating, comment, message_id, user_id, timestamp) saved to Supabase `feedback` table | P0 | — |
| FR-013 | Left sidebar lists past sessions with title (first user message truncated to 40 chars) and date | P1 | Sessions sorted by most recent first |
| FR-014 | Clicking a sidebar session reloads full conversation from Supabase | P1 | Includes all messages + feedback states |
| FR-015 | AI response includes clause/section references where source is identifiable | P1 | Enforced via system prompt instruction |
| FR-016 | Disclaimer shown if AI cannot answer from contract text | P1 | Prompt-enforced + UI flag in right panel |
| FR-017 | Password reset via email | P1 | Supabase email template |
| FR-018 | Mobile-responsive layout | P2 | MVP targets desktop; mobile in v1.1 |
| FR-019 | Export chat session to PDF | P2 | Post-launch |
| FR-020 | Multi-contract upload (compare two contracts) | P2 | Post-launch |

**Non-Functional Requirements:**

- **Performance:** P95 end-to-end response latency < 45 seconds for contracts up to 20 pages; streaming starts within 3 seconds of submission
- **Scalability:** Support 100 concurrent users without degradation at MVP launch; scale to 1,000 via Azure autoscaling in v1.1
- **Security:** TLS 1.3 in transit; AES-256 at rest in Supabase; uploaded contract files stored temporarily and deleted after session ends (not persisted); JWT tokens expire after 1 hour
- **Reliability:** 99.5% uptime SLA; Azure AI agent errors returned as user-facing messages, not silent failures
- **Usability:** Core flow (upload → question → response) completable without any onboarding or training by a non-technical user
- **Compliance:** GDPR-aware — contracts are not stored after session; user data deletion supported via account settings (P1)

### Agent Capabilities & System Behaviour

| Component | Input | Output | Autonomy level | Human-in-loop trigger |
|---|---|---|---|---|
| Text extractor | PDF / DOCX file | Plain text | Fully autonomous | If extraction fails or file is scanned image, show error and prompt user to upload text-based PDF |
| Context builder | Extracted text + conversation history | Truncated prompt payload | Fully autonomous | If contract > 100k tokens, warn user that only the first ~80k tokens will be analysed |
| Azure AI agent | Contract text + question + system prompt | Structured response with clause refs | Autonomous + user review | If response contains uncertainty flag, show disclaimer in UI |
| Execution tracer | Agent API events | Step-by-step right panel updates | Fully autonomous | — |
| Feedback collector | User star rating + comment | Saved record | User-initiated | — |

---

## 3. Technical Requirements

### Architecture Overview

```
[Browser (React)]
     │
     ├── Auth (Supabase Auth / custom users table)
     ├── File Upload → Text Extraction (client-side PDF.js / Mammoth.js)
     ├── Chat UI (streaming via SSE)
     └── Supabase JS SDK (read/write sessions, messages, feedback)

[Backend API (Node.js / FastAPI)]
     │
     ├── POST /chat → Azure AI Agent call
     ├── POST /extract → Server-side extraction fallback
     └── Middleware: JWT verification, rate limiting

[Azure AI Agent]
     └── Receives: system prompt + contract text + chat history + user question
         Returns: streamed response with clause refs + execution steps

[Supabase (PostgreSQL)]
     ├── users         (id, email, hashed_password, created_at)
     ├── sessions      (id, user_id, title, created_at, updated_at)
     ├── messages      (id, session_id, role, content, created_at)
     └── feedback      (id, message_id, user_id, rating, comment, created_at)
```

### Database Schema

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | TEXT | Unique |
| hashed_password | TEXT | bcrypt |
| created_at | TIMESTAMPTZ | — |

**`sessions`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| title | TEXT | First 40 chars of first user message |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

**`messages`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| session_id | UUID | FK → sessions.id |
| role | TEXT | 'user' or 'assistant' |
| content | TEXT | Full message text |
| created_at | TIMESTAMPTZ | — |

**`feedback`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| message_id | UUID | FK → messages.id |
| user_id | UUID | FK → users.id |
| rating | INTEGER | 1–5 |
| comment | TEXT | Optional |
| created_at | TIMESTAMPTZ | — |

### Prompt Strategy

| Task | Technique | Output format | Rationale |
|---|---|---|---|
| Contract Q&A | RAG-style: contract text injected in context + zero-shot question | Plain text with inline clause references (e.g. "per Section 4.2") | Contract text is the ground truth; grounding prevents hallucination |
| Clause explanation | Few-shot (2–3 examples of clause → plain-English explanation) | Paragraph, max 200 words | Consistent reading level for non-lawyers |
| Risk flagging | Chain-of-Thought: "Think step-by-step about what risk this clause poses" | `{ "clause": string, "risk_level": "High|Medium|Low", "explanation": string }` | Structured output enables right-panel rendering |
| Uncertainty handling | System prompt instruction: "If the answer is not in the contract, say so explicitly and do not speculate" | Flagged disclaimer message | Reduces hallucination; builds user trust |

**System prompt (MVP):**
> You are LexAI, an AI legal assistant. You help users understand contracts by answering questions based solely on the contract text provided. Always cite the specific section or clause you are referencing. If the answer cannot be found in the provided text, say: "I cannot find this in the contract — please consult a qualified lawyer." Do not provide legal advice; provide legal information and analysis only.

**Prompt improvement plan:**
- Prompt versions tracked in a shared doc (v1.0, v1.1…)
- Feedback ratings <3 stars trigger a prompt review cycle
- Monthly A/B test of prompt variants on the internal eval set

### Model Requirements

| Criteria | Requirement | Rationale |
|---|---|---|
| Model | Azure OpenAI GPT-4o (or equivalent Azure AI Foundry agent) | Best reasoning + 128k context window for long contracts |
| Context window | ≥100k tokens | Long contracts (50+ pages) must fit in a single call |
| Latency | <30s per LLM call | Feeds into <45s P95 UX target |
| Cost per call | <$1.50 for a 20-page contract Q&A | Supports <$2.50 per analysis operational target |
| Fine-tuning | Not in MVP; evaluate domain fine-tuning for v2 based on feedback corpus | MVP prioritises time-to-market |

### Cost & Technology Choices

| Item | What we use | Why | Trade-off |
|---|---|---|---|
| Frontend | React + Tailwind CSS | Fast to build; component ecosystem for chat UI | SSR not supported without Next.js |
| Backend API | Node.js (Express) | Team familiarity; non-blocking I/O for streaming | Less suited for CPU-heavy ML tasks |
| LLM | Azure OpenAI GPT-4o | Enterprise compliance, data residency, high context window | Higher token cost vs OSS models |
| Text extraction | PDF.js (client) + Mammoth.js (DOCX) | No file upload to a third-party; privacy-preserving | Poor on scanned PDFs (flagged to user) |
| Database | Supabase (PostgreSQL) | Real-time subscriptions; built-in Auth | Vendor lock-in; limited at very high scale |
| Hosting | Vercel (frontend) + Azure App Service (backend) | Low ops overhead; aligns with Azure AI stack | Cold start latency on Vercel serverless |
| Auth | Supabase custom `users` table + JWT | Required by spec; full control over user schema | Must implement password reset manually |

---

## 4. Roadmap

| Release | Features | Duration | Priority |
|---|---|---|---|
| **v0.1 — Internal Alpha** | Auth (signup/login), dashboard 3-panel layout, file upload (PDF/DOCX), basic text extraction, single-turn Azure AI Q&A, message saved to Supabase | 3 weeks | P0 |
| **v0.2 — Closed Beta** | Multi-turn conversation history, left sidebar with session list, right panel execution steps, feedback widget (rating + comment), feedback saved to Supabase | 3 weeks | P0 |
| **v1.0 — Public Launch** | Session title auto-generation, clause citations in responses, uncertainty disclaimer, password reset, performance optimisation (streaming, latency <45s P95), security audit | 4 weeks | P0 |
| **v1.1 — Growth** | Google OAuth, mobile-responsive layout, export session to PDF, session search, improved extraction for complex PDFs | 6 weeks | P1 |
| **v2.0 — Scale** | Multi-contract comparison, domain-specific fine-tuning on feedback corpus, team workspaces, API access for enterprise, analytics dashboard | Q3 2026 | P2 |

---

## 5. Risks & Dependencies

### Component-Level Risk Table

| Component | ML necessary? | Data available? | Accuracy risk | Bias risk | Explainability |
|---|---|---|---|---|---|
| Text extraction (PDF) | No | N/A | Medium — scanned PDFs will fail | Low | Easy — deterministic |
| Azure AI Q&A agent | Yes | Contract text provided at runtime | Medium — hallucination on ambiguous questions | Low — legal domain is factual | Medium — clause refs help; no full CoT exposed |
| Feedback analysis | No (aggregation only) | Yes — collected from day 1 | Low | Low | Easy |

### Key Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Azure AI agent hallucinates a clause or invents legal content | Medium | High | System prompt grounding; uncertainty disclaimer; user feedback loop |
| Scanned PDF upload fails text extraction | High | Medium | Detect and warn user; recommend text-based PDF alternative |
| Contract too long for context window | Medium | Medium | Truncate at 80k tokens; warn user; chunk-and-retrieve in v1.1 |
| Supabase RLS misconfiguration exposes other users' sessions | Low | Critical | Enforce Row-Level Security policies; pentest before launch |
| Azure AI latency spikes above 45s | Low | Medium | Add timeout + retry logic; show progress animation; fallback error message |
| User uploads sensitive contract; data residency concern | Medium | High | Contracts not persisted post-session; Azure data residency settings documented |

### External Dependencies

- Azure AI Foundry / Azure OpenAI service availability and API pricing
- Supabase uptime and PostgreSQL service reliability
- PDF.js and Mammoth.js open-source library maintenance

---

## 6. Evaluations

### Evaluation Strategy

**Ground truth sources:**
- CUAD dataset (510 commercial contracts, 13,000+ expert annotations) — used for clause-level accuracy testing
- Internal test set: 20 real SMB contracts reviewed by a qualified lawyer and annotated for key clauses and risks
- User feedback corpus (opt-in): feedback ratings and comments collected from beta users

**Evaluation plan:**

| Eval type | Method | Target | Cadence |
|---|---|---|---|
| Q&A accuracy (user-rated) | Average feedback rating from Supabase `feedback` table | ≥4.0 / 5.0 | Weekly (post-beta) |
| Clause citation accuracy | Manual review: does cited clause actually contain the answer? | >85% correct citations | Per release (20-contract sample) |
| Hallucination rate | % of responses where AI invents content not in contract | <5% | Per release (expert audit) |
| Latency (P95) | End-to-end timing from question submit to response complete | <45s | Per release, automated |
| Uncertainty recall | % of unanswerable questions that trigger the disclaimer | >90% | Per release |
| Feedback submission rate | % of assistant messages with a submitted rating | >70% | Weekly (post-launch) |

**Evaluation spreadsheet columns:**
`Contract ID | Question | Expected answer | AI response | Clause cited | Correct? (Y/N) | Rating | Hallucination flag | Expert notes`

**Post-launch AI monitoring:**
- Automated weekly summary of average feedback ratings per session and per prompt version
- Alert if average rating drops below 3.5 for >50 responses in a 7-day window
- Monthly expert audit: 10 random sessions reviewed by a legal SME

### HHH Evaluation

| Pillar | Strength | Risk | Mitigation |
|---|---|---|---|
| Helpful | Saves users 60–80 minutes per contract review; surfaces risks non-lawyers miss | Response too long or too technical for non-lawyers | System prompt specifies plain English; max 200 words per explanation |
| Honest | System prompt grounds all answers in uploaded contract text; clause citations provided | LLM may hallucinate clause content or misread ambiguous language | "Cannot find in contract" disclaimer enforced by prompt; user feedback flags errors |
| Harmless | Domain is factual legal text; no personal data in contract analysis | User acts on an incorrect risk flag and signs a harmful contract | Prominent disclaimer: "Not legal advice"; recommend lawyer for High-risk findings |

### Launch Criteria

| Stage | Helpful | Honest | Harmless | Go criteria |
|---|---|---|---|---|
| Alpha (internal, 5 users) | Basic Q&A works | No silent failures | Disclaimer shown | <1% crash rate; core flow end-to-end functional |
| Beta (closed, 50 users) | Avg rating ≥3.8 | Hallucination rate <10% | Disclaimer shown on 100% of unanswerable Qs | Latency <45s P95; feedback submission rate >50% |
| Public launch | Avg rating ≥4.0 | Hallucination rate <5% | Legal disclaimer on every session | Security audit passed; 30-day retention >40% |

---

## 7. Responsible AI Risks & Mitigation

### Accountability

| Question | Answer |
|---|---|
| Efficacy & limitations | LexAI analyses text-based contracts in English; it will struggle with scanned documents, non-English contracts, and highly specialised legal language (e.g. derivatives contracts). It does not provide legal advice. |
| Compliance policies | Contracts not persisted after session; Supabase data stored in chosen Azure region; GDPR-compliant data deletion on request |
| How is sensitive data managed? | Contract text exists in memory during session only; not logged to model provider; JWT expiry at 1 hour; Supabase AES-256 at rest |
| Human oversight and control | Users can rate every response; all responses include disclaimer; high-stakes decisions flagged for lawyer review |

### Transparency

| Question | Answer |
|---|---|
| Direct use cases | Contract Q&A, clause explanation, risk identification |
| Indirect / misuse potential | Users may treat AI output as definitive legal advice and forgo professional review |
| How are results generated | Disclosed in onboarding: contract text + question sent to Azure AI GPT-4o; answer grounded in provided text |
| Benchmarks to share | Beta accuracy metrics (avg rating, hallucination rate) published in help docs post-launch |
| Disclosures needed | "LexAI provides legal information, not legal advice. Always consult a qualified lawyer before signing." — shown on every session |

### Fairness

| Question | Answer |
|---|---|
| Underrepresented groups | Non-English contracts; contracts from non-Western legal systems; contracts using non-standard clause structures |
| Why they underperform | Training data and test set are English, common-law-jurisdiction contracts. Model has less legal reasoning ability for civil law or non-English contexts. |
| Plan to improve | v2: evaluate multilingual contract support; expand eval set to include non-English contracts |

### Reliability & Safety

| Question | Answer |
|---|---|
| Acceptable error rate | <5% of responses contain hallucinated content; <1% of sessions result in a silent failure |
| Consequences of bad input | Malformed PDF → extraction fails → user sees error prompt; does not trigger AI call |
| Recovery plan | Azure AI outage → graceful error message with retry; Supabase outage → read from local session cache where possible; rollback plan within 2 hours |
| System health monitoring | Azure Monitor for API latency/errors; Supabase dashboard for DB metrics; Sentry for frontend errors |
| Customer communication plan | In-app banner within 30 minutes of P0 incident; email to affected users within 2 hours |

---

## 8. Pricing

### Development Costs (One-Time / MVP)

| Item | Estimated cost |
|---|---|
| Azure OpenAI API credits (dev + test) | $500 |
| Supabase Pro plan setup | $25/month (3 months dev = $75) |
| Vercel Pro (frontend hosting) | $20/month (3 months = $60) |
| Azure App Service (backend) | $70/month (3 months = $210) |
| Security penetration test | $2,000 |
| Miscellaneous (domains, tooling) | $200 |
| **Infrastructure subtotal** | **~$3,045** |

| Role | Duration | Estimated cost |
|---|---|---|
| Product Manager | 3 months | $15,000 |
| Lead Full-Stack Engineer | 3 months | $25,000 |
| Backend / AI Integration Engineer | 3 months | $20,000 |
| UX Designer (part-time) | 3 months | $8,000 |
| QA Engineer (part-time) | 3 months | $6,000 |
| **Manpower subtotal** | | **$74,000** |
| **Total one-time (MVP)** | | **~$77,000** |

### Operational Costs (Recurring Monthly at 500 active users)

| Item | Monthly cost |
|---|---|
| Azure OpenAI API (est. 5,000 analyses/month × $0.50 avg) | $2,500 |
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Azure App Service | $150 |
| Monitoring (Sentry + Azure Monitor) | $50 |
| **Monthly total** | **~$2,745** |

Cost per analysis at 5,000 sessions/month: **$0.55** (infrastructure) + Azure AI token cost (**~$1.50 est.**) = **~$2.05 per session** — within the <$2.50 target.

### Market Size

- **TAM:** Global legal tech market estimated at $35.6B by 2027 (Grand View Research, 2023)
- **SAM:** AI contract review tools addressable to SMBs and mid-market companies globally — estimated $4.2B
- **SOM:** English-speaking SMB segment in US, UK, India, Australia in first 24 months — targeting $20M ARR by Year 3

### Revenue Model & Pricing

| Model | Pros | Cons | Verdict |
|---|---|---|---|
| Per-document | Low friction, pay-as-you-go | Unpredictable revenue | Offered as add-on only |
| Subscription tiers | Predictable ARR; encourages usage habit | Tier sizing complexity | **Primary model** |
| Usage-based | Scales with value | Unpredictable for customer | Hybrid option for Growth tier |
| Freemium | Drives adoption | Conversion risk; cost of free users | Free trial only (14 days) |

**Directional Pricing:**

| Plan | Price | Includes | Target user |
|---|---|---|---|
| Free trial | $0 / 14 days | 5 contract analyses | All new signups |
| Starter | $29 / month | 20 analyses, 1 user | Solo founder, freelancer |
| Growth | $79 / month | 100 analyses, 5 users | SMB ops team |
| Pro | $199 / month | Unlimited analyses, 20 users, priority support | Mid-market legal ops |

Value anchor: "$29/month = less than 6 minutes of a lawyer's time — and you get 20 full contract reviews."

**Revenue projections:**

| Scenario | Paying customers (Yr 2) | ARPU | ARR |
|---|---|---|---|
| Conservative | 300 | $55 | $198,000 |
| Target | 800 | $70 | $672,000 |
| Optimistic | 2,000 | $85 | $2,040,000 |

---

## 9. Open Questions

1. **Azure AI agent API:** Which specific Azure AI Foundry endpoint and model deployment will be used? Who owns the Azure subscription and budget? (Owner: Engineering Lead — resolve before v0.1)
2. **Scanned PDF handling:** Should v1.0 support OCR via Azure Document Intelligence for scanned contracts, or strictly block scanned uploads? (Owner: PM + Engineering — resolve before v0.2 beta)
3. **Data retention for uploaded contracts:** Should contract text be deleted immediately after session, or retained for 24 hours to support session reload? Legal/privacy review needed. (Owner: PM + Legal adviser — resolve before public launch)
4. **Feedback data use:** Is user feedback (ratings + comments + contract excerpts) used to improve the model in v2? If yes, what consent mechanism is required? (Owner: PM — resolve before v1.1)
5. **Right panel execution steps:** Are steps streamed from the Azure AI agent API directly, or simulated client-side based on known pipeline stages? (Owner: Engineering — resolve in v0.1 sprint planning)

---

## 10. Assumptions Made

- The Azure AI agent (Azure OpenAI GPT-4o or equivalent) supports a context window of ≥100k tokens, sufficient for contracts up to ~80 pages.
- Supabase custom `users` table (not Supabase Auth's built-in users) is used as specified; JWT management is handled via Supabase's session API.
- Contracts are in English and text-based (not scanned images); scanned PDF support is out of scope for MVP.
- The right-panel execution steps trace is a real-time UI feature that reflects known pipeline stages; full agent-side event streaming is a v1.1 enhancement.
- Team size for MVP is 3–4 engineers; cost estimates reflect blended rates for a mix of senior and mid-level engineers in a cost-effective geography.
- "Azure AI agent" refers to an Azure AI Foundry agent or an Azure OpenAI API call orchestrated by the backend — not a third-party agent platform.
- Feedback ratings are used for product monitoring and prompt improvement; they are not used for model fine-tuning in MVP without explicit user consent mechanisms in place.
- No multi-tenancy or team workspaces in MVP; each user account is individual.
- GDPR compliance is addressed by not persisting contract content beyond the session; full legal review of data flows is assumed to be conducted before public launch.
- Development timeline assumes 10 weeks from kickoff to public launch (v0.1: 3 weeks, v0.2: 3 weeks, v1.0 hardening: 4 weeks).