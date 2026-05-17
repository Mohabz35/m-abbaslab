// app/api/cron/process-queue/route.ts
// Vercel Cron Job — runs every minute to publish due scheduled posts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Vercel automatically sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const res = await fetch(`${baseUrl}/api/schedule?action=process`, {
      headers: { 'x-admin-secret': process.env.ADMIN_SECRET || '' },
    })

    const data = await res.json()

    return NextResponse.json({
      ok: true,
      processed: data.processed ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
