import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateAlpha, simulateBacktest } from '@/lib/alphaEngine'

const CRON_SECRET = process.env.CRONT_SECRET || process.env.CRON_SECRET || ''

const UNIVERSE = 'AAPL,MSFT,GOOGL,AMZN,TSLA,META,NVDA,JPM,JNJ,V,PG,UNH,HD,MA,BAC,ABBV,PFE,KO,PEP,WMT,MRK,CSCO,ADBE,NFLX,CRM,ACN,TMO,AVGO,COST,DIS,ABT,VZ,DHR,CMCSA,XOM,TXN,QCOM,NEE,BMY,PM,RTX,HON,UPS,LIN,AMGN,LOW,SPGI,UNP,IBM,GS,MS'

export async function GET(request: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    console.log('[CRON] Alpha engine batch started')

    const BATCH_SIZE = 20
    const batch: Array<{
      expression: string
      alpha_code: string
      alpha_name: string
      sharpe_ratio: number
      annual_return: number
      max_drawdown: number
      win_rate: number
      turnover: number
      fitness_score: number
      status: string
      is_passed: boolean
      universe: string
      pnl_curve: number[]
      drawdown_curve: number[]
      created_at: string
    }> = []

    const hashes = new Set<string>()
    let attempts = 0
    const maxAttempts = BATCH_SIZE * 15

    while (batch.length < BATCH_SIZE && attempts < maxAttempts) {
      attempts++
      const alpha = generateAlpha()

      if (hashes.has(alpha.hash)) continue
      hashes.add(alpha.hash)

      const metrics = simulateBacktest(alpha)
      const ticker = `ALPHA-${alpha.hash.toUpperCase()}`

      batch.push({
        expression: alpha.code,
        alpha_code: ticker,
        alpha_name: `${alpha.operator}(${alpha.field}, ${alpha.lookback})${alpha.transform ? ` [${alpha.transform}]` : ''}`,
        sharpe_ratio: metrics.sharpe_ratio,
        annual_return: metrics.annual_return,
        max_drawdown: metrics.max_drawdown,
        win_rate: metrics.win_rate,
        turnover: metrics.turnover,
        fitness_score: metrics.fitness_score,
        status: metrics.is_passed ? 'passed' : 'failed',
        is_passed: metrics.is_passed,
        universe: UNIVERSE,
        pnl_curve: metrics.pnl_curve,
        drawdown_curve: metrics.drawdown_curve,
        created_at: new Date().toISOString()
      })
    }

    let stored = 0
    for (const alpha of batch) {
      const { error } = await supabase.from('alphas').insert(alpha)
      if (!error) stored++
      else console.error('[CRON] Insert error:', error.message)
    }

    const passed = batch.filter(a => a.is_passed).length

    await supabase.from('alpha_batches').insert({
      batch_size: batch.length,
      stored_count: stored,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })

    console.log(`[CRON] Alpha batch done: ${stored}/${batch.length} stored, ${passed} passed`)

    return NextResponse.json({
      success: true,
      message: `Generated ${batch.length} alphas, stored ${stored}, ${passed} passed`,
      generated: batch.length,
      stored,
      passed,
      failed: batch.length - passed
    })
  } catch (error: any) {
    console.error('[CRON] Alpha engine error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
