# Feedback Spec Template

Use this template to write the user feedback spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this feature. Example: "Response Feedback" or "Rating System".

---

## Description
Describe:
- What users are rating (a specific response, a session, a product, etc.)
- When the feedback UI appears (after an event, always visible, on demand)
- What feedback consists of (star rating, thumbs, numeric scale, comment, tags)
- Where it is stored and how it is linked to the rated item

---

## User Flow
Document every step:
- What event triggers the feedback UI to appear
- Where on screen it appears (floating, inline, modal)
- What the user can submit (rating scale, optional comment, etc.)
- What happens on submit (confirmation message, auto-dismiss timing)
- How the user can dismiss without submitting
- What automatically closes the feedback UI (e.g. user takes a new action)

---

## Placement
Describe the exact position and visual style:
- Position type (fixed, absolute, inline)
- Location on screen (bottom-right, below content, centered)
- Z-index if floating
- Dimensions (width, max-height)
- Card style (border radius, shadow, background, border)

---

## DB Schema
Document the feedback table with every column:
- Primary key: type and default generation
- User reference: column name, type, foreign key to users table, behavior on user delete
- Session reference (if applicable): column name, type, foreign key, behavior on session delete
- Rated item reference: column name, type, foreign key to the specific item being rated (e.g. message, post, product), behavior on delete
- Rating: column name, type, any check constraint (e.g. value must be between 1 and 5)
- Comment: column name, type, whether it is nullable
- Timestamps: created_at with default

Also document:
- Which columns have a UNIQUE constraint or combined unique index (e.g. one feedback row per user per item)
- Any CHECK constraints on the rating column
- Whether the table uses cascade deletes when a parent record is removed

---

## DB Tasks — What to Create
List every database task that must be completed before this feature works:
- The SQL statement to create the feedback table (with all constraints)
- Any index to create for query performance (e.g. index on session_id or user_id)
- Any unique constraint to enforce one feedback per item per user
- Where to run these statements (e.g. Supabase SQL editor, migration file)

---

## DB Helper Functions
Document the database functions needed for feedback:
- Function name and what it does
- Parameters it accepts
- What it returns
- Which table it queries or writes to
- Any conflict/duplicate check it must perform before inserting

Examples of what to document:
- createFeedback(userId, sessionId, itemId, rating, comment) — insert into feedback table, return the new row id
- getFeedback(itemId, userId) — check if feedback already exists for this item/user, return the row or null
- [Add any other helper your app needs]

---

## API Routes
Document the feedback endpoint:
- Method and path
- Every field in the request body
- Success response
- Any conflict handling (e.g. duplicate feedback for the same item)

---

## State Management
Document where feedback state lives and how it is managed:
- Which component owns the "which item is being rated" state
- When that state is set (after which event)
- When that state is cleared (on dismiss, on new action)
- How the feedback component is conditionally rendered
- What the onDismiss callback does

---

## Component
Document the FeedbackForm component:
- Every prop it receives
- Behavior on successful submit (confirmation display, auto-dismiss timing)
- Behavior of the submit button (enabled vs. disabled states)
- What the parent component does NOT need to know about (keep it encapsulated)

---

## Design
Describe the visual design of the feedback panel:
- Header content and layout
- Rating control appearance (active vs. inactive states)
- Comment input style
- Submit button states (enabled, disabled)
- Confirmation message appearance

---

## Edge Cases
Cover every failure or edge case:
- User dismisses without submitting
- User submits duplicate feedback for the same item
- A new action closes the panel before the user submits
- Session or item changes while the panel is open
