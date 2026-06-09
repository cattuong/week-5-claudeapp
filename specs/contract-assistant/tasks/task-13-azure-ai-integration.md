# Task 13: Azure AI Integration

## Status

pending

## Wave

4

## Description

Replace the Azure AI stub in the Edge Function with real Azure AI Foundry Agent Service calls. The flow is: create a thread on the first message of a session, inject the contract text as a prefix on that first message, then poll the run to completion and return the assistant's response. This task also updates `ChatContext` on the frontend to handle any additional error states. This task runs in parallel with task-12.

## Dependencies

**Depends on:** task-06-edge-function, task-07-contract-parser, task-10-session-context, task-11-chat-components
**Blocks:** None (final task)

**Context from dependencies:**
- task-06 created `supabase/functions/chat/index.ts` (Hono router with all five endpoints) and `supabase/functions/_shared/azureClient.ts` (stub with two functions: `createAzureThread()` and `sendToAzureAgent(threadId, userMessage, contractText|null)`). This task replaces ONLY `azureClient.ts` — the Hono router in `index.ts` does not change.
- task-07 built `parseContract` on the frontend — this task does NOT call parseContract. Contract text extraction happens client-side and is stored in `chat_sessions.contract_text` by task-12. By the time the Edge Function receives a message, the contract text is already in the database and is loaded from there.
- task-10 created `api.sessions.sendMessage(sessionId, content)` in `src/lib/apiClient.ts`. The frontend sends only `{ content }` — the Edge Function fetches the contract text from the DB. No contract text travels over the wire from frontend to Edge Function.
- task-11 built `ChatContext` with a `sendMessage` function that calls `api.sessions.sendMessage` and appends both messages to state.

## Files to Modify

- `supabase/functions/_shared/azureClient.ts` — replace stub with real Azure AI Foundry Assistants API calls

## Technical Details

### Azure AI Foundry Agent Service — API Reference

Azure AI Foundry Agent Service is compatible with the OpenAI Assistants API. All calls use the Azure endpoint with an `api-key` header.

```
Base URL: {AZURE_AI_ENDPOINT}/openai
API Version query param: api-version=2024-05-01-preview
Auth header: api-key: {AZURE_AI_API_KEY}
```

**Full flow per message:**

```
1. POST   /threads                          → creates a thread, returns { id: "thread_xxx" }
   (called once per session, on first message)

2. POST   /threads/{thread_id}/messages    → adds user message to thread
   Body: { role: "user", content: "..." }

3. POST   /threads/{thread_id}/runs        → starts the agent run
   Body: { assistant_id: "{AZURE_AI_AGENT_ID}" }
   Returns: { id: "run_xxx", status: "queued" }

4. GET    /threads/{thread_id}/runs/{run_id}  → poll until status = "completed"
   (poll every 1s, timeout after 60s)

5. GET    /threads/{thread_id}/messages    → list messages (newest first)
   Pick the first message where role = "assistant" added after the user message
```

### Implementation Steps

1. Replace `supabase/functions/_shared/azureClient.ts` entirely:

```ts
const ENDPOINT = Deno.env.get('AZURE_AI_ENDPOINT')!.replace(/\/$/, '')
const API_KEY = Deno.env.get('AZURE_AI_API_KEY')!
const AGENT_ID = Deno.env.get('AZURE_AI_AGENT_ID')!
const API_VERSION = '2024-05-01-preview'

function azureUrl(path: string) {
  return `${ENDPOINT}/openai${path}?api-version=${API_VERSION}`
}

async function azureFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(azureUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Azure AI error ${res.status}: ${body}`)
  }
  return res.json()
}

export async function createAzureThread(): Promise<string> {
  const data = await azureFetch<{ id: string }>('/threads', { method: 'POST', body: '{}' })
  return data.id
}

