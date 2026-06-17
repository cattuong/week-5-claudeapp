import { NextRequest, NextResponse } from 'next/server'
import { createFeedback } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId, sessionId, rating, comment } = await req.json()

  if (!userId || !sessionId || !rating) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5.' }, { status: 400 })
  }

  try {
    const feedback = await createFeedback(userId, sessionId, rating, comment?.trim() || undefined)
    return NextResponse.json({ feedback }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Could not save feedback.' }, { status: 500 })
  }
}
