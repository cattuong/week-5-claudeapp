# Database Spec Template

Use this template to write the database spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this spec area. Example: "Database Schema" or "[App Name] Database".

---

## Description
Describe:
- What database provider is being used (e.g. Supabase, PlanetScale, Neon, Firebase)
- Any important setup choices (e.g. "Do not use built-in auth — use a custom users table")
- How tables are created (e.g. manually in the SQL editor, via migrations)

---

## Tables
For each table your app needs, document:
- The table name and what it stores
- Every column: name, data type, constraints (NOT NULL, UNIQUE, DEFAULT)
- Primary key definition
- Foreign key relationships and cascade behavior
- Any check constraints (e.g. valid values for a status column)

List all tables. Do not skip any table that the app requires.

---

## Environment Variables
List every environment variable needed to connect to the database:
- The variable name
- What value it holds
- Where the developer can find that value (e.g. which dashboard page)
- Whether it is required before starting the dev server

---

## Client Initialization
Describe how the database client should be initialized:
- Where the client is created (e.g. a shared lib file)
- Any important pattern to follow (e.g. lazy initialization to avoid crashes when env vars are empty)
- Where DB helper functions should call the client from
- What should NOT be done (e.g. do not initialize at module level)

---

## Helper Functions
List the database helper functions the app needs:
- Function name and purpose
- Parameters it takes
- What it returns
- Which table it operates on

Example format:
- getUser(email) — query users table by email, return the row or null
- createUser(email, passwordHash) — insert new user, return { id }

---

## Edge Cases
Document important constraints and error handling:
- What happens when a duplicate unique value is inserted
- What cascades when a parent record is deleted
- Any uniqueness checks that must happen before insert
- What happens when env vars are missing
