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

## Parsing Strategy — Client-side vs Server-side
Choose one approach and document it:

**Client-side parsing** — file parsed in the browser before upload:
- Which library parses which format (e.g. pdfjs-dist for PDF, mammoth for DOCX)
- How the parsed text is stored in component state
- What is sent to the backend (only the extracted text string, not the raw file)

**Server-side parsing** — raw file sent to the API route, parsed there:
- File is sent as `multipart/form-data` via `FormData`
- API route reads the file buffer, calls the parsing library, stores extracted text in the DB
- The parsed text is later fetched separately (e.g. `GET /api/items/:id`) when needed for preview or AI context
- Required: disable any worker/thread setup the library needs for the browser (e.g. `GlobalWorkerOptions.workerSrc = ''` for pdfjs-dist v4)

**Parsing Libraries**
For each supported file type, document:
- The file extension
- The library used to parse it
- The method/API called
- Any setup required (e.g. disabling worker for Node.js environments)
- Whether to use the legacy build (relevant for SSR/webpack compatibility)

---

## Components
List every component involved in file handling:
- Upload trigger component — what it does, what callback it calls, what state it holds (should be none)
- Preview component — what it shows, how it renders different file types
- Any shared utility file (e.g. lib/parse.ts) and the functions it exports

---

## Content Preview
If the app shows a preview of the file content after upload:
- Where the content comes from (component state if client-parsed; API fetch if server-parsed)
- Which component renders the preview and what props it receives
- How different content types are rendered (plain text in `<pre>`, PDF in iframe, etc.)
- When the preview fetch is triggered (in a `useEffect` keyed to the item ID)
- What is shown while the content loads

---

## State Architecture — CRITICAL
Document where file state lives and why:
- Which component owns the file content / filename state (must be a parent, not the input)
- Why it cannot live in the input component (persistence across multiple interactions)
- What the input component does with the file (calls a callback, holds no state)
- What the callback signature is

---

## API Contract
Document how file content is included in API requests:
- The route it is sent to
- The field name and type in the request body (`FormData` for raw file; JSON string for pre-parsed text)
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
