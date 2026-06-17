'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type Props = {
  userId: string
  sessionId: string
  messageId: string
  onDismiss: () => void
}

export default function FeedbackWidget({ userId, sessionId, messageId, onDismiss }: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (rating === 0 || loading) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, messageId, rating, comment: comment.trim() || undefined }),
      })
      setSubmitted(true)
      setTimeout(onDismiss, 1500)
    } catch {
      onDismiss()
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="pl-7 mt-1">
        <p className="text-[12px] text-an-fg-muted an-fade-in">Thanks for your feedback.</p>
      </div>
    )
  }

  return (
    <div className="pl-7 mt-2 an-fade-in">
      <div className="bg-an-bg-surface border border-an-border rounded-lg p-3 flex flex-col gap-2 w-fit">
        <p className="text-[12px] text-an-fg-subtle">Was this response helpful?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              className="transition duration-100"
            >
              <Star
                size={16}
                strokeWidth={1.5}
                style={{
                  color: n <= (hoverRating || rating) ? 'var(--an-accent)' : 'var(--an-fg-muted)',
                  fill: n <= (hoverRating || rating) ? 'var(--an-accent)' : 'transparent',
                }}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            rows={2}
            className="resize-none text-[12px] bg-an-bg-elevated border border-an-border rounded p-2 text-an-fg-base placeholder:text-an-fg-muted outline-none focus:border-an-border-strong w-48"
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="h-7 px-3 rounded bg-an-accent hover:bg-an-accent-hover text-white text-[12px] disabled:opacity-40 transition duration-150"
          >
            Submit
          </button>
          <button
            onClick={onDismiss}
            className="h-7 px-3 rounded border border-an-border text-[12px] text-an-fg-subtle hover:text-an-fg-base transition duration-100"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
