import { NextResponse } from 'next/server'
import { getLiveConfig } from '@/lib/dbConfig'

/** Public read-only list of published articles (no credentials). */
export async function GET() {
  try {
    const config = await getLiveConfig()
    const raw = (config as { articles?: { published?: boolean }[] }).articles ?? []
    const articles = raw.filter((a) => a.published !== false)
    return NextResponse.json(articles)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
