# Azure AI Foundry — Auth & Endpoint Reference

---

## CRITICAL: Auth Type Depends on What You're Calling

Azure AI Foundry has two separate auth planes. Getting this wrong wastes hours.

- **Agents / threads** (`*.services.ai.azure.com/api/projects/*/threads`) — requires Azure AD token. API keys do NOT work.
- **Model inference** (`*.openai.azure.com/openai/deployments/*/chat/completions`) — API key or Azure AD both work.
- **Serverless endpoints** (`*.inference.ai.azure.com/...`) — API key works.

If you use an API key for the Agents endpoint you will get an identity permissions error.
This is an auth error, not a version error — changing the API version will not fix it.

---

## Correct API Version

Always use `2025-05-01` for all threads/agents endpoints.
All other versions return `BadRequest: API version not supported`.

---

## Authentication — OAuth 2.0 (Recommended for Web Apps)

Instead of requiring `az login` in a terminal, implement a **Connect with Microsoft**
button so any user can authenticate through their browser.

### How the flow works

1. User clicks the Connect with Microsoft button in the app
2. App redirects the user to the Microsoft login page
3. User signs in with their Microsoft account
4. Microsoft redirects back to `/api/auth/microsoft/callback` with a `code` in the URL
5. Server exchanges the code for an access token and a refresh token
6. Tokens are stored server-side (encrypted HTTP-only cookie or database)
7. All Azure AI API calls use the stored access token as a Bearer token
8. When the token expires (~1 hour), the refresh token is used silently to get a new one

### Azure App Registration (one-time setup)

Before implementing, register an application in Azure Active Directory:
- Go to Azure Portal → Azure Active Directory → App registrations → New registration
- Set a redirect URI pointing to `/api/auth/microsoft/callback` for both local and production URLs
- After registration, add API permission: Azure Machine Learning → Delegated → `user_impersonation`
- Generate a client secret and copy the Application (client) ID, Directory (tenant) ID, and secret value

### Environment Variables

```env
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=
AZURE_EXISTING_AIPROJECT_ENDPOINT=
AZURE_EXISTING_AGENT_ID=
NEXTAUTH_URL=http://localhost:3000
```

### Package to install

```bash
npm install @azure/msal-node
```

---

## API Routes to Implement

### `/api/auth/microsoft`
- Purpose: starts the login flow
- Use `ConfidentialClientApplication` from `@azure/msal-node` to generate the Microsoft login URL
- Required scopes: `https://ml.azure.com/user_impersonation` and `offline_access`
- Redirect the user to the generated URL

### `/api/auth/microsoft/callback`
- Purpose: receives the code after the user signs in and exchanges it for tokens
- Extract the `code` from the query string
- Call `acquireTokenByCode` with the same scopes and redirect URI
- Store the access token in an HTTP-only cookie (not localStorage — XSS risk)
- Redirect the user to the dashboard on success

### `/api/auth/microsoft/refresh`
- Purpose: silently refreshes an expired access token
- Use `acquireTokenSilent` with the cached account — MSAL handles the refresh token automatically
- Update the stored cookie with the new access token

---

## Using the Token in the Chat Route

- Read the access token from the HTTP-only cookie on every request
- If the cookie is missing or empty, return 401 with a message telling the client to reconnect
- Pass the token as a `Bearer` header in all Azure API calls
- If Azure returns 401 or 403, return an appropriate error to the client

---

## Connect with Microsoft Button

- Add the button to the dashboard or settings page
- The button is a plain link to `/api/auth/microsoft` — clicking it starts the OAuth redirect
- After successful connection, show the user's connected status
- If a chat request returns 401, redirect the user back to `/api/auth/microsoft` to reconnect

---

## Token Expiry

- Access tokens expire after approximately 1 hour
- On the client: if any API call returns 401, redirect to `/api/auth/microsoft` to restart the flow
- On the server: optionally implement silent refresh before the token expires using the refresh token

---

## Alternative: az login (Local Development Only)

If you only need this locally and all users are developers with the Azure CLI:

1. Install: `brew install azure-cli`
2. Run: `az login` — browser opens, sign in with the Azure account that owns the project
3. Restart the dev server — `DefaultAzureCredential` picks up the session automatically
4. Install `@azure/identity` instead of `@azure/msal-node`

This approach does NOT work for deployed apps or users without the Azure CLI installed.

---

## What NOT to Do

- Do not use an API key for the Agents endpoint — it will always fail with a permissions error
- Do not pass the agent display name as `assistant_id` — look up the `asst_xxx` ID first by listing agents
- Do not call Azure from the client side — always go through a Next.js API route
- Do not store access tokens in localStorage — use HTTP-only cookies
- Do not hardcode API version below `2025-05-01` for the threads endpoint

---

## Diagnosing Errors

- `Identity(object id: ) does not have permissions` — using API key instead of Azure AD token
- `BadRequest: API version not supported` — not using `2025-05-01`
- `Invalid 'assistant_id': expected 'asst'` — passing agent name instead of the `asst_xxx` ID
- `Not connected` / 401 on chat route — cookie missing, redirect user to reconnect
- `403` from Azure — user account does not have Azure AI Agent Operator role on the project
