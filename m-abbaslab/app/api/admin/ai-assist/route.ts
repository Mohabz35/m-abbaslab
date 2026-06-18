import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, prompt, content } = await request.json()

    // Mocking AI response for now. Ideally connect this to OpenAI or your existing JARVIS handler.
    let aiResponse = ''
    
    if (action === 'suggest_ideas') {
      aiResponse = `Here are some ideas based on "${prompt}":\n1. The Future of AI in Research\n2. How Machine Learning transforms data analysis\n3. An Introduction to Quantum Computing in 2026`
    } else if (action === 'summarize') {
      aiResponse = `Summary: ${content?.substring(0, 50)}... [AI summarized text would appear here]`
    } else if (action === 'co_author') {
      aiResponse = `[AI generated expansion based on prompt: "${prompt}"]\n\nAI agents are revolutionizing how we interact with data...`
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result: aiResponse })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
