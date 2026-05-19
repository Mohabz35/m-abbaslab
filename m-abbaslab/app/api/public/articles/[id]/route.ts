import { NextResponse } from 'next/server'
import { getLiveConfig } from '@/lib/dbConfig'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const config = await getLiveConfig()
    const articles = (config as { articles?: { id: string; published?: boolean }[] }).articles ?? []
    const article = articles.find((a) => a.id === id)
    if (!article || article.published === false) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(article)
  } catch {
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
  }
}
