# Auth Spec

## Feature Name
Signup and Login — Custom Users Table

## Description
Authentication uses a custom `users` table in Supabase. There is no Supabase Auth. Passwords are hashed server-side with bcryptjs (10 rounds) before storage. On successful signup or login, the server returns a `userId` UUID which the client stores in `localStorage`. All protected routes check for this value on mount and redirect to `/login` if absent.

Microsoft OAuth (`@azure/msal-node`) is a separate flow used only to acquire an Azure AI Bearer token — it is not the primary login mechanism.

---

## User Flow — Signup

1. User visits `/signup`
2. Fills in: **Email**, **Password** (min 8 chars)
3. Client validates: both fields non-empty, password ≥ 8 chars — shows inline error if not
4. On submit: `POST /api/auth/signup` with `{ email, password }`
5. Server checks `users` table for existing email — returns `409` if found
6. Server hashes password with `bcrypt.hash(password, 10)`
7. Server inserts row into `users` table
8. Server returns `{ userId: uuid }` with status `201`
9. Client stores `userId` in `localStorage` under key `"userId"`
10. Client redirects to `/dashboard`

---

## User Flow — Login

1. User visits `/login`
2. Fills in: **Email**, **Password**
3. Client validates: both fields non-empty
4. On submit: `POST /api/auth/login` with `{ email, password }`
5. Server queries `users` table by email
6. If no user found: returns generic `401` — "Invalid email or password."
7. Server compares password with `bcrypt.compare(password, user.password_hash)`
8. If mismatch: returns generic `401` — "Invalid email or password."
9. On success: returns `{ userId: uuid }` with status `200`
10. Client stores `userId` in `localStorage` under key `"userId"`
11. Client redirects to `/dashboard`

---

## User Flow — Logout

1. User clicks Logout in sidebar footer
2. Client calls `localStorage.removeItem('userId')`
3. Client redirects to `/login`

---

## DB Schema

See `specs/database.md` — `users` table.

Key points:
- `email` is UNIQUE — enforced at DB level and checked server-side before insert
- `password_hash` stores the bcrypt output (60-char string)
- `id` is UUID, auto-generated — this is what gets stored in localStorage

---

## API Routes

### `POST /api/auth/signup`
**Request body:** `{ email: string, password: string }`

| Status | Response body | Condition |
|---|---|---|
| 201 | `{ userId: string }` | Success — user created |
| 400 | `{ error: "Email and password are required." }` | Missing fields |
| 409 | `{ error: "An account with this email already exists." }` | Email in use |
| 500 | `{ error: "Something went wrong." }` | DB error |

### `POST /api/auth/login`
**Request body:** `{ email: string, password: string }`

| Status | Response body | Condition |
|---|---|---|
| 200 | `{ userId: string }` | Success |
| 400 | `{ error: "All fields are required." }` | Missing fields |
| 401 | `{ error: "Invalid email or password." }` | Wrong email or password (generic — never enumerate which) |
| 500 | `{ error: "Something went wrong." }` | DB error |

---

## Microsoft OAuth Routes (Azure token only)

### `GET /api/auth/microsoft`
- Generates Microsoft login URL via `ConfidentialClientApplication` (msal-node)
- Scopes: `https://ml.azure.com/user_impersonation`, `offline_access`
- Redirects user to Microsoft login

### `GET /api/auth/microsoft/callback`
- Receives `code` query param from Microsoft
- Calls `acquireTokenByCode` to exchange for access token
- Sets `azure_token` as HTTP-only cookie (maxAge 3600s)
- Redirects to `/dashboard`
- On failure: redirects to `/login?error=no_code`

---

## Components

### `/app/signup/page.tsx`
- Standalone centered card, light mode (`data-theme="light"`)
- Fields: Email, Password
- Error display: inline below fields
- Link to `/login` ("Already have one? Log in")
- Submit button: coral accent, full-width

### `/app/login/page.tsx`
- Same layout as signup
- Fields: Email, Password
- Error display: inline below fields
- Link to `/signup` ("No account? Sign up")
- Submit button: coral accent, full-width

Both pages: max-width `sm` (384px), centered vertically and horizontally on `min-h-screen`.

---

## Auth Guard

- Check runs in `useEffect` on mount in `app/dashboard/page.tsx`
- Checks: `localStorage.getItem('userId')`
- If null/empty: immediately `router.push('/login')`
- No server-side middleware for MVP (client-only guard)

---

## Important Implementation Notes

- `localStorage` key is `"userId"` — exact string, no variations
- Login errors never reveal whether email or password was wrong — always generic "Invalid email or password."
- Password is never returned from the server in any response
- Microsoft OAuth sets `azure_token` cookie — this is separate from `userId` in localStorage; both are needed for full functionality (chat requires the Azure token)
- `az login` is NOT used in production — only MSAL OAuth with `AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET`/`AZURE_TENANT_ID`

---

## Design

- Pages: light mode (`data-theme="light"` on wrapper div)
- Background: `bg-an-bg-base` (resolves to `#FAF9F7` in light mode)
- Card: no explicit card border — centered column, max-width 384px
- Heading: Lora, 28px, font-medium — "Welcome back" / "Create an account"
- Inputs: `h-9`, `bg-an-bg-subtle`, `border border-an-border`, `rounded-md`
- Focus: `border-an-border-strong`, no outline ring
- Button: `h-9 bg-an-accent hover:bg-an-accent-hover text-white rounded-md text-[14px] font-medium`
- Error text: `text-[13px]` in `var(--an-error)` color

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Empty email or password | Client-side error shown immediately, no request sent |
| Password < 8 chars (signup) | Client-side error: "Password must be at least 8 characters." |
| Duplicate email (signup) | Server returns 409 → client shows "An account with this email already exists." |
| Wrong password (login) | Server returns 401 → client shows "Invalid email or password." |
| Unknown email (login) | Server returns 401 → client shows "Invalid email or password." |
| Network error | Client catches and shows "Something went wrong. Please try again." |
| User visits /dashboard without userId | Immediately redirected to /login |
| User already logged in, visits /login | No auto-redirect in MVP (acceptable) |
