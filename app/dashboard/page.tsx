'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'
import RightPanel from '@/components/RightPanel'
import HomeView from '@/components/HomeView'
import { getSessions, createSession, createMessage, getMessages } from '@/lib/db'

type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string }
type Session = { id: string; title: string; status: string; pinned: boolean; updated_at: string; created_at: string }
type StepStatus = 'pending' | 'active' | 'done' | 'error'
type ExecutionStep = { label: string; status: StepStatus }

const STEP_LABELS = [
  'Parsing document',
  'Sending to Azure',
  'Waiting for response',
  'Processing result',
  'Completed',
]

function initSteps(): ExecutionStep[] {
  return STEP_LABELS.map(label => ({ label, status: 'pending' as StepStatus }))
}

function setStep(steps: ExecutionStep[], index: number, status: StepStatus): ExecutionStep[] {
  return steps.map((s, i) => i === index ? { ...s, status } : s)
}

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [view, setView] = useState<'home' | 'chat'>('home')
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [contractText, setContractText] = useState('')
  const [filename, setFilename] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileType, setFileType] = useState('')
  const [docxText, setDocxText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [pendingFeedbackMessageId, setPendingFeedbackMessageId] = useState<string | null>(null)
  const [kpi, setKpi] = useState<Record<string, unknown> | null>(null)
  const [activity, setActivity] = useState<unknown[]>([])
  const [kpiLoading, setKpiLoading] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('userId')
    if (!id) { router.push('/login'); return }
    setUserId(id)
    const azCookie = document.cookie.includes('azure_token')
    setIsConnected(azCookie)
    loadSessions(id)
    loadDashboard(id)
  }, [router])

  async function loadSessions(id: string) {
    const data = await getSessions(id)
    setSessions(data as Session[])
  }

  async function loadDashboard(id: string) {
    setKpiLoading(true)
    try {
      const res = await fetch(`/api/dashboard?userId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setKpi(data.kpi)
        setActivity(data.activity)
      }
    } finally {
      setKpiLoading(false)
    }
  }

  async function handleNewChat() {
    if (!userId) return
    const session = await createSession(userId, 'New conversation')
    const s = session as Session
    setSessions(prev => [s, ...prev])
    setActiveSessionId(s.id)
    setView('chat')
    setMessages([])
    clearFileState()
    setExecutionSteps([])
    setPendingFeedbackMessageId(null)
  }

  async function handleSelectSession(sessionId: string) {
    setActiveSessionId(sessionId)
    setView('chat')
    setMessages([])
    clearFileState()
    setExecutionSteps([])
    setPendingFeedbackMessageId(null)
    const data = await getMessages(sessionId)
    setMessages(data as Message[])
  }

  function handleGoHome() {
    setActiveSessionId(null)
    setView('home')
    if (userId) loadDashboard(userId)
  }

  const handleFileLoaded = useCallback((text: string, name: string, url: string, type: string) => {
    setContractText(text)
    setFilename(name)
    setPreviewUrl(url)
    setFileType(type)
    const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    setDocxText(type === DOCX ? text.slice(0, 4000) : '')
  }, [])

  function clearFileState() {
    setContractText('')
    setFilename('')
    setPreviewUrl('')
    setFileType('')
    setDocxText('')
  }

  async function handleSend(userMessage: string) {
    if (!userId || !activeSessionId) return
    setIsLoading(true)
    setPendingFeedbackMessageId(null)

    // Init execution steps
    let steps = initSteps()
    steps = setStep(steps, 0, 'done')   // parsing already done
    steps = setStep(steps, 1, 'active') // sending
    setExecutionSteps([...steps])

    // Optimistic user message
    const tempId = `optimistic-${Date.now()}`
    const optimistic: Message = { id: tempId, role: 'user', content: userMessage, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])

    // Auto-title
    const currentSession = sessions.find(s => s.id === activeSessionId)
    if (currentSession?.title === 'New conversation') {
      const title = userMessage.slice(0, 55) + (userMessage.length > 55 ? '…' : '')
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title } : s))
      fetch(`/api/sessions/${activeSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', title }),
      }).catch(() => {})
    }

    try {
      steps = setStep(steps, 1, 'done')
      steps = setStep(steps, 2, 'active')
      setExecutionSteps([...steps])

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, userMessage, sessionId: activeSessionId }),
      })

      if (res.status === 401 || res.status === 403) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        steps = setStep(steps, 2, 'error')
        setExecutionSteps([...steps])
        setTimeout(() => setExecutionSteps([]), 3000)
        return
      }

      steps = setStep(steps, 2, 'done')
      steps = setStep(steps, 3, 'active')
      setExecutionSteps([...steps])

      const data = await res.json()
      const assistantText = data.assistantMessage ?? data.content ?? ''

      // Route saves messages — build local Message objects from returned IDs
      const now = new Date().toISOString()
      const userMsgLocal: Message = { id: data.userMessageId ?? tempId, role: 'user', content: userMessage, created_at: now }
      const assistantMsgLocal: Message = { id: data.assistantMessageId ?? `asst-${Date.now()}`, role: 'assistant', content: assistantText, created_at: now }
      const saved = assistantMsgLocal

      steps = setStep(steps, 3, 'done')
      steps = setStep(steps, 4, 'done')
      setExecutionSteps([...steps])

      const savedMsg = saved as Message
      setMessages(prev => [...prev.filter(m => m.id !== tempId), savedMsg])
      setPendingFeedbackMessageId(savedMsg.id)

      // Update session updated_at locally
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, updated_at: new Date().toISOString(), status: 'completed' } : s))

      // Clear steps after a short delay
      setTimeout(() => setExecutionSteps([]), 1500)
    } catch {
      const activeIdx = steps.findIndex(s => s.status === 'active')
      if (activeIdx >= 0) steps = setStep(steps, activeIdx, 'error')
      setExecutionSteps([...steps])
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setTimeout(() => setExecutionSteps([]), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRenameSession(id: string, title: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s))
    await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', title }),
    }).catch(() => {})
  }

  async function handlePinSession(id: string, pinned: boolean) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned } : s))
    await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pin', pinned }),
    }).catch(() => {})
  }

  async function handleDeleteSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setView('home')
      setMessages([])
    }
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  function handleLogout() {
    localStorage.removeItem('userId')
    router.push('/login')
  }

  return (
    <>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onGoHome={handleGoHome}
        onLogout={handleLogout}
        onRenameSession={handleRenameSession}
        onPinSession={handlePinSession}
        onDeleteSession={handleDeleteSession}
        userId={userId ?? ''}
      />

      {view === 'home' ? (
        <HomeView
          kpi={kpi as Parameters<typeof HomeView>[0]['kpi']}
          activity={activity as Parameters<typeof HomeView>[0]['activity']}
          loading={kpiLoading}
          sessions={sessions}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
        />
      ) : (
        <>
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
            onFileLoaded={handleFileLoaded}
            filename={filename}
            activeSessionId={activeSessionId}
            isConnected={isConnected}
            userId={userId ?? ''}
            pendingFeedbackMessageId={pendingFeedbackMessageId}
            onFeedbackDismiss={() => setPendingFeedbackMessageId(null)}
          />
          <RightPanel
            previewUrl={previewUrl}
            filename={filename}
            fileType={fileType}
            docxText={docxText}
            isConnected={isConnected}
            executionSteps={executionSteps}
          />
        </>
      )}
    </>
  )
}