async function addMessageToThread(threadId: string, content: string): Promise<void> {
  await azureFetch(`/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content }),
  })
}

async function createRun(threadId: string): Promise<string> {
  const data = await azureFetch<{ id: string }>(`/threads/${threadId}/runs`, {
    method: 'POST',
    body: JSON.stringify({ assistant_id: AGENT_ID }),
  })
  return data.id
}

async function waitForRun(threadId: string, runId: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 1000))
    const run = await azureFetch<{ status: string; last_error?: { message: string } }>(
      `/threads/${threadId}/runs/${runId}`
    )
    if (run.status === 'completed') return
    if (['failed', 'cancelled', 'expired'].includes(run.status)) {
      throw new Error(`Azure AI run ${run.status}: ${run.last_error?.message ?? 'unknown error'}`)
    }
    // status is "queued" or "in_progress" — keep polling
  }
  throw new Error('Azure AI run timed out after 60s')
}

async function getLatestAssistantMessage(threadId: string): Promise<string> {
  const data = await azureFetch<{
    data: Array<{
      role: string
      content: Array<{ type: string; text?: { value: string } }>
    }>
  }>(`/threads/${threadId}/messages`)

  // Messages are returned newest-first; find the first assistant message
  const msg = data.data.find((m) => m.role === 'assistant')
  if (!msg) throw new Error('No assistant message found after run completed')

  const textBlock = msg.content.find((c) => c.type === 'text')
  return textBlock?.text?.value ?? ''
}

export async function sendToAzureAgent(
  threadId: string,
  userMessage: string,
  contractText: string | null
): Promise<string> {
  // On first message (contractText provided), prefix the contract text
  const messageContent = contractText
    ? `[CONTRACT CONTEXT]\n${contractText}\n\n[USER QUESTION]\n${userMessage}`
    : userMessage

  await addMessageToThread(threadId, messageContent)
  const runId = await createRun(threadId)
  await waitForRun(threadId, runId)
  return getLatestAssistantMessage(threadId)
}
```

### Contract Text Injection Strategy

The contract text is injected **once**, on the first message of a session:

```
First message content sent to Azure:
[CONTRACT CONTEXT]
{full extracted contract text — can be 5k–50k tokens}

[USER QUESTION]
{user's actual question}
```

Subsequent messages are just the user's question. Azure's thread API maintains the conversation history — it remembers the contract context from the first message for all future turns in the same thread. The Edge Function in task-06 determines whether this is the first message by checking `session.azure_thread_id === null` before creating the thread.

### Environment Variables (must be set in Supabase Edge Function secrets)

```bash
supabase secrets set \
  AZURE_AI_ENDPOINT=https://your-project.openai.azure.com \
  AZURE_AI_API_KEY=your-api-key \
  AZURE_AI_AGENT_ID=asst_your_agent_id
```

Or via Supabase Dashboard → Project Settings → Edge Functions → Secrets.

### Deploying the Updated Function

After replacing `azureClient.ts`, redeploy the Edge Function:
```bash
supabase functions deploy chat
```

## Acceptance Criteria

- [ ] `createAzureThread()` returns a real thread ID (string starting with `thread_`)
- [ ] Sending the first message in a session includes contract text as a prefix (verified via Azure portal thread viewer)
- [ ] Subsequent messages in the same session do NOT include contract text
- [ ] AI responses from Azure appear in the chat within 30–60 seconds
- [ ] If the Azure run fails, the Edge Function returns a 500 with the error message (the frontend shows it via ChatContext error state)
- [ ] The session's `azure_thread_id` column in Supabase is populated after the first message
- [ ] `AZURE_AI_ENDPOINT`, `AZURE_AI_API_KEY`, `AZURE_AI_AGENT_ID` are all read from environment variables — no hardcoded values

## Notes

- The poll interval is 1 second with a 60-second timeout. This is acceptable for v1. If Azure supports Server-Sent Events (streaming) for runs, that would eliminate the polling latency — but streaming adds complexity and is a future enhancement.
- The Azure API version `2024-05-01-preview` is current as of June 2026. Check the Azure AI Foundry documentation for the latest stable version if this one returns 404.
- If `AZURE_AI_ENDPOINT` ends with a trailing slash, it is stripped with `.replace(/\/$/, '')` to avoid double-slash URLs.
- `getLatestAssistantMessage` takes the first (newest) assistant message. This works because after `waitForRun` completes, the only new assistant message is the one just generated.
