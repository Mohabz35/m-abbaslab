import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { email, personalInfo, workExperience, education, skills, targetPlatform, customInstructions } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required to save progress' }, { status: 400 })
    }

    // Upsert user
    let { data: user, error: userError } = await supabase
      .from('cv_users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('cv_users')
        .insert({ email, name: personalInfo?.name || '' })
        .select('id')
        .single()
        
      if (createError) throw createError
      user = newUser
    }

    // Upsert cv_form_data
    const { data: existingData } = await supabase
      .from('cv_form_data')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const formData = {
      user_id: user.id,
      personal_info: personalInfo || {},
      work_experience: workExperience || [],
      education: education || [],
      skills: skills || [],
      target_platform: targetPlatform,
      custom_instructions: customInstructions,
      updated_at: new Date().toISOString()
    }

    let saveResult
    if (existingData) {
      saveResult = await supabase
        .from('cv_form_data')
        .update(formData)
        .eq('id', existingData.id)
    } else {
      saveResult = await supabase
        .from('cv_form_data')
        .insert(formData)
    }

    if (saveResult.error) throw saveResult.error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving CV data:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const { data: user } = await supabase
      .from('cv_users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) return NextResponse.json({ data: null })

    const { data: formData } = await supabase
      .from('cv_form_data')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!formData) return NextResponse.json({ data: null })

    // Map snake_case to camelCase
    return NextResponse.json({
      data: {
        personalInfo: formData.personal_info,
        workExperience: formData.work_experience,
        education: formData.education,
        skills: formData.skills,
        targetPlatform: formData.target_platform,
        customInstructions: formData.custom_instructions
      }
    })
  } catch (error) {
    console.error('Error retrieving CV data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
