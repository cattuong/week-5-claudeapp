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
      ...(options.headers as Record<string, string> ?? {}),
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
  const messageContent = contractText
    ? `[CONTRACT CONTEXT]\n${contractText}\n\n[USER QUESTION]\n${userMessage}`
    : userMessage

  await addMessageToThread(threadId, messageContent)
  const runId = await createRun(threadId)
  await waitForRun(threadId, runId)
  return getLatestAssistantMessage(threadId)
}
