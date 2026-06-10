# File Upload — Contract Document Attachment

## Description

Users can attach a PDF or DOCX contract to any chat session. The file is parsed entirely client-side — the raw file is never sent to the server. The extracted plain text is stored in `app/dashboard/page.tsx` state and included in every subsequent `/api/chat` request. A preview of the document is shown in the right panel.

---

## User Flow

1. User clicks the paperclip (`Paperclip`) icon button in the composer area
2. A hidden `<input type="file" accept=".pdf,.docx">` is triggered via `.click()`
3. User selects a file in the OS picker
4. `parseFile(file)` is called — parsing runs in the browser
5. On success:
   - Filename chip appears above the composer: e.g. "contract.pdf ×"
   - Right panel updates with document preview
   - `contractText` stored in dashboard state
6. User types a question and sends — `contractText` is included in the POST `/api/chat` body
7. Contract persists for the entire page session (not cleared on session switch)
8. User can dismiss the chip (×) to clear `contractText` and `contractPreview`
9. User can attach a second file — replaces the existing one

---

## How Content Reaches the Backend

- `contractText` is sent as a plain JSON string field in the POST `/api/chat` body
- Field name: `contractText`
- When no file is attached: `contractText = ''` (empty string)
- The user's actual question is sent as `userMessage`
- The raw file bytes are never sent to any server

---

## Parsing Strategy — Client-side

Parsing runs in the browser using two libraries already in `package.json`.

### `lib/parse-file.ts`

```ts
export async function parseFile(file: File): Promise<string>
```

**PDF (`.pdf`):**
- Library: `pdfjs-dist`
- Import: `import * as pdfjsLib from 'pdfjs-dist'`
- Set worker: `pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()`
- Call: `pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise`
- Iterate all pages: `pdf.getPage(i)` → `page.getTextContent()` → join `item.str` with spaces
- Return joined text from all pages

**DOCX (`.docx`):**
- Library: `mammoth`
- Import: `import mammoth from 'mammoth'`
- Call: `mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })`
- Return `result.value`

**Unsupported type:**
- Throw `new Error('Only .pdf and .docx files are supported')`

**pdfjs-dist in the browser (client-side):**
Unlike the server-side worker issue, in the browser the worker URL can be set via `import.meta.url`. Always use the bundled `pdf.worker.mjs` from the pdfjs-dist package. Do NOT attempt to set `workerSrc` to an empty string.

---

## Components

### `ChatArea` (`components/ChatArea.tsx`)
- Owns the `<input type="file">` ref (no state — just the DOM element)
- On file selected: calls `parseFile(file)`, then calls `onFileLoaded(text, file.name, previewUrl, file.type)`
- Creates blob URL before parsing: `const previewUrl = URL.createObjectURL(file)` (for PDF preview in right panel)
- Renders the filename chip when `contractFileName` is non-empty

### `RightPanel` (`components/RightPanel.tsx`)
- Receives `contractPreview: { url, type, filename } | null` and `contractText?: string`
- Renders `<iframe>` for PDF, `<pre>` for DOCX

### `lib/parse-file.ts`
- Exports: `parseFile(file: File): Promise<string>`

---

## Content Preview

### PDF preview
- Create blob URL on the client BEFORE parsing: `URL.createObjectURL(file)`
- Pass the URL up via callback as `previewUrl`
- Right panel renders: `<iframe src={previewUrl} className="w-full h-56 rounded-md border border-an-border" />`
- Revoke on error: `URL.revokeObjectURL(previewUrl)`

### DOCX preview
- No blob URL — show extracted `contractText` in right panel
- Render: `<pre className="font-mono text-mono text-an-fg-subtle overflow-y-auto max-h-56 whitespace-pre-wrap">`
- Truncate at 4000 characters with `\n… (preview truncated)`

### Right panel layout
- When file loaded: document preview section ~224px height (h-56), execution steps below
- When no file: execution steps fill full panel

---

## State Architecture — CRITICAL

- `contractText: string` — owned by `app/dashboard/page.tsx`
- `contractFileName: string` — owned by `app/dashboard/page.tsx`
- `contractPreview: { url: string; type: string; filename: string } | null` — owned by `app/dashboard/page.tsx`

`ChatArea` holds NO file state. It calls `onFileLoaded` and lets the parent own everything.

**Callback signature (must include all four values):**
```ts
onFileLoaded: (text: string, filename: string, previewUrl: string, fileType: string) => void
```

- `text` → stored as `contractText` in dashboard state
- `filename` → stored as `contractFileName` (shown in chip)
- `previewUrl` → `URL.createObjectURL(file)` for PDF, `''` for DOCX
- `fileType` → `file.type` (`'application/pdf'` or DOCX MIME) — used to branch rendering in right panel

---

## API Contract

File content is sent to `/api/chat` as a JSON string field:

```json
{
  "contractText": "AGREEMENT dated June 10 2026...",
  "userMessage": "What are the termination clauses?",
  "sessionId": "abc-123"
}
```

When no file: `"contractText": ""`. The API route handles empty string gracefully.

---

## Validation

| Check | Where | Error shown |
|---|---|---|
| File type not `.pdf` or `.docx` | Client, before calling `parseFile` | "Only PDF and DOCX files are supported" below the chip area |
| File too large (>10MB) | Client, before calling `parseFile` | "File is too large. Maximum size is 10MB." |
| Parse error | Client, inside `parseFile` catch block | "Could not read this file. Try a different PDF or DOCX." |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| User attaches a second file | Replaces `contractText`, `contractFileName`, `contractPreview`; old blob URL revoked |
| User dismisses the chip (×) | Set `contractText = ''`, `contractFileName = ''`, `contractPreview = null`; revoke old blob URL |
| Parse fails mid-way (corrupt PDF) | Catch error in ChatArea, show error inline, do not update state |
| File is 0 bytes | pdfjs/mammoth will error; caught and shown as parse error |
| User sends without attaching | `contractText = ''` sent — Azure agent answers from question alone |
| Session switches while file loaded | Contract persists — file chip stays visible, contractText remains in state |
