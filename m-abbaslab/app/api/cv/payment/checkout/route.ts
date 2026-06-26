import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''
const AMOUNT_IN_KOBO = 1000 * 100 // 1000 NGN

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = checkRateLimit(`cv-pay:${ip}`, 5, 300000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: 'Paystack secret not configured' }, { status: 500 })
  }

  try {
    const { email, generationId } = await request.json()

    if (!email || !generationId) {
      return NextResponse.json({ error: 'Email and generationId are required' }, { status: 400 })
    }

    const { data: generation, error: genError } = await supabase
      .from('cv_generations')
      .select('id, user_id, is_paid')
      .eq('id', generationId)
      .single()

    if (genError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    if (generation.is_paid) {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }

    const reference = `cv_${generationId}_${Date.now()}`

    const payload = {
      email,
      amount: AMOUNT_IN_KOBO,
      reference,
      metadata: {
        userId: generation.user_id,
        generationId,
      },
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errData = await response.text()
      throw new Error(`Paystack initialization failed: ${errData}`)
    }

    const data = await response.json()

    // Create pending transaction in db
    await supabase.from('paystack_transactions').insert({
      user_id: generation.user_id,
      cv_generation_id: generationId,
      reference,
      amount: AMOUNT_IN_KOBO,
      currency: 'NGN',
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
