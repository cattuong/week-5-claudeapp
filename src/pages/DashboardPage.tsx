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
