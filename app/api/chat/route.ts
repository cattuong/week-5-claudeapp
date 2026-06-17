import { NextRequest } from 'next/server'
import { createMessage } from '@/lib/db'
import { getAzureClient } from '@/lib/azure'
import { updateSessionStatus } from '@/lib/db'

const FALLBACK = 'I was unable to get a response from the AI agent. Please try again.'

export async function POST(req: NextRequest) {
  const { sessionId, userMessage, contractText } = await req.json()

  if (!sessionId || !userMessage) {
    return Response.json({ error: 'sessionId and userMessage are required' }, { status: 400 })
  }

  if (sessionId) await updateSessionStatus(sessionId, 'processing').catch(() => {})

  const userMsg = await createMessage(sessionId, 'user', userMessage)

  let assistantText = FALLBACK

  try {
    const openai = getAzureClient()

    const combinedInput = contractText
      ? `CONTRACT TEXT:\n${contractText}\n\nUSER QUESTION:\n${userMessage}`
      : userMessage

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (openai.responses.create as any)({
      input: [{ role: 'user', content: combinedInput }],
    })

    const firstOutput = response.output?.find((o: { type: string }) => o.type === 'message')
    const rawText = firstOutput?.content?.find((c: { type: string }) => c.type === 'output_text')?.text
    assistantText = response.output_text ?? rawText ?? FALLBACK
  } catch (err: unknown) {
    console.error('Azure chat error:', err)
    const httpStatus = (err as { status?: number }).status ?? 0
    if (httpStatus === 401 || httpStatus === 403) {
      await createMessage(sessionId, 'assistant', FALLBACK)
      await updateSessionStatus(sessionId, 'error').catch(() => {})
      return Response.json({ error: 'Azure authentication failed.' }, { status: httpStatus })
    }
  }

  const assistantMsg = await createMessage(sessionId, 'assistant', assistantText)
  await updateSessionStatus(sessionId, 'completed').catch(() => {})

  return Response.json({
    assistantMessage: assistantText,
    userMessageId: userMsg.id,
    assistantMessageId: assistantMsg.id,
  })
}
