type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string }

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const hhmm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const diff = Date.now() - d.getTime()
  if (diff > 24 * 60 * 60 * 1000) {
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${hhmm}`
  }
  return hhmm
}

export default function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div
            className="px-4 py-3 text-[14px] text-an-fg-base leading-relaxed"
            style={{
              background: 'var(--an-accent-subtle)',
              border: '1px solid rgba(217,119,87,0.20)',
              borderRadius: '12px 12px 4px 12px',
            }}
          >
            {message.content}
          </div>
          <p className="text-[11px] text-an-fg-muted text-right mt-1">{formatTimestamp(message.created_at)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 rounded-full bg-an-accent flex-shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-an-fg-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className="text-[11px] text-an-fg-muted mt-1">{formatTimestamp(message.created_at)}</p>
      </div>
    </div>
  )
}
