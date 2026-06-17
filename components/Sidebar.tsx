'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, LogOut, Search, Pin, PinOff, Pencil, Trash2, Loader2, MessageSquare, CheckCircle, AlertCircle, Home } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

type Session = {
  id: string
  title: string
  status: string
  pinned: boolean
  updated_at: string
}

type Props = {
  sessions: Session[]
  activeSessionId: string | null
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onGoHome: () => void
  onLogout: () => void
  onRenameSession: (id: string, title: string) => void
  onPinSession: (id: string, pinned: boolean) => void
  onDeleteSession: (id: string) => void
  userId: string
}

type FilterType = 'all' | 'pinned' | 'recent' | 'processing' | 'completed' | 'error'
const FILTERS: FilterType[] = ['all', 'pinned', 'recent', 'processing', 'completed', 'error']

function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return d.toLocaleDateString()
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'processing') return <Loader2 size={14} strokeWidth={1.5} className="flex-shrink-0 animate-spin text-an-accent" />
  if (status === 'completed') return <CheckCircle size={14} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--an-success)' }} />
  if (status === 'error') return <AlertCircle size={14} strokeWidth={1.5} className="flex-shrink-0" style={{ color: 'var(--an-error)' }} />
  return <MessageSquare size={14} strokeWidth={1.5} className="flex-shrink-0 text-an-fg-muted" />
}

function RenameInput({ value, onCommit, onCancel }: { value: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])

  function commit() {
    const trimmed = val.trim()
    if (trimmed) onCommit(trimmed)
    else onCancel()
  }

  return (
    <input
      ref={ref}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); commit() }
        if (e.key === 'Escape') { e.preventDefault(); onCancel() }
      }}
      className="flex-1 min-w-0 bg-an-bg-elevated border border-an-border-strong rounded px-2 h-6 text-[12px] text-an-fg-base outline-none"
      onClick={e => e.stopPropagation()}
    />
  )
}

