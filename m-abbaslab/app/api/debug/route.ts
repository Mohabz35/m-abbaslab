// app/api/debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  
  const debugInfo = {
    status: 'debug',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...'
        : 'NOT SET',
      keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? '••••' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-8)
        : 'NOT SET'
    },
    project: {
      name: 'M-AbbasLab',
      version: '2.0',
      phase: 'Phase 1 - Stabilization'
    }
  }

  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
