# Azure AI Integration — Contract Analysis Agent

## Description

The app integrates with an Azure AI Foundry Agent to analyse legal contracts and answer user questions. All calls to Azure are made server-side via a Next.js API route — never from the client. Authentication uses Microsoft OAuth via `@azure/msal-node` (a ConfidentialClientApplication flow). The Azure access token is stored in an HTTP-only cookie after login and passed as a Bearer token on all Azure API requests.

---

## User Flow

1. On first dashboard load, client GETs `/api/auth/status` → `{ connected: boolean }`
2. If not connected: banner shown — "Connect your Microsoft account to enable AI contract analysis" + "Connect" button
3. User clicks "Connect" → navigates to `/api/auth/microsoft`
4. Server redirects to Microsoft login page
5. User authenticates with Microsoft → Microsoft redirects to `/api/auth/microsoft/callback?code=...`
6. Server exchanges `code` for access token, stores in HTTP-only cookie `azure_token`
7. Server redirects to `/dashboard`
8. Banner is now hidden; user can send messages
9. On every chat send: client POSTs `{ contractText, userMessage, sessionId }` to `/api/chat`
10. Server reads `azure_token` cookie, creates Azure thread, sends message, runs agent, polls, returns response

---

## Authentication

**Method:** Microsoft OAuth 2.0 via `@azure/msal-node` — ConfidentialClientApplication

**Required scopes:**
```
https://ml.azure.com/user_impersonation
offline_access
```

**One-time Azure setup:**
1. Azure Portal → Azure Active Directory → App registrations → New registration
2. Add redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
3. Add API permission: Azure Machine Learning → Delegated → `user_impersonation`
4. Grant admin consent
5. Create a client secret (Certificates & secrets → New client secret)
6. Copy: Application (client) ID, Directory (tenant) ID, secret value

**Critical:** The Azure AI Agents threads endpoint requires an **Azure AD Bearer token**. API keys return an identity permissions error. Never use `@azure/openai` or API keys for this endpoint.

**Token storage:** HTTP-only cookie named `azure_token`. Never store in localStorage.

**Token expiry:** Access tokens expire after ~1 hour. If `/api/chat` gets a 401 or 403 from Azure, return `401` to the client so it can prompt reconnection.

---

## Environment Variables

| Variable | Value | Required |
|---|---|---|
| `AZURE_CLIENT_ID` | App registration Application (client) ID | Yes |
| `AZURE_CLIENT_SECRET` | Client secret value | Yes |
| `AZURE_TENANT_ID` | Directory (tenant) ID | Yes |
| `AZURE_AGENT_ENDPOINT_URL` | `https://<name>.services.ai.azure.com/api/projects/<project>` | Yes |
| `AZURE_AGENT_ID` | Agent ID in `asst_xxx` format (NOT the display name) | Yes |
| `NEXTAUTH_URL` | `http://localhost:3000` | Yes |

All in `.env`. None exposed to the client (`NEXT_PUBLIC_` prefix is not used for any Azure var).

---

## API Version

Always use `2025-05-01`. Other versions return `BadRequest: API version not supported`. Append `?api-version=2025-05-01` to every Azure API URL.

---

## Server API Routes

### `lib/azure-auth.ts`

```ts
getMsalClient(): ConfidentialClientApplication
getAuthUrl(): Promise<string>
exchangeCode(code: string): Promise<AuthenticationResult>
```

