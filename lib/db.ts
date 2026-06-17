import { supabase } from './supabase'

export async function getUser(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error) return null
  return data
}

export async function createUser(email: string, passwordHash: string) {
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash: passwordHash })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createSession(userId: string, title: string) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, title, status: 'idle' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getSessions(userId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) return []
  return data
}

export async function createMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, role, content })
    .select()
    .single()
  if (error) throw error
  await supabase
    .from('sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
  return data
}

export async function getMessages(sessionId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data
}

export async function createFeedback(
  userId: string,
  sessionId: string,
  rating: number,
  comment?: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ user_id: userId, session_id: sessionId, rating, comment })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSessionTitle(id: string, title: string) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ title })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSessionPin(id: string, pinned: boolean) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ pinned })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSessionStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSession(id: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getKpiData(userId: string) {
  const sessionsRes = await supabase
    .from('sessions')
    .select('id, status, pinned, created_at, updated_at')
    .eq('user_id', userId)

  const sessions = sessionsRes.data ?? []
  const sessionIds = sessions.map((s) => s.id)

  const [messagesRes, feedbackRes] = await Promise.all([
    sessionIds.length > 0
      ? supabase.from('messages').select('id, session_id, role, created_at').in('session_id', sessionIds)
      : Promise.resolve({ data: [] }),
    supabase.from('feedback').select('id, rating, created_at').eq('user_id', userId),
  ])

  const messages = messagesRes.data ?? []
  const feedbacks = feedbackRes.data ?? []

  const now = Date.now()
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  return {
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => s.status === 'processing').length,
    completedSessions: sessions.filter((s) => s.status === 'completed').length,
    errorSessions: sessions.filter((s) => s.status === 'error').length,
    pinnedSessions: sessions.filter((s) => s.pinned).length,
    totalMessages: messages.length,
    userMessages: messages.filter((m) => m.role === 'user').length,
    assistantMessages: messages.filter((m) => m.role === 'assistant').length,
    avgMessagesPerSession: sessions.length ? Math.round(messages.length / sessions.length) : 0,
    avgFeedbackRating:
      feedbacks.length
        ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        : null,
    feedbackCount: feedbacks.length,
    sessionsToday: sessions.filter((s) => s.created_at >= todayStart).length,
    messagesThisWeek: messages.filter((m) => m.created_at >= weekAgo).length,
  }
}

export async function getActivityFeed(userId: string, limit = 50) {
  const sessionsRes = await supabase
    .from('sessions')
    .select('id, title, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  const sessions = sessionsRes.data ?? []
  const sessionIds = sessions.map((s) => s.id)
  const sessionMap = Object.fromEntries(sessions.map((s) => [s.id, s.title]))

  const [messagesRes, feedbackRes] = await Promise.all([
    sessionIds.length > 0
      ? supabase
          .from('messages')
          .select('id, session_id, role, created_at')
          .in('session_id', sessionIds)
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [] }),
    supabase
      .from('feedback')
      .select('id, session_id, rating, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  type Event = { id: string; type: string; label: string; sessionId: string; sessionTitle: string; created_at: string }
  const events: Event[] = []

  for (const s of sessions) {
    events.push({ id: `sess-${s.id}`, type: 'session_created', label: `Started "${s.title}"`, sessionId: s.id, sessionTitle: s.title, created_at: s.created_at })
    if (s.status === 'completed') events.push({ id: `sess-done-${s.id}`, type: 'session_completed', label: `Completed "${s.title}"`, sessionId: s.id, sessionTitle: s.title, created_at: s.updated_at })
    if (s.status === 'error') events.push({ id: `sess-err-${s.id}`, type: 'session_error', label: `Error in "${s.title}"`, sessionId: s.id, sessionTitle: s.title, created_at: s.updated_at })
  }
  for (const m of messagesRes.data ?? []) {
    events.push({ id: `msg-${m.id}`, type: 'message_sent', label: 'Message sent', sessionId: m.session_id, sessionTitle: sessionMap[m.session_id] ?? 'Unknown', created_at: m.created_at })
  }
  for (const f of feedbackRes.data ?? []) {
    events.push({ id: `fb-${f.id}`, type: 'feedback_submitted', label: `Feedback submitted (${f.rating}/5)`, sessionId: f.session_id, sessionTitle: sessionMap[f.session_id] ?? 'Unknown', created_at: f.created_at })
  }

  return events.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit)
}
