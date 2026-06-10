# AI / External API Integration Spec Template

Use this template to write the external service integration spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this feature. Example: "Azure AI Integration" or "OpenAI Chat API".

---

## Description
Describe:
- What external service is being integrated
- What the service does for the app (e.g. analyses documents, generates responses)
- The key rule: all calls to this service happen server-side only, never from the client

---

## User Flow
Document every step from trigger to response:
- What user action triggers the integration
- What data the client sends to your server route
- What your server does to authenticate with the external service
- What API calls your server makes and in what order
- How your server gets the result and returns it to the client
- What is persisted (if anything)

---

## Authentication
Document everything a developer needs to authenticate with the service:
- What auth method the service requires (API key, OAuth, Azure AD, etc.)
- One-time setup steps the developer must run (e.g. CLI login command)
- Any environment variables needed for auth
- Common auth mistakes and how to avoid them (e.g. "API keys don't work for this endpoint — use token auth")
- How CI/production auth differs from local development

---

## Environment Variables
List every environment variable needed:
- Variable name
- What value it holds
- Whether it is required or optional
- Any fallback variable names the code should check

---

## API Version / SDK
Document any versioning requirements:
- Which API version to use and why
- Which versions do NOT work (and the error they produce)
- Which SDK or library to use (and any to avoid)

---

## Server API Route
Document the route your app exposes to the client:

**Request:**
- Method and path
- Every field in the request body with its type

**Implementation steps:**
- Step-by-step what the route handler does (authenticate, resolve IDs, create session, send message, poll/wait, extract result)
- Any important implementation details (e.g. how to resolve a display name to an internal ID)
- How to include context from the user's session (e.g. attached document as system context)

**Response:**
- Success response shape
- Error response shape

---

## Dependencies
List the npm packages needed:
- Package name and what it is used for
- Any packages that look relevant but should NOT be used (and why)

---

## Edge Cases
Cover every integration failure scenario:
- Authentication not set up
- Permission errors from the service
- Resource not found
- Payload too large (truncation strategy)
- Timeout or long-running request
- Empty or malformed response

---

## Debugging Checklist
List the most common failure modes developers will hit:
- The error message they will see
- What causes it
- How to fix it
