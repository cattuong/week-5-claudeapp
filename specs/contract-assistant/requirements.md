# Requirements: Contract Assistant

## Summary

Users need to review and interrogate legal contracts using AI without manually extracting text or managing conversation context. The Contract Assistant lets authenticated users upload a contract (PDF or plain text), have it parsed entirely in the browser, and then chat with an Azure AI Foundry Agent about its contents across multiple persistent sessions.

The core design constraint is token efficiency: the extracted contract text is sent to the Azure AI thread exactly once — on the first message of a session — injected as a prefix before the user's first question. The Azure AI thread then maintains conversation context automatically, so subsequent messages are just the user's query. This avoids re-sending the full contract on every turn.

The product must feel like a focused, professional legal tool. All UI follows the LegalGraph design system documented in `DESIGN.md`: warm ivory/sand canvas, ink-blue primary, brass accent, Spectral serif headings, IBM Plex Sans body. No consumer-style gradients, no emoji in product UI, no cold grey tones.

## Goals

- Multi-user auth (sign up / sign in / sign out) via Supabase Authentication
- Users can create, name, and switch between multiple chat sessions
- Contract uploaded once per session — parsed client-side, stored in Supabase, never resent
- AI responses powered by Azure AI Foundry Agent via Supabase Edge Function
- All data isolated per user via Supabase Row Level Security
- Fully TypeScript codebase, Tailwind CSS for layout utilities, LegalGraph design tokens for visual style

## Non-Goals

- File storage: the original contract file is never uploaded to any server — only extracted text
- Contract comparison across sessions
- Redlining, annotations, or document editing
- Multi-user collaboration on a single session
- Mobile-first responsive layout (desktop-first is sufficient for this build)
- Search across sessions or contracts
- Streaming AI responses (polling-based completion is acceptable for v1)
- Email verification or OAuth social login

## Acceptance Criteria

- [ ] New users can sign up and returning users can sign in
- [ ] Authenticated users land on the dashboard; unauthenticated users are redirected to `/auth`
- [ ] User can create a new chat session from the sidebar
- [ ] User can upload a PDF or TXT file; text is extracted in the browser and shown as a status badge
- [ ] User can type a message and receive an AI response from Azure AI Foundry
- [ ] Contract text is included only in the first message to the AI per session; subsequent messages do not re-send it
- [ ] All previous sessions appear in the sidebar, selectable, with their message history loaded
- [ ] Refreshing the page preserves the session list and active session's messages
- [ ] Users cannot see or access other users' sessions or messages (RLS enforced)
- [ ] UI matches LegalGraph design system (no inline gradients, correct tokens applied)

## Assumptions

- Supabase project is already created and accessible; user will provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Azure AI Foundry Agent is already deployed; user will provide `AZURE_AI_ENDPOINT`, `AZURE_AI_API_KEY`, and `AZURE_AI_AGENT_ID`
- Contracts fit within the Azure AI model's context window (typical legal contracts are 5k–50k tokens)
- Development is on a single branch; no concurrent multi-agent git conflicts
- `pdfjs-dist` v4 is compatible with the Vite 5 bundler configuration

## Technical Constraints

- Frontend: React 18 + TypeScript + Vite 5, Tailwind CSS v3, react-router-dom v6
- Backend: Supabase Edge Functions (Deno runtime) with Hono for routing
- Database: Supabase PostgreSQL with Row Level Security on all tables
- AI: Azure AI Foundry Agent Service (OpenAI Assistants API compatible)
- PDF parsing: `pdfjs-dist` v4, client-side only
- All IDs are UUIDs (`gen_random_uuid()`) unless they come from Supabase Auth
- Design system: LegalGraph tokens defined in `src/tokens/*.css` — CSS custom properties applied globally
- Fonts: Spectral (headings), IBM Plex Sans (body), IBM Plex Mono (data/labels) via Google Fonts CDN
- No external state management library (React Context + useReducer only)
- Supabase JS client communicates with Edge Functions via `supabase.functions.invoke()` — JWT auto-attached
