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

**Parsing Libraries**
For each supported file type, document:
- The file extension
- The library used to parse it
- The method/API called
- Any setup required (e.g. worker configuration for Node.js environments)
- Whether to use the legacy build (relevant for SSR/webpack compatibility)

**pdfjs-dist v4 — Node.js Worker Setup (CRITICAL)**

`GlobalWorkerOptions.workerSrc = ''` does NOT work in pdfjs-dist v4. Setting it to an empty string causes:
`Error: Setting up fake worker failed: "No 'GlobalWorkerOptions.workerSrc' specified."`

The correct fix — point `workerSrc` to the bundled worker file on disk:

```ts
// In your Next.js API route (server-side only)
const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
const workerPath = require('path').join(
  process.cwd(),
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'file://' + workerPath
const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise
```

Rules:
- Always import from `pdfjs-dist/legacy/build/pdf.mjs` (not the main entry) — pdfjs explicitly recommends the legacy build for Node.js
- Always set `workerSrc` to a `file://` absolute path using `process.cwd()` + the worker file path
- Add `pdfjs-dist` to `serverExternalPackages` in `next.config.mjs` so it runs as native Node.js, not bundled by webpack:
  ```js
  // next.config.mjs
  const nextConfig = { serverExternalPackages: ['pdfjs-dist'] }
  ```
- Font-loading warnings (`Unable to load font data`) are harmless — they affect visual rendering only, not text extraction (`getTextContent()` works correctly regardless)

---

## Components
List every component involved in file handling:
- Upload trigger component — what it does, what callback it calls, what state it holds (should be none)
- Preview component — what it shows, how it renders different file types
- Any shared utility file (e.g. lib/parse.ts) and the functions it exports

---

## Content Preview — CRITICAL
Always spec the preview — if you don't specify it, it won't be built.

**PDF preview**
- Create a blob URL on the client before sending the file to the parse API: `URL.createObjectURL(file)`
- Pass the URL up through the callback as `previewUrl`
- Render the PDF in an `<iframe src={previewUrl}>` inside the right panel
- Revoke the URL on error to avoid memory leaks: `URL.revokeObjectURL(previewUrl)`

**DOCX preview**
- No blob URL needed — show the extracted `contractText` in a scrollable `<pre>` tag
- Use monospace font, `whitespace-pre-wrap`, truncate at ~4000 characters with "… (preview truncated)"

**Where to render**
- The preview lives in the right panel, above the Activity section
- Right panel layout (when file loaded): `55%` height for preview, rest for Activity
- Right panel layout (no file): Activity fills 100%

**State flow** — the callback signature MUST include the preview data:
```ts
onFileLoaded: (text: string, filename: string, previewUrl: string, fileType: string) => void
```
- `text` — extracted contract text (sent to AI)
- `filename` — displayed in the file chip and preview header
- `previewUrl` — blob URL for PDF (`URL.createObjectURL(file)`), empty string for DOCX
- `fileType` — `application/pdf` or DOCX MIME type (used to branch PDF vs text rendering)

The dashboard page owns all four values as separate `useState` calls and passes a `contractPreview` object to the right panel.

---

## State Architecture — CRITICAL
Document where file state lives and why:
- Which component owns the file content / filename state (must be a parent, not the input)
- Why it cannot live in the input component (persistence across multiple interactions)
- What the input component does with the file (calls a callback, holds no state)
- The callback signature must include `previewUrl` and `fileType` — not just `text` and `filename`
- The right panel receives `contractPreview: { url, type, filename } | null` and `contractText` as separate props

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
