import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { calculateATSScore, humanizeCV } from './ats'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const platformGuidelines: Record<string, string> = {
  linkedin: `
    LinkedIn CVs should emphasize:
    - Quantifiable achievements and metrics
    - Industry-specific keywords
    - Professional accomplishments
    - Clear career progression
    - Leadership and impact statements
  `,
  flexjobs: `
    FlexJobs CVs should highlight:
    - Remote work experience
    - Flexibility and adaptability
    - Self-management skills
    - Time zone independence
    - Project-based accomplishments
  `,
  remote_co: `
    Remote.co CVs should focus on:
    - Async communication skills
    - Self-motivation and discipline
    - Remote-specific experience
    - Time management
    - Collaboration in distributed teams
  `,
  indeed: `
    Indeed CVs should be:
    - ATS-optimized with clear formatting
    - Keyword-rich for job matching
    - Well-structured with clear sections
    - Free of graphics and tables
    - Mobile-friendly
  `,
  upwork: `
    Upwork CVs should showcase:
    - Freelance portfolio highlights
    - Client testimonials and ratings
    - Project-based achievements
    - Specialized skills and expertise
    - Hourly rate or project pricing
  `,
};

export async function POST(request: NextRequest) {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'LLM API key not configured (Anthropic or OpenRouter)' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { email, personalInfo, workExperience, education, skills, targetPlatform, customInstructions } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get user
    const { data: user } = await supabase
      .from('cv_users')
      .select('id, free_credits_used, total_cvs_generated')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found, please save draft first.' }, { status: 404 })
    }

    const isFirstCV = !user.free_credits_used

    const platformGuide = platformGuidelines[targetPlatform] || platformGuidelines.linkedin

    const prompt = `
You are an expert CV and cover letter writer. Generate a professional CV and cover letter based on the following information.

PLATFORM GUIDELINES:
${platformGuide}

USER INFORMATION:
Name: ${personalInfo.name}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}
Location: ${personalInfo.location}
Professional Summary: ${personalInfo.summary}

WORK EXPERIENCE:
${JSON.stringify(workExperience, null, 2)}

EDUCATION:
${JSON.stringify(education, null, 2)}

SKILLS:
${JSON.stringify(skills, null, 2)}

${customInstructions ? `CUSTOM INSTRUCTIONS:\n${customInstructions}` : ""}

Please generate:
1. A professional CV in markdown format with clear sections
2. A tailored cover letter for the ${targetPlatform} platform

Ensure the CV is ATS-optimized, keyword-rich, and tailored to the ${targetPlatform} platform.
Make the language natural and human-like, avoiding overly formal or robotic phrasing.

CRITICAL JSON INSTRUCTIONS:
- You MUST return ONLY valid JSON.
- ALL newlines inside the strings MUST be escaped as \\n. DO NOT output literal newlines inside the JSON strings.
- Escape double quotes properly.

Return the response in this exact JSON format:
{
  "cv": "...markdown formatted CV with escaped newlines...",
  "coverLetter": "...cover letter text with escaped newlines..."
}
    `

    let responseText = ''

    if (process.env.OPENROUTER_API_KEY) {
      const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://m-abbaslab.vercel.app',
          'X-Title': 'M-AbbasLab CV Generator',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-haiku',
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!orResponse.ok) {
        throw new Error(`OpenRouter error: ${await orResponse.text()}`)
      }

      const data = await orResponse.json()
      responseText = data?.choices?.[0]?.message?.content || ''
    } else {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
      responseText = (response.content[0] as any).text
    }
    
    // Parse the JSON out of the response (in case it includes markdown block formatting)
    let jsonString = responseText.trim()
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '')
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '')
    }

    // Try to sanitize unescaped literal control characters inside string values if any exist
    // eslint-disable-next-line no-control-regex
    jsonString = jsonString.replace(/[\u0000-\u001F]+/g, (match) => {
      // If it's a newline that is part of the JSON structure (e.g., between key-values), we should leave it
      // but this is tricky. We will rely on response_format.
      return match;
    });

    const parsed = JSON.parse(jsonString.trim())
    const { cv, coverLetter } = parsed

    // Calculate ATS Score and Humanize
    const atsReport = calculateATSScore(cv)
    const humanizedCV = humanizeCV(cv)

    // Save Generation
    const { data: generation, error: genError } = await supabase
      .from('cv_generations')
      .insert({
        user_id: user.id,
        target_platform: targetPlatform,
        custom_instructions: customInstructions,
        generated_cv: humanizedCV,
        generated_cover_letter: coverLetter,
        status: 'generated',
        is_humanized: true,
        ats_score: atsReport.score,
        ats_checks: atsReport.checks,
        suggested_improvements: atsReport.suggestedImprovements,
        is_paid: false
      })
      .select('id')
      .single()

    if (genError) throw genError

    // Update user stats
    await supabase
      .from('cv_users')
      .update({
        free_credits_used: isFirstCV ? true : user.free_credits_used,
        total_cvs_generated: (user.total_cvs_generated || 0) + 1
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      data: {
        id: generation.id,
        cv: humanizedCV,
        coverLetter: coverLetter,
        atsReport
      },
      isFirstCV
    })

  } catch (error: any) {
    console.error('CV generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
