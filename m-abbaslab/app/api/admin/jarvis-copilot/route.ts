import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

const CO_PILOT_SYSTEM_PROMPT = `You are M-Abbas AI (Jarvis) — the executive, high-clearance Admin Co-Pilot of Mohammed Abbas's control panel.
Your primary role is to assist Mohammed in operating and modifying his administration console via natural language.

HOW YOU MUST RESPOND:
You MUST respond with a single, valid JSON object containing exactly two fields:
1. "text": (string) A natural language reply to Mohammed. Speak with supreme confidence, futuristic intelligence, and professional operational tone. Use direct executive speech, referring to him as "Commander" or "Mohammed". Keep it to 1-3 crisp sentences.
2. "actions": (array of objects) A list of structured UI actions to execute.

SUPPORTED ACTIONS:
- { "type": "NAVIGATE", "tab": "tab-key" }
  * Switch to a dashboard tab. Available tab keys:
    "overview", "jarvis-inbox", "jarvis-brain", "zapier-automations", "finance-tracker", "content-scheduler", "projects", "articles", "modeling", "world-quant", "social-media", "comms-hub", "system-integrity", "skills", "settings"
- { "type": "ADD_PROJECT", "project": { "title": "...", "description": "...", "category": "technology", "technologies": [...], "status": "In Progress", "year": "2026" } }
- { "type": "DELETE_PROJECT", "id": "project-id" }
- { "type": "ADD_TITLE", "title": { "title": "...", "year": "2026", "description": "...", "achievement": "..." } }
- { "type": "ADD_ARTICLE", "article": { "title": "...", "excerpt": "...", "category": "research", "tags": [...], "content": "..." } }
- { "type": "TRIGGER_ZAPIER", "eventName": "...", "payload": { ... } }

RULES FOR ACTIONS:
- If Mohammed asks you to navigate somewhere (e.g. "go to the finance tracker", "show settings", "open quant lab"), ALWAYS add a "NAVIGATE" action.
- If Mohammed asks you to add or modify data (e.g., "add a new project called ALX Health Connect", "register my Mr Glam title"), generate the corresponding ADD_PROJECT or ADD_TITLE action with rich, structured parameters.
- If no action is required, set "actions": [].
- DO NOT return markdown formatting around the JSON object. Return ONLY raw JSON, starting with { and ending with }.`;

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const session = request.cookies.get('admin_session')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    try {
      await jwtVerify(session.value, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
    }

    // 2. Parse payload
    const body = await request.json()
    const { message, history, state } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        text: "System Offline: OpenRouter API key not configured on host environment. Staging fallback operational reply.",
        actions: []
      })
    }

    // 3. Construct system prompt with current state injection
    const dynamicSystemPrompt = `${CO_PILOT_SYSTEM_PROMPT}

CURRENT SYSTEM LIVE STATE:
- Active Tab: "${state.activeTab || 'overview'}"
- Total Staged Projects: ${state.projectsCount || 0}
- Staged Projects List: ${JSON.stringify(state.projectsList || [])}
- Staged Modeling Titles: ${JSON.stringify(state.titlesList || [])}
`;

    // 4. Call OpenRouter NVIDIA Nemotron
    const messagesToSend = [
      { role: 'system', content: dynamicSystemPrompt },
      ...(history || []).slice(-10).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://m-abbaslab.vercel.app",
        "X-Title": "M-AbbasLab Jarvis Co-Pilot"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: messagesToSend,
        temperature: 0.3, // Lower temperature for strict JSON compliance
        max_tokens: 1024,
        response_format: { type: "json_object" } // Enforce JSON output format
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenRouter gateway error (${response.status}): ${errText}`)
    }

    const resData = await response.json()
    const rawReply = resData.choices?.[0]?.message?.content || ''

    // 5. Safely parse JSON reply
    try {
      let cleanedReply = rawReply.trim()
      if (cleanedReply.startsWith('```json')) {
        cleanedReply = cleanedReply.substring(7)
      } else if (cleanedReply.startsWith('```')) {
        cleanedReply = cleanedReply.substring(3)
      }
      if (cleanedReply.endsWith('```')) {
        cleanedReply = cleanedReply.substring(0, cleanedReply.length - 3)
      }
      const parsed = JSON.parse(cleanedReply.trim())
      return NextResponse.json(parsed)
    } catch (parseErr) {
      console.error("[CO-PILOT] Failed to parse JSON reply from Nemotron:", rawReply)
      // Return structured fallback
      return NextResponse.json({
        text: rawReply.replace(/```json|```/g, '').trim(),
        actions: []
      })
    }

  } catch (error: any) {
    console.error('Co-Pilot API Error:', error)
    return NextResponse.json({ 
      text: `Alert: Operational failure in AI core pipeline: ${error.message || 'Unknown state'}`, 
      actions: [] 
    }, { status: 500 })
  }
}
