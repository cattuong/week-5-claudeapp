'use client'

import { useState, useRef } from 'react'
import MessageList from './MessageList'
import FileUpload from './FileUpload'
import { Send, Paperclip, X } from 'lucide-react'

type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string }

type Props = {
  messages: Message[]
  isLoading: boolean
  onSend: (message: string) => void
  onFileLoaded: (text: string, filename: string, previewUrl: string, fileType: string) => void
  filename: string
  activeSessionId: string | null
  isConnected: boolean
  userId: string
  pendingFeedbackMessageId: string | null
  onFeedbackDismiss: () => void
}

export default function ChatArea({
  messages, isLoading, onSend, onFileLoaded, filename,
  activeSessionId, isConnected, userId, pendingFeedbackMessageId, onFeedbackDismiss,
}: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 200) + 'px' }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isLoading || !activeSessionId) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <main className="flex-1 flex flex-col h-full min-w-0">
      {!activeSessionId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-an-fg-subtle text-[14px]">Select a conversation or start a new chat.</p>
            </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            userId={userId}
            activeSessionId={activeSessionId}
            pendingFeedbackMessageId={pendingFeedbackMessageId}
            onFeedbackDismiss={onFeedbackDismiss}
          />

          <div className="px-6 pb-6 pt-2">
            <div className="max-w-[680px] mx-auto">
              {filename && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-an-bg-surface rounded-md border border-an-border w-fit">
                  <Paperclip size={12} strokeWidth={1.5} className="text-an-fg-muted" />
                  <span className="text-[12px] text-an-fg-subtle">{filename}</span>
                  <button
                    onClick={() => onFileLoaded('', '', '', '')}
                    className="text-an-fg-muted hover:text-an-fg-base"
                  >
                    <X size={12} strokeWidth={1.5} />
                  </button>
                </div>
              )}
              <div className="bg-an-bg-surface border border-an-border rounded-xl p-3 flex items-end gap-3">
                <FileUpload inputRef={fileInputRef} onFileLoaded={onFileLoaded} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 text-an-fg-muted hover:text-an-fg-base transition duration-100 mb-0.5"
                  title="Attach document"
                >
                  <Paperclip size={16} strokeWidth={1.5} />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your document…"
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] text-an-fg-base placeholder:text-an-fg-muted leading-relaxed"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !activeSessionId}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-an-accent hover:bg-an-accent-hover disabled:opacity-40 flex items-center justify-center transition duration-150"
                >
                  <Send size={14} strokeWidth={1.5} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
