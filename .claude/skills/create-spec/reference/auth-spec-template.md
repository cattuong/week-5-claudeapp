# Auth Spec Template

Use this template to write the auth spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this feature. Example: "Signup and Login" or "User Authentication".

---

## Description
Describe:
- How users authenticate (email/password, OAuth, magic link, etc.)
- Whether you use a provider's built-in auth or a custom implementation
- How passwords are stored (e.g. hashed with bcrypt)
- What happens after successful auth (where user is redirected, what is stored)

---

## User Flow — Signup
Document every step the user takes and every action the system performs:
- What page/route the user visits
- What fields they fill in
- What client-side validation runs before the request is sent
- What API route is called and with what payload
- What the server checks and in what order
- How passwords are hashed and stored
- What is returned to the client on success
- What the client stores and where (localStorage, sessionStorage, cookie)
- Where the user is redirected

---

## User Flow — Login
Same level of detail as Signup:
- What page/route the user visits
- What fields they fill in
- What client-side validation runs
- What API route is called
- How the server looks up and verifies the user
- What is returned on success
- What the client stores and where
- Where the user is redirected

---

## DB Schema
Document the users table:
- Every column, its type, and constraints
- Which fields are unique
- How the primary key is generated

---

## API Routes
For each auth endpoint, document:
- Method and path
- Request body fields
- All possible response codes and their response body
- Error messages (note: login errors should be generic — do not reveal whether email or password was wrong)

---

## Components
List the pages/components needed:
- Login page — route, what it contains, what it links to
- Signup page — route, what it contains, what it links to
- Describe their layout (standalone, centered card, part of the app shell, etc.)

---

## Auth Guard
Describe how protected routes are guarded:
- Where the check runs (e.g. on mount in the dashboard page)
- What is checked (e.g. userId in localStorage)
- What happens if the check fails (e.g. immediate redirect to /login)

---

## Important Implementation Notes
List any non-obvious details that affect implementation:
- Exactly what to store in session storage and under what keys
- Column naming conventions in the DB
- Any initialization patterns to follow
- Any common mistakes to avoid

---

## Design
Describe the visual design of the auth pages:
- Page background
- Card dimensions, border radius, shadow
- Heading style
- Button style
- Error state style

---

## Edge Cases
Cover every error scenario as a table:
- What happens for each failure mode
- What error message is shown and where
- Whether it is client-side or server-side validation