Uses `@azure/msal-node`. Authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`.

---

### `GET /api/auth/microsoft`
- Calls `getAuthUrl()` with required scopes and redirect URI
- `return Response.redirect(url, 302)`

---

### `GET /api/auth/microsoft/callback`
- Reads `code` from `request.nextUrl.searchParams.get('code')`
- Calls `exchangeCode(code)` → `tokenResult`
- Sets HTTP-only cookie: `cookies().set('azure_token', tokenResult.accessToken, { httpOnly: true, path: '/', maxAge: 3600 })`
- `return Response.redirect('/dashboard', 302)`
- On error: redirect to `/dashboard?error=auth_failed`

---

### `GET /api/auth/status`
- Reads `azure_token` from `cookies().get('azure_token')`
- Returns `200 { connected: true }` if present, `200 { connected: false }` if absent

---

### `POST /api/chat`

**Request body:**
```ts
{
  contractText: string   // empty string if no file
  userMessage: string
  sessionId: string
}
```

**Implementation steps:**

1. Read Bearer token:
   ```ts
   const token = cookies().get('azure_token')?.value
   if (!token) return Response.json({ error: 'Not connected' }, { status: 401 })
   ```

2. Create thread:
   ```
   POST {AZURE_AGENT_ENDPOINT_URL}/threads?api-version=2025-05-01
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {}
   → { id: threadId }
   ```

3. Add message to thread:
   ```
   POST {AZURE_AGENT_ENDPOINT_URL}/threads/{threadId}/messages?api-version=2025-05-01
   Body: {
     role: "user",
     content: "Contract:\n{contractText}\n\nQuestion: {userMessage}"
   }
   ```
   When `contractText` is empty, send: `"Question: {userMessage}"` only.

4. Run the agent:
   ```
   POST {AZURE_AGENT_ENDPOINT_URL}/threads/{threadId}/runs?api-version=2025-05-01
   Body: { assistant_id: AZURE_AGENT_ID }
   → { id: runId }
   ```

5. Poll run status every 300ms until `status === 'completed' | 'failed'`:
   ```
   GET {AZURE_AGENT_ENDPOINT_URL}/threads/{threadId}/runs/{runId}?api-version=2025-05-01
   ```
   Timeout after 60 seconds — return 500 if exceeded.

6. Retrieve messages:
   ```
   GET {AZURE_AGENT_ENDPOINT_URL}/threads/{threadId}/messages?api-version=2025-05-01
   ```
   Find the last message with `role === 'assistant'`. Extract text from `content[0].text.value`.

7. Return:
   ```ts
   return Response.json({ content: assistantText })
   ```

**Success response:** `200 { content: string }`  
**Error responses:** `401 { error: 'Not connected' }` | `500 { error: 'AI error' }` | `500 { error: 'AI request timed out' }`

---

## Dependencies

| Package | Purpose |
|---|---|
| `@azure/msal-node` | OAuth token acquisition — already in `package.json` |

**Do NOT install:**
- `@azure/openai` — this uses the Foundry Agents REST API, not the OpenAI SDK
- `@azure/identity` — `DefaultAzureCredential` only works for `az login` flows, not user-facing OAuth

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `azure_token` cookie missing | `/api/chat` returns 401; client shows reconnect banner |
| Token expired during request | Azure returns 401/403; server returns 401 to client; client shows reconnect banner |
| Run status `failed` | Return `500 { error: 'AI error' }` |
| Poll exceeds 60 seconds | Return `500 { error: 'AI request timed out' }` |
| `contractText` is very large (>100KB) | Truncate to first 80,000 characters before sending — add comment in prompt: "(contract truncated)" |
| `AZURE_AGENT_ID` is display name not `asst_xxx` | Azure returns `Invalid 'assistant_id': expected 'asst'` — use the ID from Foundry UI |
| Missing env vars | `getMsalClient()` throws at startup — check `.env` and restart server |
| User lacks Azure AI Agent Operator role | Azure returns 403 — user must be assigned role in Foundry project settings |

---

## Debugging Checklist

| Error | Cause | Fix |
|---|---|---|
| `Identity does not have permissions` | Using API key instead of Bearer token | Use MSAL OAuth, not API key |
| `BadRequest: API version not supported` | Wrong `api-version` query param | Use `2025-05-01` exactly |
| `Invalid 'assistant_id': expected 'asst'` | Passing display name not ID | Copy `asst_xxx` ID from Foundry → Agents tab |
| `Not connected` (401 from /api/chat) | Cookie missing or expired | Click "Connect" in dashboard banner |
| `403` from Azure thread/run endpoint | Missing Azure AI Agent Operator role | Assign in Foundry project → Access control |
| Callback returns `auth_failed` | MSAL `exchangeCode` threw | Check redirect URI matches app registration exactly |
