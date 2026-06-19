import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try { await jwtVerify(session.value, JWT_SECRET); return true } catch { return false }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { prompt, context, mode } = body

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        response: getFallbackAdvice(mode, context),
        source: 'fallback'
      })
    }

    const systemPrompt = `You are JARVIS, an AI discipline coach for Mohammed Abbas. You are strict, direct, and motivational. 
Your role is to analyze daily discipline data and provide actionable advice.

Rules:
- Be brutally honest
- Focus on systems, not motivation
- Give specific, actionable steps
- Reference the 7 pillars: Body, Skills, Mental, Winning, Confidence, Financial, Work Ethic
- Keep responses under 200 words
- Use data to drive advice, not feelings`

    const userPrompt = mode === 'daily-review'
      ? `Analyze this day's discipline data and give feedback:
${JSON.stringify(context, null, 2)}`
      : mode === 'habit-coaching'
      ? `Analyze these habits and suggest improvements:
${JSON.stringify(context, null, 2)}`
      : mode === 'weekly-summary'
      ? `Provide a weekly discipline summary and next steps:
${JSON.stringify(context, null, 2)}`
      : mode === 'diary-reflection'
      ? `Read this diary entry and provide a thoughtful reflection. Be supportive but honest. Help them see patterns, celebrate wins, and identify areas for growth. Mood: ${context?.mood || 'neutral'}

Entry:
${context?.content || ''}`
      : `Provide discipline coaching based on this data:
${JSON.stringify(context, null, 2)}`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://m-abbaslab.com',
        'X-Title': 'M-AbbasLab Discipline OS',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', errText)
      return NextResponse.json({
        success: true,
        response: getFallbackAdvice(mode, context),
        source: 'fallback'
      })
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || getFallbackAdvice(mode, context)

    return NextResponse.json({ success: true, response: aiResponse, source: 'openrouter' })
  } catch (error) {
    console.error('AI coaching error:', error)
    return NextResponse.json({
      success: true,
      response: getFallbackAdvice('general', {}),
      source: 'fallback'
    })
  }
}

function getFallbackAdvice(mode: string | undefined, context: any): string {
  if (mode === 'habit-coaching') {
    const completed = context?.completed || 0
    const total = context?.total || 10
    const rate = Math.round((completed / total) * 100)
    if (rate >= 80) return `Excellent discipline today! ${completed}/${total} habits completed (${rate}%). You're building real momentum. Keep stacking days like this — consistency compounds. Tomorrow, try to add one more challenging habit to push your edge.`
    if (rate >= 50) return `Solid effort — ${completed}/${total} habits completed (${rate}%). Halfway there. The gap between 50% and 80% is where character is built. Identify which habits you skipped and ask yourself: was it logistics or laziness? Fix the system, not the willpower.`
    return `Only ${completed}/${total} habits completed (${rate}%). This needs immediate attention. You're in the danger zone. Pick your 3 most important habits and make them non-negotiable tomorrow. Start with the easiest one to build momentum. Remember: missing once is an accident, missing twice is a new habit.`
  }
  if (mode === 'daily-review') {
    const score = context?.overallScore || 5
    if (score >= 8) return `Day score: ${score}/10 — outstanding execution. Your systems are working. Two things to watch: don't let success make you complacent, and document what worked so you can replicate it. The best days are when the system runs itself.`
    if (score >= 5) return `Day score: ${score}/10 — average performance. You showed up but didn't push. Average is the enemy of greatness. Tomorrow, pick ONE pillar that scored lowest and deliberately over-invest in it. Progress comes from targeted pressure, not scattered effort.`
    return `Day score: ${score}/10 — unacceptable. This isn't about motivation, it's about systems. What broke today? Was it your environment, your schedule, or your defaults? Fix the root cause. Write down the single biggest blocker and remove it tomorrow before noon.`
  }
  return `Discipline is a practice, not a destination. You're building something that compounds over months and years. Focus on the system, not the score. Show up tomorrow and execute the basics. That's all that matters.`
}
