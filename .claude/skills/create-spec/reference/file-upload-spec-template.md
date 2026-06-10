# File Upload Spec Template

Use this template to write the file upload spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this feature. Example: "File Upload" or "Document Attachment".

---

## Description
Describe:
- What file types the app accepts
- What happens to the file (parsed to text, stored, previewed, sent to a service)
- Where parsing happens (client-side vs. server-side)
- Whether the raw file or only the extracted content is sent to the backend

---

## User Flow
Document every step the user takes:
- How the upload is triggered (button, drag and drop, paperclip icon)
- What the file picker accepts
- What happens immediately after file selection (parsing, preview, feedback)
- What UI updates to confirm the file is ready
- How the file content is used in the next action (e.g. sent with a message)
- What happens after that action (e.g. file cleared, persisted, available for further use)

---

## How Content Reaches the Backend
Describe precisely how parsed content is transmitted:
- Is it sent as part of a message body, as a separate field, as system-level context?
- What field name is used in the request body
- Any important distinction between user-visible message content and system context

---

## Parsing Libraries
For each supported file type, document:
- The file extension
- The library used to parse it
- The method/API called
- Any setup required before calling the parser (e.g. worker configuration)
- Whether to use dynamic import or static import (note SSR/webpack considerations)

---

## Components
List every component involved in file handling:
- Upload trigger component — what it does, what callback it calls, what state it holds (should be none)
- Preview component — what it shows, how it renders different file types
- Any shared utility file (e.g. lib/parsers.ts) and the functions it exports

---

## Visual Preview
If the app shows a preview of the uploaded file:
- How the preview URL is created (e.g. blob URL from the File object)
- Which component creates it and which displays it
- How different file types are previewed differently (e.g. PDF in iframe, DOCX as text)
- Memory management: when to revoke blob URLs and where that code lives

---

## State Architecture — CRITICAL
Document where file state lives and why:
- Which component owns the file content and filename state (must be a parent, not the input)
- Why it cannot live in the input component (persistence across multiple interactions)
- What the input component does with the file (calls a callback, holds no state)
- What the callback signature is

---

## API Contract
Document how file content is included in API requests:
- The route it is sent to
- The field name and type in the request body
- What value is sent when no file is attached (e.g. empty string)
- Any server-side logging to verify content is arriving

---

## Validation
Document all client-side checks before parsing begins:
- Accepted file types and the error shown for rejected types
- Maximum file size and the error shown when exceeded
- Parse error handling and the message shown to the user

---

## Edge Cases
Cover every file handling edge case:
- User removes the file after attaching
- Parse fails partway through
- File is larger than the backend can process (truncation strategy)
- User sends without attaching a file
- User attaches a second file (replacement behavior)
