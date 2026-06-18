// app/api/debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const debugInfo = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    persistence: {
      type: 'File-Based CMS',
      configFile: 'config/personal.ts',
      dataFile: 'data/personal.json',
      apiRoute: '/api/admin/config'
    },
    project: {
      name: 'M-AbbasLab',
      version: '2.0',
      phase: 'Phase 2 - Zero-Dependency'
    }
  }

  return NextResponse.json(debugInfo, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
