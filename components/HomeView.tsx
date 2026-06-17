'use client'

import { Plus, MessageSquare, Send, Star, CheckCircle, AlertCircle } from 'lucide-react'
import KpiCard from './KpiCard'

type KpiData = {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  errorSessions: number
  pinnedSessions: number
  totalMessages: number
  userMessages: number
  assistantMessages: number
  avgMessagesPerSession: number
  avgFeedbackRating: number | null
  feedbackCount: number
  sessionsToday: number
  messagesThisWeek: number
}

type ActivityEvent = {
  id: string
  type: string
  label: string
  sessionId: string
  sessionTitle: string
  created_at: string
}

type Session = {
  id: string
  title: string
  status: string
  pinned: boolean
  updated_at: string
}

type Props = {
  kpi: KpiData | null
  activity: ActivityEvent[]
  loading: boolean
  sessions: Session[]
  onNewChat: () => void
  onSelectSession: (id: string) => void
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  if (h < 48) return 'yesterday'
  return new Date(iso).toLocaleDateString()
}

function ActivityIcon({ type }: { type: string }) {
  const cls = 'text-an-fg-muted flex-shrink-0 mt-0.5'
  if (type === 'session_created') return <MessageSquare size={14} strokeWidth={1.5} className={cls} />
  if (type === 'message_sent') return <Send size={14} strokeWidth={1.5} className={cls} />
  if (type === 'feedback_submitted') return <Star size={14} strokeWidth={1.5} className={cls} />
  if (type === 'session_completed') return <CheckCircle size={14} strokeWidth={1.5} className={cls} />
  if (type === 'session_error') return <AlertCircle size={14} strokeWidth={1.5} className={cls} />
  return <MessageSquare size={14} strokeWidth={1.5} className={cls} />
}

const STATUS_CHIP: Record<string, string> = {
  idle: 'bg-an-bg-elevated text-an-fg-muted',
  processing: 'text-an-accent',
  completed: 'text-[var(--an-success)]',
  error: 'text-[var(--an-error)]',
}

export default function HomeView({ kpi, activity, loading, sessions, onNewChat, onSelectSession }: Props) {
  const recentSessions = sessions.slice(0, 5)

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8 bg-an-bg-base">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-[18px] font-medium text-an-fg-base mb-1">Overview</h1>
            <p className="text-[13px] text-an-fg-subtle">Your document analysis activity</p>
          </div>
          <button
            onClick={onNewChat}
            className="h-9 flex items-center gap-2 px-4 rounded-md bg-an-accent hover:bg-an-accent-hover text-white text-[13px] font-medium transition duration-150"
          >
            <Plus size={14} strokeWidth={1.5} />
            New chat
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <KpiCard label="Total sessions" value={kpi?.totalSessions ?? null} sub="all time" loading={loading} />
          <KpiCard label="Sessions today" value={kpi?.sessionsToday ?? null} sub="started today" loading={loading} />
          <KpiCard label="Total messages" value={kpi?.totalMessages ?? null} sub="sent and received" loading={loading} />
          <KpiCard label="Messages this week" value={kpi?.messagesThisWeek ?? null} sub="last 7 days" loading={loading} />
          <KpiCard label="Active sessions" value={kpi?.activeSessions ?? null} sub="in progress" loading={loading} />
          <KpiCard label="Pinned chats" value={kpi?.pinnedSessions ?? null} sub="bookmarked" loading={loading} />
          <KpiCard label="Avg feedback rating" value={kpi?.avgFeedbackRating != null ? kpi.avgFeedbackRating.toFixed(1) : null} sub={kpi ? `${kpi.feedbackCount} ratings` : undefined} loading={loading} />
          <KpiCard label="Completed sessions" value={kpi?.completedSessions ?? null} sub="reviews finished" loading={loading} />
          <KpiCard label="Failed sessions" value={kpi?.errorSessions ?? null} sub="error status" loading={loading} />
          <KpiCard label="Your messages" value={kpi?.userMessages ?? null} sub="questions asked" loading={loading} />
          <KpiCard label="AI responses" value={kpi?.assistantMessages ?? null} sub="answers generated" loading={loading} />
          <KpiCard label="Avg per session" value={kpi?.avgMessagesPerSession ?? null} sub="messages/session" loading={loading} />
          <KpiCard label="Feedback count" value={kpi?.feedbackCount ?? null} sub="total ratings" loading={loading} />
        </div>

        {/* Recent Activity */}
        <section className="mb-8">
          <h2 className="text-[11px] text-an-fg-muted uppercase tracking-wide mb-3">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-[13px] text-an-fg-muted py-6 text-center">No activity yet.</p>
          ) : (
            <div className="flex flex-col bg-an-bg-surface border border-an-border rounded-lg overflow-hidden">
              {activity.slice(0, 20).map(event => (
                <div key={event.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-an-border last:border-0">
                  <ActivityIcon type={event.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-an-fg-base truncate">{event.label}</p>
                    <p className="text-[11px] text-an-fg-muted truncate">{event.sessionTitle}</p>
                  </div>
                  <span className="text-[11px] text-an-fg-muted flex-shrink-0 whitespace-nowrap">
                    {formatRelative(event.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Chats */}
        {recentSessions.length > 0 && (
          <section>
            <h2 className="text-[11px] text-an-fg-muted uppercase tracking-wide mb-3">Recent chats</h2>
            <div className="flex flex-col gap-2">
              {recentSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between bg-an-bg-surface border border-an-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full bg-an-bg-elevated ${STATUS_CHIP[session.status] ?? 'text-an-fg-muted'}`}
                    >
                      {session.status}
                    </span>
                    <span className="text-[13px] text-an-fg-base truncate">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-[11px] text-an-fg-muted">{new Date(session.updated_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="h-7 px-3 rounded border border-an-border text-[12px] text-an-fg-subtle hover:text-an-fg-base hover:bg-an-bg-elevated transition duration-100"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
