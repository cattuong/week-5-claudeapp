# File Upload Spec Template

Use this template to write the file upload spec for any app after planning.
Replace all guidance text with real content from your app plan.

---

## Feature Name
Name this feature clearly. Example: "File Upload", "Document Attachment", "Media Upload", "Asset Import".

---

## Description
Describe:
- What file types the app accepts
- What happens to the file after upload (stored, parsed, previewed, sent to a service, analyzed)
- Where processing happens (client-side in the browser vs. server-side in an API route)
- Whether the raw file or only extracted/processed content is sent to the backend
- Whether the file persists (stored in object storage, DB) or is session-only (in component state)

---

## User Flow
Document every step the user takes:
- How upload is triggered (button, drag and drop, paperclip icon, paste)
- What the file picker accepts (file extensions, MIME types)
- What happens immediately after file selection (progress indicator, parsing, preview)
- What UI confirms the file is ready (chip, thumbnail, filename label)
- How the file content is used in the next action (sent with a form, attached to a message, etc.)
- How the user removes or replaces the file (dismiss button, re-select)
- What happens after the main action (file cleared, kept for reuse, versioned)

---

## How Content Reaches the Backend
Describe precisely how the file or its content is transmitted:
- Raw file: sent as `multipart/form-data` — document the field name
- Extracted text: sent as a JSON string field — document the field name and max length
- Blob/base64: when used and why
- What value is sent when no file is attached (empty string, null, omit the field)

---

## Parsing Strategy

**Client-side parsing** (file parsed in the browser before upload):
- List each file type and the library used to parse it
- Where parsed content is stored (component state — never persisted unless explicitly needed)
- What is sent to the backend (the extracted content string, not the raw file)

**Server-side parsing** (raw file sent to the API, parsed there):
- File is sent as `multipart/form-data`
- API route reads the buffer, calls the parsing library
- Parsed content stored in the database or returned to the client

**Parsing Libraries**
For each supported file type, document:
- File extension and MIME type
- Library name and import path
- Key method called and its return value
- Any setup required (worker config, external binary, env var, etc.)
- Known gotchas (e.g. worker path, legacy build requirement, SSR incompatibility)

**pdfjs-dist v4 — Browser Setup Note**
If parsing PDFs in the browser with pdfjs-dist v4:
- Copy `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `/public/pdf.worker.min.mjs`
- Set `GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'` (must be a public URL)
- Add `pdfjs-dist` to `serverComponentsExternalPackages` in `next.config.mjs`
- Font-loading warnings in the console are harmless — text extraction works regardless

**pdfjs-dist v4 — Node.js (Server-side) Setup Note**
If parsing PDFs on the server:
- Import from `pdfjs-dist/legacy/build/pdf.mjs`
- Set `workerSrc` to a `file://` path: `'file://' + path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')`

---

## Content Preview

Always spec the preview — if you don't specify it here, it won't be built.

For each file type the app accepts, document:
- How the preview is rendered (iframe, canvas, img tag, pre tag, custom component)
- Where the preview data comes from (blob URL, extracted text, server-rendered URL)
- Where the preview is displayed (right panel, modal, inline below upload button, etc.)

**PDF preview**
- Create a blob URL before parsing: `URL.createObjectURL(file)`
- Pass the blob URL through the callback alongside the extracted text
- For a simple inline preview: render in an `<iframe src={blobUrl}>`
- For a full interactive viewer (page navigation, zoom): build a dedicated PDFViewer component
  - PDFViewer uses `pdfjs-dist` to render each page to a `<canvas>` element
  - Controls: previous/next page, page number input, zoom in/out, fit-to-width, download
  - Zoom: steps of 25%, range 50–300%
  - State the component owns: `currentPage`, `totalPages`, `zoom`, `isRendering`
  - Props it receives: `blobUrl`, `filename`
- Revoke the blob URL when the file is removed: `URL.revokeObjectURL(blobUrl)`

**Image preview**
- Create blob URL: `URL.createObjectURL(file)`
- Render: `<img src={blobUrl} alt={filename} />`
- Revoke on removal

**Text / CSV / JSON preview**
- Read with `FileReader.readAsText(file)`
- Render in a scrollable `<pre>` with monospace font
- Truncate at a reasonable character limit (e.g. 4000 chars) with "… (preview truncated)" appended

**Document (DOCX, etc.) preview**
- Extract text client-side (e.g. mammoth for DOCX)
- Render extracted text in a scrollable `<pre>` with monospace font
- Truncate at 4000 chars with truncation notice

**Where the preview lives in the layout**
- Describe which panel or section displays the preview
- How much space it occupies (fixed height, percentage, flex)
- Whether it persists while the user takes other actions (e.g. while chatting, filling a form)

---

## State Architecture — CRITICAL

Document where file state lives and why it must live there:
- Which component OWNS the file content, filename, preview URL, and file type (must be a parent)
- Why it cannot live inside the file input component (other parts of the UI need the content)
- What the file input component does with the file (calls a callback, holds no state)

**Callback signature** — document it fully:
```
onFileLoaded(text, filename, previewUrl, fileType)
```
- `text` — extracted content sent to the backend
- `filename` — displayed in the UI chip and preview header
- `previewUrl` — blob URL for previewable types; empty string otherwise
- `fileType` — MIME type, used to choose the right preview renderer

The parent component owns all four values and passes a structured preview object to the preview component.

---

## API Contract
- Route the file content is sent to
- Field name and type in the request body
- Max content size sent (truncation point if needed)
- Behavior when no file is attached (what value is sent)

---

## Validation
Document all checks before processing begins:
- Accepted file types — error message for rejected types
- Maximum file size — error message when exceeded
- Parse failure — what the user sees, whether it blocks other actions

---

## Edge Cases
Cover every file handling edge case:
- User removes the file after attaching (revoke blob URL, clear all file state)
- Parse fails mid-way (show error, do not block other app functionality)
- File content exceeds the backend's processing limit (truncate with a documented cutoff)
- User attaches a second file (replace the previous one, revoke the old blob URL first)
- User submits without attaching a file (send without file content — document expected behavior)
- File with no extractable content (empty PDF, protected document) — what is shown
