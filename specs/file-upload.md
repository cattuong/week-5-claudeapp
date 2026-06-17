# File Upload Spec

## Feature Name
Document Upload — PDF and DOCX Parsing

## Description
Users upload a PDF or DOCX contract using a paperclip button in the chat composer. Files are parsed entirely in the browser (client-side) — no raw file bytes are sent to the server. The extracted plain text is stored in `DashboardPage` state and sent to the Azure AI Agent with every chat message. A preview of the document is shown in the right panel. The raw file is never persisted server-side.

---

## User Flow

1. User clicks the paperclip icon in the chat composer
2. Hidden `<input type="file">` opens the system file picker
3. Accepted types: `.pdf`, `.docx` (MIME: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
4. User selects a file
5. Client validates: type must be PDF or DOCX; size must be ≤ 20MB
6. If invalid: `alert()` shown, no state change
7. Parsing begins:
   - **PDF**: `pdfjs-dist` extracts text from all pages; blob URL created for preview
   - **DOCX**: `mammoth` extracts raw text
8. `onFileLoaded(text, filename, previewUrl, fileType)` callback fires
9. `DashboardPage` stores all four values in state
10. File chip appears above the composer: `[📎 filename.pdf] [X]`
11. Right panel updates:
    - PDF → iframe showing the blob URL
    - DOCX → scrollable `<pre>` showing first 4000 chars of extracted text
12. When user removes the file (`X` on chip): `onFileLoaded('', '', '', '')` → blob URL revoked → right panel reverts to status view

---

## How Content Reaches the Backend

- **Not** sent as `multipart/form-data` — the raw file is never uploaded
- **Extracted text** sent as a JSON string field `contractText` in `POST /api/chat` request body
- `contractText` can be an empty string if no file was attached (chat still works)
- Max content size: not explicitly truncated in MVP — full document text is sent; Azure context window handles truncation

---

## Parsing Strategy

**Client-side parsing only** — all parsing happens in the browser before the `/api/chat` call.

### PDF — pdfjs-dist v4

- Import: `import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'`
- Worker: `GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'` (public directory)
- Worker file: `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` copied to `public/pdf.worker.min.mjs`
- Flow:
  1. Create blob URL: `URL.createObjectURL(file)` — for iframe preview
  2. Convert file to `ArrayBuffer`: `file.arrayBuffer()`
  3. `getDocument({ data: arrayBuffer }).promise` → `PDFDocumentProxy`
  4. Loop pages 1..`pdf.numPages`:
     - `pdf.getPage(i)` → `page.getTextContent()`
     - Extract `item.str` from each content item, join with space
     - Append newline between pages
  5. Concatenate all page text into one string
- Returns: `{ text, blobUrl }`
- Font-loading warnings in console are harmless — text extraction works regardless
- `next.config.mjs` requires `experimental.serverComponentsExternalPackages: ['pdfjs-dist']`

### DOCX — mammoth

- Import: `import mammoth from 'mammoth'` (dynamic import to avoid SSR issues)
- Flow:
  1. Convert file to `ArrayBuffer`: `file.arrayBuffer()`
  2. `mammoth.extractRawText({ arrayBuffer })` → `{ value: string }`
- Returns: `{ text: result.value, blobUrl: '' }` (no visual preview for DOCX)

---

## Content Preview

### PDF preview
- **Where**: Right panel, fills available height as `<iframe src={blobUrl} className="flex-1 w-full">`
- **Data source**: blob URL created before parsing (passed through `onFileLoaded`)
- **Persistence**: Preview shown while user chats — not cleared on message send
- **Revoke**: `URL.revokeObjectURL(blobUrl)` called when file is removed (chip X button)

### DOCX preview
- **Where**: Right panel, scrollable `<pre>` block
- **Data source**: `docxText` state = `contractText.slice(0, 4000)` (set in `handleFileLoaded` in `DashboardPage`)
- **Truncation notice**: If `contractText.length > 4000`, append `"… (preview truncated at 4,000 characters)"`
- **Style**: `font-mono text-[12px] text-an-fg-subtle leading-relaxed overflow-y-auto`

---

## State Architecture — CRITICAL

**`DashboardPage` owns all file state:**

| State | Type | Description |
|---|---|---|
| `contractText` | `string` | Full extracted text — sent to Azure |
| `filename` | `string` | Displayed in chip, right panel header |
| `previewUrl` | `string` | Blob URL (PDF only); empty for DOCX |
| `fileType` | `string` | MIME type — controls right panel mode |
| `docxText` | `string` | `contractText.slice(0, 4000)` for DOCX text preview |

**`FileUpload` component owns nothing** — it fires a callback and stores no state.

Callback signature:
```ts
onFileLoaded(
  text: string,       // full extracted text
  filename: string,   // display name
  previewUrl: string, // blob URL (PDF) or '' (DOCX)
  fileType: string    // MIME type
): void
```

`DashboardPage.handleFileLoaded` sets all state and also slices `docxText`:
```ts
setDocxText(type.includes('wordprocessingml') ? text.slice(0, 4000) : '')
```

When a new session is selected, all file state is cleared:
```ts
setContractText(''); setFilename(''); setPreviewUrl(''); setFileType(''); setDocxText('')
```
The user must re-attach a file if they re-open a past session.

---

## API Contract

File content is sent via `POST /api/chat`:
```ts
{
  contractText: string,    // full text; empty string if no file attached
  userMessage: string,
  sessionId: string,
}
```

`contractText` is combined with `userMessage` on the server before sending to Azure:
```
Document content:

{contractText}

User question: {userMessage}
```

---

## Validation

| Check | Error message | Where enforced |
|---|---|---|
| File type is not PDF or DOCX | `alert('Only PDF and DOCX files are supported.')` | `FileUpload` onChange |
| File size > 20MB | `alert('File is too large. Maximum size is 20MB.')` | `FileUpload` onChange |
| Parse error (pdfjs or mammoth throws) | Silent fail in MVP (no user-facing error); `onFileLoaded` not called | `FileUpload` onChange catch |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| User removes file (X on chip) | `onFileLoaded('', '', '', '')` called; blob URL revoked; right panel reverts |
| User attaches a second file | Previous blob URL revoked first; new file replaces old in all state |
| PDF with no extractable text (scanned) | pdfjs returns empty strings; `contractText` is `''`; user should be warned (v1.0 enhancement) |
| Protected/encrypted PDF | pdfjs throws; error silently ignored in MVP |
| DOCX with only images | mammoth returns empty string; chat works without context |
| Very large document (>80 pages) | Full text extracted and sent; Azure context window (~100k tokens) is the practical limit |
| User submits without a file | `contractText = ''`; Azure responds from its training data only (no contract context) |
| File input re-opened without selecting | `e.target.value = ''` reset clears the input; no state change |
