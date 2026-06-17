'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import FeedbackWidget from './FeedbackWidget'

type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string }

type Props = {
  messages: Message[]
  isLoading: boolean
  userId: string
  activeSessionId: string
  pendingFeedbackMessageId: string | null
  onFeedbackDismiss: () => void
}

export default function MessageList({ messages, isLoading, userId, activeSessionId, pendingFeedbackMessageId, onFeedbackDismiss }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, pendingFeedbackMessageId])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-[680px] mx-auto flex flex-col gap-6">
        {messages.length === 0 && (
          <p className="text-an-fg-muted text-[13px] text-center pt-16">
            Upload a document and ask a question to get started.
          </p>
        )}
        {messages.map(msg => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {msg.role === 'assistant' && msg.id === pendingFeedbackMessageId && (
              <FeedbackWidget
                userId={userId}
                sessionId={activeSessionId}
                messageId={msg.id}
                onDismiss={onFeedbackDismiss}
              />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-an-accent flex-shrink-0 mt-1" />
            <div className="flex gap-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-an-fg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-an-fg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-an-fg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
