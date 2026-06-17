import { NextRequest, NextResponse } from 'next/server'
import { updateSessionTitle, updateSessionPin, updateSessionStatus, deleteSession } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await req.json()

  try {
    let session
    if (body.action === 'rename') {
      const title = (body.title ?? '').trim().slice(0, 200)
      if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
      session = await updateSessionTitle(id, title)
    } else if (body.action === 'pin') {
      session = await updateSessionPin(id, Boolean(body.pinned))
    } else if (body.action === 'status') {
      const valid = ['idle', 'processing', 'completed', 'error']
      if (!valid.includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
      session = await updateSessionStatus(id, body.status)
    } else {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }
    return NextResponse.json({ session })
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteSession(params.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  }
}
