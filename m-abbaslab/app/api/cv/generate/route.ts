import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { calculateATSScore, humanizeCV } from './ats'
import { getKnowledgeContext } from './job-knowledge'
import { researchCompanyAndRole } from './research'
import { checkRateLimit } from '@/lib/rate-limit'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Removed old platformGuidelines as we now use job-knowledge.ts

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = checkRateLimit(`cv-gen:${ip}`, 3, 300000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait 5 minutes.' }, { status: 429 })
  }

  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'LLM API key not configured (Anthropic or OpenRouter)' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { email, personalInfo, workExperience, education, skills, targetPlatform, customInstructions, jobDescription, existingCv } = body

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

    const knowledgeContext = getKnowledgeContext(targetPlatform, jobDescription || "");
    const researchContext = await researchCompanyAndRole(jobDescription || "");

    const prompt = `
You are an elite executive CV writer, AI recruitment specialist, and interview coach. 
Your task is to generate 3 distinct CV variants, a cover letter, and interview preparation questions.

${knowledgeContext}

${researchContext}

USER'S FORM DATA:
Name: ${personalInfo.name}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}
Location: ${personalInfo.location}
Summary: ${personalInfo.summary}
Work Experience: ${JSON.stringify(workExperience, null, 2)}
Education: ${JSON.stringify(education, null, 2)}
Skills: ${JSON.stringify(skills, null, 2)}

${existingCv ? `EXISTING CV DATA (Extract useful details to enhance the form data):\n${existingCv}\n` : ""}
${jobDescription ? `TARGET JOB DESCRIPTION (Tailor the CVs strictly to pass ATS for this role):\n${jobDescription}\n` : ""}
${customInstructions ? `CUSTOM INSTRUCTIONS:\n${customInstructions}\n` : ""}

TASK 1: Conduct Research
Output a brief summary of your findings about the company and role in the "researchSummary" field.

TASK 2: Generate 3 CV Models in Markdown Format
- Model 1: "Traditional/Conservative" (Classic, professional, safe formatting)
- Model 2: "Metric-Driven" (Heavily focused on numbers, scale, and high-impact results)
- Model 3: "Modern/ATS-Optimized" (Perfectly balanced for AI parsers like Mercor/Micro1, direct and keyword-dense)
For all models, blend the user's form data with their existing CV. Strictly balance it against the Job Description and your Research to ensure it passes ATS.

TASK 3: Generate a tailored Cover Letter for the target job.

TASK 4: Generate 4-5 likely interview questions based on the gap between the CV and the Job Description, including suggested ways to answer.

CRITICAL JSON INSTRUCTIONS:
- You MUST return ONLY valid JSON.
- ALL newlines inside the strings MUST be escaped as \\n. DO NOT output literal newlines inside the JSON strings.
- Escape double quotes properly.

Return the response in this exact JSON format:
{
  "researchSummary": "...2-3 paragraphs of your company and role research...",
  "cv_models": [
    { "name": "Traditional", "content": "...markdown CV..." },
    { "name": "Metric-Driven", "content": "...markdown CV..." },
    { "name": "Modern", "content": "...markdown CV..." }
  ],
  "coverLetter": "...cover letter text...",
  "interviewQuestions": [
    { "question": "...", "rationale": "...", "suggestedAnswer": "..." }
  ]
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
          max_tokens: 6000,
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
        max_tokens: 6000,
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
    const { researchSummary, cv_models, coverLetter, interviewQuestions } = parsed

    // We will run ATS Score and Humanize on the first model (Traditional) as the baseline for the report
    const primaryCV = cv_models[0]?.content || "No CV content generated";
    const atsReport = calculateATSScore(primaryCV)
    const humanizedCV = humanizeCV(primaryCV)

    // Save Generation
    // Note: We use JSON.stringify for cv_models and interview_questions since they might be newly added JSONB columns
    // or if the schema hasn't been migrated, they will just safely throw, but user will run the migration.
    const { data: generation, error: genError } = await supabase
      .from('cv_generations')
      .insert({
        user_id: user.id,
        target_platform: targetPlatform,
        custom_instructions: customInstructions,
        generated_cv: humanizedCV,
        generated_cover_letter: coverLetter,
        cv_models: cv_models,
        interview_questions: interviewQuestions,
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
        researchSummary: researchSummary,
        cv_models: cv_models,
        coverLetter: coverLetter,
        interviewQuestions: interviewQuestions,
        atsReport
      },
      isFirstCV
    })

  } catch (error: any) {
    console.error('CV generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
