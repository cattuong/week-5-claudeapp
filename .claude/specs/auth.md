# Auth — Signup and Login

## Description

Users authenticate with email and password. Authentication is fully custom — no Supabase Auth, no OAuth for user login. Passwords are hashed with bcrypt before storage. On success, the user's `id` is stored in `localStorage` and the user is redirected to the dashboard. There is no session cookie for user auth — client reads `userId` from localStorage on every page load.

---

## User Flow — Signup

1. User visits `/signup`
2. Fills in email and password fields
3. Clicks "Create account"
4. Client POSTs `{ email, password }` to `/api/auth/signup`
5. Server checks if email already exists in `users` table — returns `409` if so
6. Server hashes password with `bcrypt.hash(password, 10)`
7. Server inserts row into `users` table, returns `{ userId: user.id }`
8. Client stores `localStorage.setItem('userId', userId)` and `localStorage.setItem('userEmail', email)`
9. Client redirects to `/dashboard`
10. On any error: displays red error text below the form

---

## User Flow — Login

1. User visits `/login`
2. Fills in email and password
3. Clicks "Sign in"
4. Client POSTs `{ email, password }` to `/api/auth/login`
5. Server queries `users` table by email — returns `401` if not found
6. Server calls `bcrypt.compare(password, user.password_hash)` — returns `401` if false
7. Server returns `{ userId: user.id, email: user.email }`
8. Client stores `localStorage.setItem('userId', userId)` and `localStorage.setItem('userEmail', email)`
9. Client redirects to `/dashboard`
10. On any error: displays "Invalid email or password" below the form

---

## DB Schema

```sql
create table users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  password_hash text not null,
  created_at   timestamptz default now()
);
```

---

## API Routes

### `POST /api/auth/signup`

**Request body:** `{ email: string, password: string }`

| Status | Body | Condition |
|---|---|---|
| `200` | `{ userId: string }` | User created |
| `409` | `{ error: 'Email already registered' }` | Email exists |
| `400` | `{ error: 'Email and password are required' }` | Missing fields |
| `500` | `{ error: 'Server error' }` | Unexpected error |

### `POST /api/auth/login`

**Request body:** `{ email: string, password: string }`

| Status | Body | Condition |
|---|---|---|
| `200` | `{ userId: string, email: string }` | Credentials valid |
| `401` | `{ error: 'Invalid credentials' }` | Email not found or password wrong |
| `400` | `{ error: 'Email and password are required' }` | Missing fields |
| `500` | `{ error: 'Server error' }` | Unexpected error |

Login errors are always generic — never reveal whether the email or password was wrong.

---

## Components

### `app/signup/page.tsx`
- Route: `/signup`
- Light mode (`data-theme="light"` on root div)
- Centered card, max-width 400px, vertically centered in viewport (`min-h-screen flex items-center justify-center`)
- Lora font heading "Create your account" (`text-display font-serif`)
- Email input + password input
- "Create account" primary button (full width)
- Link below: "Already have an account? Sign in" → `/login`
- Error state: red text (`text-an-error`) below the form

### `app/login/page.tsx`
- Route: `/login`
- Same light mode layout
- Heading "Welcome back"
- "Sign in" primary button
- Link: "Don't have an account? Sign up" → `/signup`

### `app/page.tsx`
- Client component
- On mount: if `localStorage.getItem('userId')` → `router.push('/dashboard')`, else → `router.push('/login')`
- Renders nothing (or a brief spinner) while redirecting

---

## Auth Guard

- Runs in `app/dashboard/layout.tsx` via `useEffect` on mount
- Checks `localStorage.getItem('userId')`
- If missing or empty: `router.push('/login')` immediately
- Dashboard layout renders children only after confirming userId is present

---

## Important Implementation Notes

- Use `bcryptjs` (not `bcrypt`) — it is the pure-JS build already in `package.json`
- localStorage keys: `'userId'` (uuid string) and `'userEmail'` (email string)
- Do NOT use Supabase Auth — query the custom `users` table directly via `lib/db.ts`
- `getUser(email)` returns `null` when not found — check for null before accessing `.password_hash`
- All API routes are in the `app/api/` directory using Next.js Route Handlers (not pages/api)

---

## Design

- Background: `bg-an-bg-base` in light mode (`#FAF9F7`)
- Card: `bg-an-bg-subtle rounded-xl p-8 border border-an-border` (or no card border — just centered form)
- Heading: `font-serif text-display text-an-fg-base`
- Sub-text: `text-body text-an-fg-subtle`
- Inputs: `h-9 px-3 bg-an-bg-subtle border border-an-border rounded-md text-body text-an-fg-base placeholder:text-an-fg-muted focus:border-an-border-strong outline-none w-full`
- Primary button: `h-9 px-4 bg-an-accent hover:bg-an-accent-hover text-white text-label rounded-md transition-colors w-full`
- Links: `text-an-accent hover:underline text-body-sm`
- Error text: `text-an-error text-caption mt-2`

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Email already taken (signup) | Server returns 409; client shows "An account with this email already exists" |
| Wrong password (login) | Server returns 401; client shows "Invalid email or password" |
| Email not registered (login) | Server returns 401; client shows "Invalid email or password" (same message — no enumeration) |
| Empty email or password | Client blocks submission; server also validates and returns 400 |
| Network error | Client catches fetch error, shows "Something went wrong. Please try again." |
| Dashboard loaded with no userId | `useEffect` in layout redirects immediately to `/login` |
