# Action Required: Contract Assistant

Manual steps that must be completed by a human. These cannot be automated.

## Before Implementation

- [ ] **Create a Supabase project** — Go to supabase.com, create a new project, and note the Project URL and anon public key from Settings → API
- [ ] **Set up `.env` file** — Copy `.env.example` to `.env` in the project root and fill in:
  - `VITE_SUPABASE_URL` — your Supabase project URL (e.g. `https://xxxx.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY` — the anon/public key from Supabase dashboard
- [ ] **Note your Azure AI credentials** — Gather the following for the Edge Function environment variables:
  - `AZURE_AI_ENDPOINT` — e.g. `https://myproject.openai.azure.com`
  - `AZURE_AI_API_KEY` — API key from Azure AI Foundry portal
  - `AZURE_AI_AGENT_ID` — the assistant/agent ID from Azure AI Foundry (looks like `asst_xxxx`)

## During Implementation

- [ ] **Run schema migration** — After task-03 creates `supabase/migrations/001_initial_schema.sql`, run it against your Supabase project. Either:
  - Via Supabase CLI: `supabase db push` (if CLI is set up locally)
  - Or manually: paste the SQL into Supabase Dashboard → SQL Editor and execute
- [ ] **Set Edge Function secrets** — After task-06 creates the Edge Function, set the Azure secrets in Supabase:
  ```
  supabase secrets set AZURE_AI_ENDPOINT=https://... AZURE_AI_API_KEY=... AZURE_AI_AGENT_ID=asst_...
  ```
  Or set them via Supabase Dashboard → Edge Functions → Secrets

## After Implementation

- [ ] **Deploy Edge Function** — Run `supabase functions deploy chat` to deploy the Edge Function to your Supabase project
- [ ] **Verify CORS origin** — In `supabase/functions/_shared/cors.ts`, update `ALLOWED_ORIGIN` to match your production domain if deploying beyond localhost

---

> These tasks are also referenced in context within the relevant task files (task-03, task-06, task-13).
