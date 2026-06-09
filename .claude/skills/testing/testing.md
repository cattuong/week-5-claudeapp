---
name: test-app
description: >
  Tests every user flow in the running app and fixes any failures automatically.
  Use this skill whenever the user asks to:
  - Test the app
  - Run tests
  - Verify all flows
  - Use the testing skill
  Trigger this skill immediately when the user says "test the app",
  "run tests", or "use testing skill".
  Only trigger after the app is running on localhost:3000.
---

# Testing Skill

Your job is to test every user flow in the app, report results, and fix
any failures automatically.

Do every step in order. Do not skip any step.

---

## Step 1 — Confirm App is Running

Check that the app is running at http://localhost:3000.
If it is not running, tell the user:
App is not running. Please run "use implementation skill" first.

---

## Step 2 — Run All Test Cases

Go through each test case below. After each one report pass or fail.

---

### Test 1 — Signup
- Go to /signup
- Enter a new email and password
- Submit the form
- Check users table in Supabase — new row should appear
- Expected result: redirect to /dashboard

### Test 2 — Login
- Go to /login
- Enter the email and password from Test 1
- Submit the form
- Confirm users table was queried and not Supabase Auth
- Expected result: redirect to /dashboard

### Test 3 — New Chat
- Click New Chat button in sidebar
- Check sessions table in Supabase — new row should appear
- Expected result: empty chat area, new session in sidebar

### Test 4 — File Upload
- Click attachment button in input bar
- Upload a PDF file
- Expected result: file parsed to plain text, file name badge shown in input

### Test 5 — Azure Call
- Type a question about the contract
- Send the message
- Expected result:
  - contractText and userMessage sent to /api/chat
  - Azure response shown in chat bubble
  - Both messages saved to messages table in Supabase

### Test 6 — Chat History
- Create a second new chat
- Refresh the page
- Expected result: both sessions visible in sidebar

### Test 7 — Load Previous Chat
- Click a previous session in sidebar
- Expected result: messages from that session load in chat area

### Test 8 — Feedback Form
- After an assistant response appears
- Submit a star rating and comment
- Check feedback table in Supabase — new row should appear
- Expected result: form collapses, thank you message shown

---

## Step 3 — Fix Any Failures

For every failed test:
- Identify the root cause
- Fix the code automatically
- Re-run the test
- Report the fix

---

## Step 4 — Final Report

Tell the user:
All tests passed. App is ready for demo.

Test Results:
- Signup: pass
- Login: pass
- New Chat: pass
- File Upload: pass
- Azure Call: pass
- Chat History: pass
- Load Previous Chat: pass
- Feedback Form: pass

---

## Notes
- Always fix failures automatically — do not ask the user to fix things
- Check Supabase tables directly to verify data is being saved
- If Azure test fails, remind user to run az login in terminal
- Do not mark a test as passed unless it is fully verified