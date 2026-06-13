import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''

export async function POST(request: NextRequest) {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: 'Paystack secret not configured' }, { status: 500 })
  }

  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Paystack verification failed: ${response.statusText}`)
    }

    const { data } = await response.json()

    if (data.status === 'success') {
      const generationId = data.metadata.generationId

      // Update generation
      await supabase
        .from('cv_generations')
        .update({
          is_paid: true,
          status: 'paid',
          payment_status: 'success',
          payment_reference: reference,
          payment_id: String(data.id),
          paid_at: data.paid_at
        })
        .eq('id', generationId)

      // Update transaction
      await supabase
        .from('paystack_transactions')
        .update({
          status: 'success',
          payment_method: data.channel
        })
        .eq('reference', reference)

      return NextResponse.json({ success: true })
    } else {
      // Update transaction as failed or abandoned
      await supabase
        .from('paystack_transactions')
        .update({
          status: data.status
        })
        .eq('reference', reference)

      return NextResponse.json({ error: `Payment not successful: ${data.status}` }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
