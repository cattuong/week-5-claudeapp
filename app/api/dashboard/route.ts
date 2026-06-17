import { NextRequest, NextResponse } from 'next/server'
import { getKpiData, getActivityFeed } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required.' }, { status: 400 })

  try {
    const [kpi, activity] = await Promise.all([
      getKpiData(userId),
      getActivityFeed(userId, 50),
    ])
    return NextResponse.json({ kpi, activity })
  } catch {
    return NextResponse.json({ error: 'Failed to load dashboard data.' }, { status: 500 })
  }
}
