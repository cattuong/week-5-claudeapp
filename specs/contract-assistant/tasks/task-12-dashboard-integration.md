# Task 12: Dashboard Integration

## Status

pending

## Wave

4

## Description

Wire together all the contexts, components, and routing built in previous waves into a fully functional dashboard. This task adds the `SessionProvider` and `ChatProvider` to the app, updates `DashboardPage` to render `ChatWorkspace` for the active session (or an empty state), and handles contract file upload — parsing the file client-side and persisting the text to the session via the API. After this task, the complete app flow works except for live Azure AI responses (which use the stub from task-06 until task-13 is complete).

## Dependencies

**Depends on:** task-05-app-routing-shell, task-09-auth-pages, task-10-session-context, task-11-chat-components
**Blocks:** None (Wave 4, runs in parallel with task-13)

**Context from dependencies:**
- task-05 created `src/components/layout/AppShell.tsx` (two-column layout with sidebar slot + main area), `src/components/layout/TopBar.tsx`, and `src/pages/DashboardPage.tsx` (skeleton that renders AppShell with placeholder text).
- task-09 wired `AuthProvider` into `App.tsx` around the router. The `/` route renders `<ProtectedRoute><DashboardPage /></ProtectedRoute>`.
- task-10 created `SessionProvider` (from `src/store/SessionContext.tsx`) and `useSessionContext` hook. `SessionProvider` requires `AuthProvider` as an ancestor (it calls `useAuthContext` internally). It exposes `{ sessions, activeSession, createSession, selectSession, updateSession }`.
- task-10 also rewrote `src/components/layout/Sidebar.tsx` with the real session list — it already imports `useSessionContext` and `useAuthContext` directly.
- task-11 created `ChatProvider` (from `src/store/ChatContext.tsx`), `ChatWorkspace` component, and `ContractUploadBanner`. `ChatWorkspace` expects `{ session, onAttachContract, contractFileName }` props.
- task-07 created `src/utils/contractParser.ts` which exports `parseContract(file: File): Promise<string>` and `ContractParseError`.

## Files to Modify

- `src/pages/DashboardPage.tsx` — add providers, wire session selection, handle contract upload, render ChatWorkspace or EmptyState
- `src/components/layout/AppShell.tsx` — pass the real Sidebar (already the default) and accept children for the main pane

## Technical Details

### Implementation Steps

1. Rewrite `src/pages/DashboardPage.tsx`:

```tsx
import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { SessionProvider, useSessionContext } from '../store/SessionContext'
import { ChatProvider } from '../store/ChatContext'
import ChatWorkspace from '../components/chat/ChatWorkspace'
import { parseContract, ContractParseError } from '../utils/contractParser'

function EmptyState() {
  const { createSession } = useSessionContext()
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-6"
      style={{ color: 'var(--text-muted)' }}
    >
      <div style={{ textAlign: 'center' }}>
        <p className="lg-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
          Contract Assistant
        </p>
        <h2 className="lg-h2" style={{ marginBottom: 'var(--space-3)' }}>
          Start a new conversation
        </h2>
        <p className="lg-lead" style={{ marginBottom: 'var(--space-6)' }}>
          Create a chat session, upload a contract, and ask anything.
        </p>
        <button
          onClick={createSession}
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--brand-primary)',
            color: 'var(--text-on-primary)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          New chat
        </button>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { activeSession, updateSession } = useSessionContext()
  const [contractFileName, setContractFileName] = useState<string | undefined>()
  const [parseError, setParseError] = useState<string | null>(null)

  const handleAttachContract = async (file: File) => {
    setParseError(null)
    try {
      const text = await parseContract(file)
      if (!activeSession) return
      await updateSession(activeSession.id, { contract_text: text })
      setContractFileName(file.name)
      // Auto-title the session with the filename if it's still "New chat"
      if (activeSession.title === 'New chat') {
        const name = file.name.replace(/\.[^/.]+$/, '')
        await updateSession(activeSession.id, { title: name })
      }
    } catch (err) {
      if (err instanceof ContractParseError) {
        setParseError(err.message)
      } else {
        setParseError('Failed to parse the contract. Please try again.')
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {parseError && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-6)',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-fg)',
            borderBottom: '1px solid var(--danger-border)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {parseError}
        </div>
      )}
      {activeSession ? (
        <ChatWorkspace
          session={activeSession}
          onAttachContract={handleAttachContract}
          contractFileName={contractFileName}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <ChatProvider>
        <AppShell>
          <DashboardContent />
        </AppShell>
      </ChatProvider>
    </SessionProvider>
  )
}
```

2. `src/components/layout/AppShell.tsx` — verify it accepts a `children` prop and renders the main area. The default export of `Sidebar` is already imported. The file from task-05 should already be correct; if not, ensure the structure is:
```tsx
import Sidebar from './Sidebar'
// ...
<aside ...>
  <Sidebar />    {/* Sidebar reads from SessionContext which is provided by DashboardPage */}
</aside>
<main className="flex-1 flex flex-col h-full overflow-hidden">
  {children}
</main>
```

Note: `Sidebar` (task-10) uses `useSessionContext` — this works because `SessionProvider` is a parent in `DashboardPage`. The provider tree is:
```
DashboardPage
  └── SessionProvider
        └── ChatProvider
              └── AppShell
                    ├── Sidebar (reads SessionContext ✓)
                    └── DashboardContent (reads SessionContext + ChatContext ✓)
```

## Acceptance Criteria

- [ ] Landing on `/` (authenticated) shows the empty state with "New chat" button
- [ ] Clicking "New chat" in the sidebar OR in the empty state creates a session and renders `ChatWorkspace`
- [ ] `ChatWorkspace` shows `ContractUploadBanner` when no contract is attached
- [ ] Selecting a PDF or TXT file parses it client-side and updates the session's `contract_text`
- [ ] After upload, the banner disappears and `ContractStatusChip` shows "Contract attached"
- [ ] The session title auto-updates to the filename (without extension) if it was still "New chat"
- [ ] A parse error shows a red banner above the workspace
- [ ] Clicking a previous session in the sidebar loads that session's messages in the chat pane
- [ ] Refreshing the page preserves the session list (loaded from Supabase) but resets the active session to none (by design — auto-select last session is a future enhancement)
- [ ] `npx tsc --noEmit` passes

## Notes

- `DashboardContent` is a separate inner component (not `DashboardPage` itself) so it can use `useSessionContext` which requires `SessionProvider` to be an ancestor. If you put the hook call directly in `DashboardPage`, React will throw because the provider isn't mounted yet.
- `contractFileName` is stored in local component state (not in Supabase) because it's only needed for display and the filename is not required server-side.
