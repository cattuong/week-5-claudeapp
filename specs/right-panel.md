# Right Panel Spec

## Feature Name
Right Panel — Document Preview & Execution Steps

## Description
The right panel (304px fixed width, `bg-an-bg-subtle`) occupies the rightmost column of the three-panel chat layout. It has three display modes depending on the current state: status checklist (no file, idle), document preview (file loaded), and execution steps (AI request in-flight). During a request, execution steps override all other content. After the request completes, the panel reverts to the document preview (or checklist if no file is loaded).

---

## Panel Modes

### Mode A: No file loaded, idle
Content:
- Status checklist: 5 steps showing app readiness
  1. Log in
  2. Connect Microsoft account
  3. Start a new chat
  4. Upload a document
  5. Ask a question
- Steps are checked (`CheckCircle2` in success color) or unchecked (`Circle` in muted)
- Checked conditions:
  1. Always checked (user is logged in to see dashboard)
  2. `isConnected === true` (azure_token cookie present)
  3. `activeSessionId !== null`
  4. `filename !== ''`
  5. `messages.length > 0` (to be determined — simplified as always false in MVP)
- "Connect Microsoft account" button shown if `!isConnected`

### Mode B: PDF loaded, idle
Content:
- Header: filename + "PDF preview" sub-label
- Body: `<iframe src={previewUrl} className="flex-1 w-full">` fills remaining height
- Bottom section: execution steps panel (collapsed/hidden when `executionSteps.length === 0`)

### Mode C: DOCX loaded, idle
Content:
- Header: filename + "DOCX preview" sub-label
- Body: scrollable `<pre>` showing `docxText` (first 4000 chars)
- Truncation notice below if `docxText` was cut: "… (preview truncated at 4,000 characters)"
- Style: `font-mono text-[12px] text-an-fg-subtle leading-relaxed p-4 overflow-y-auto`
- Bottom section: execution steps panel (collapsed when empty)

### Mode D: Request in-flight (overrides everything)
Content:
- Full panel shows execution steps only
- Steps animate as the request progresses
- Override condition: `executionSteps.length > 0`

---

## Execution Steps

### Step type:
```ts
type StepStatus = 'pending' | 'active' | 'done' | 'error'
type ExecutionStep = { label: string; status: StepStatus }
```

### Steps (in order):
1. Parsing document
2. Sending to Azure
3. Waiting for response
4. Processing result
5. Completed

### Icon mapping (Lucide, 14px, strokeWidth 1.5):
| Status | Icon | Color |
|---|---|---|
| `pending` | `Circle` | `text-an-fg-muted` |
| `active` | `Loader2` | `text-an-accent`, `animate-spin` |
| `done` | `CheckCircle2` | `text-[var(--an-success)]` |
| `error` | `XCircle` | `text-[var(--an-error)]` |

### Layout of steps section:
```
Section heading: "Processing steps"  (text-[11px] uppercase tracking-wide fg-muted)
For each step:
  [Icon 14px]  [Label 13px]          [Loader2 if active, right-aligned]
```

Steps section only renders when `executionSteps.length > 0`.

### Step progression (driven by `DashboardPage.handleSend()`):

| Moment | Step states |
|---|---|
| On send | Step 1: done (parsing already complete), Step 2: active, Steps 3–5: pending |
| After fetch begins | Step 2: done, Step 3: active |
| After response received | Steps 3–4: done, Step 4: active |
| After message saved | All steps: done |
| On error | Last active step: error |
| After completion | `setExecutionSteps([])` — panel reverts to preview/checklist |

---

## Component: `components/RightPanel.tsx`

**Props:**
```ts
{
  previewUrl: string          // blob URL for PDF; empty string otherwise
  filename: string            // shown in panel header
  fileType: string            // MIME type — controls preview mode
  docxText: string            // first 4000 chars of DOCX for text preview
  isConnected: boolean        // controls step 2 of status checklist
  executionSteps: ExecutionStep[]   // empty array = no active request
}
```

**Mode selection logic:**
```ts
const isRequestInFlight = executionSteps.length > 0
const isPdf = fileType === 'application/pdf' && previewUrl
const isDocx = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

if (isRequestInFlight) → Mode D (execution steps full-panel)
else if (isPdf)        → Mode B (PDF iframe)
else if (isDocx)       → Mode C (DOCX text)
else                   → Mode A (status checklist)
```

---

## Design

- Width: 304px fixed, `flex-shrink-0`
- Background: `bg-an-bg-subtle`
- Border: `border-l border-an-border`
- Header area: `p-4 border-b border-an-border`
  - Filename: `text-[12px] font-medium text-an-fg-base truncate`
  - Sub-label: `text-[11px] text-an-fg-muted`
- Steps section: `p-4 border-t border-an-border` (pinned to bottom or after preview)
- Connect button: `h-9 flex items-center justify-center rounded-md border border-an-border text-[13px] text-an-fg-base hover:bg-an-bg-surface`
- Loaded document chip: `bg-an-bg-surface rounded-lg p-3 border border-an-border`

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| File removed while steps are active | Steps remain until request completes (steps take priority) |
| New chat started | `executionSteps` cleared, `filename` cleared → reverts to status checklist |
| PDF iframe fails to load | iframe blank; no error message in MVP |
| DOCX text is empty (no extractable text) | `<pre>` shows "(No text extracted from document)" |
| `executionSteps` cleared before all steps are `done` | Panel immediately reverts to preview mode |
| User is not connected and sends anyway | `/api/chat` returns 401; step 2 or 3 is set to `error` |