export default function Sidebar({
  sessions, activeSessionId, onNewChat, onSelectSession, onGoHome,
  onLogout, onRenameSession, onPinSession, onDeleteSession, userId,
}: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hoveringId, setHoveringId] = useState<string | null>(null)

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const filtered = sessions
    .filter(s => {
      if (filter === 'pinned') return s.pinned
      if (filter === 'recent') return new Date(s.updated_at).getTime() > oneWeekAgo
      if (filter === 'processing') return s.status === 'processing'
      if (filter === 'completed') return s.status === 'completed'
      if (filter === 'error') return s.status === 'error'
      return true
    })
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.updated_at.localeCompare(a.updated_at)
    })

  const pinned = filtered.filter(s => s.pinned)
  const unpinned = filtered.filter(s => !s.pinned)

  return (
    <>
      <aside className="w-64 flex-shrink-0 bg-an-bg-subtle border-r border-an-border flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-an-border flex items-center justify-between">
          <button onClick={onGoHome} className="font-display text-[18px] font-medium text-an-fg-base hover:text-an-accent transition duration-100">
            Document AI
          </button>
          <button onClick={onGoHome} className="text-an-fg-muted hover:text-an-fg-base transition duration-100" title="Home">
            <Home size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3">
          <button
            onClick={onNewChat}
            className="w-full h-9 flex items-center gap-2 px-3 rounded-md bg-an-accent hover:bg-an-accent-hover text-white text-[13px] font-medium transition duration-150"
          >
            <Plus size={14} strokeWidth={1.5} />
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-2">
          <div className="relative">
            <Search size={12} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-an-fg-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full h-8 pl-7 pr-3 rounded-md bg-an-bg-surface border border-an-border text-[12px] text-an-fg-base placeholder:text-an-fg-muted focus:border-an-border-strong focus:outline-none transition duration-150"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-3 pt-2 flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`h-6 px-2 rounded text-[11px] font-medium whitespace-nowrap transition duration-100 ${
                filter === tab
                  ? 'bg-an-accent text-white'
                  : 'bg-an-bg-surface text-an-fg-subtle hover:text-an-fg-base'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
          {filtered.length === 0 && (
            <p className="text-[12px] text-an-fg-muted px-3 py-4 text-center">No conversations</p>
          )}

          {pinned.length > 0 && (
            <>
              <p className="text-[10px] uppercase tracking-wide text-an-fg-muted px-2 pt-1 pb-0.5">Pinned</p>
              {pinned.map(session => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  isHovering={hoveringId === session.id}
                  isRenaming={renamingId === session.id}
                  onSelect={() => onSelectSession(session.id)}
                  onHoverEnter={() => setHoveringId(session.id)}
                  onHoverLeave={() => setHoveringId(null)}
                  onStartRename={() => { setRenamingId(session.id) }}
                  onCommitRename={title => { onRenameSession(session.id, title); setRenamingId(null) }}
                  onCancelRename={() => setRenamingId(null)}
                  onPin={() => onPinSession(session.id, !session.pinned)}
                  onDelete={() => setDeletingId(session.id)}
                />
              ))}
              {unpinned.length > 0 && <div className="border-t border-an-border my-1" />}
            </>
          )}

          {unpinned.map(session => (
            <SessionRow
              key={session.id}
              session={session}
              isActive={activeSessionId === session.id}
              isHovering={hoveringId === session.id}
              isRenaming={renamingId === session.id}
              onSelect={() => onSelectSession(session.id)}
              onHoverEnter={() => setHoveringId(session.id)}
              onHoverLeave={() => setHoveringId(null)}
              onStartRename={() => setRenamingId(session.id)}
              onCommitRename={title => { onRenameSession(session.id, title); setRenamingId(null) }}
              onCancelRename={() => setRenamingId(null)}
              onPin={() => onPinSession(session.id, !session.pinned)}
              onDelete={() => setDeletingId(session.id)}
            />
          ))}
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-an-border flex items-center justify-between">
          <span className="text-[12px] text-an-fg-subtle truncate max-w-[160px]">{userId.slice(0, 8)}…</span>
          <button onClick={onLogout} className="text-an-fg-muted hover:text-an-fg-base transition duration-100" title="Log out">
            <LogOut size={14} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {deletingId && (
        <ConfirmDialog
          title="Delete this conversation?"
          message="This cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => { onDeleteSession(deletingId); setDeletingId(null) }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  )
}

type RowProps = {
  session: Session
  isActive: boolean
  isHovering: boolean
  isRenaming: boolean
  onSelect: () => void
  onHoverEnter: () => void
  onHoverLeave: () => void
  onStartRename: () => void
  onCommitRename: (title: string) => void
  onCancelRename: () => void
  onPin: () => void
  onDelete: () => void
}

function SessionRow({
  session, isActive, isHovering, isRenaming,
  onSelect, onHoverEnter, onHoverLeave,
  onStartRename, onCommitRename, onCancelRename, onPin, onDelete,
}: RowProps) {
  return (
    <div
      className={`group relative flex items-center gap-2 h-9 px-2 rounded-md cursor-pointer transition duration-100 ${
        isActive ? 'bg-an-bg-elevated text-an-fg-base' : 'text-an-fg-subtle hover:bg-an-bg-surface hover:text-an-fg-base'
      }`}
      onClick={onSelect}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <StatusIcon status={session.status} />

      {isRenaming ? (
        <RenameInput value={session.title} onCommit={onCommitRename} onCancel={onCancelRename} />
      ) : (
        <span className="flex-1 min-w-0 text-[13px] truncate">{session.title}</span>
      )}

      {!isRenaming && (
        <>
          {isHovering ? (
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={onPin} className="p-0.5 text-an-fg-muted hover:text-an-fg-base transition duration-100" title={session.pinned ? 'Unpin' : 'Pin'}>
                {session.pinned ? <PinOff size={12} strokeWidth={1.5} /> : <Pin size={12} strokeWidth={1.5} />}
              </button>
              <button onClick={onStartRename} className="p-0.5 text-an-fg-muted hover:text-an-fg-base transition duration-100" title="Rename">
                <Pencil size={12} strokeWidth={1.5} />
              </button>
              <button onClick={onDelete} className="p-0.5 text-an-fg-muted hover:text-an-fg-base transition duration-100" title="Delete">
                <Trash2 size={12} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-an-fg-muted flex-shrink-0">{formatDate(session.updated_at)}</span>
          )}
        </>
      )}
    </div>
  )
}
