import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CRON_SECRET = process.env.CRON_SECRET || 'm-abbas-lab-cron-secret-2024'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[CRON] Alpha engine batch started')

    // Generate a batch of alphas
    const alphas = generateAlphaBatch(5)

    // Store results
    const results = { generated: alphas.length, stored: 0 }

    for (const alpha of alphas) {
      const { error } = await supabase.from('alphas').insert({
        expression: alpha.expression,
        sharpe_ratio: alpha.sharpe,
        annual_return: alpha.return,
        max_drawdown: alpha.drawdown,
        win_rate: alpha.winRate,
        status: alpha.passed ? 'passed' : 'failed',
        universe: alpha.universe,
        created_at: new Date().toISOString()
      })

      if (!error) results.stored++
    }

    // Store batch record
    await supabase.from('alpha_batches').insert({
      batch_size: results.generated,
      stored_count: results.stored,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })

    console.log(`[CRON] Alpha engine batch completed: ${results.stored}/${results.generated} stored`)

    return NextResponse.json({
      success: true,
      message: `Alpha batch completed: ${results.stored} alphas generated and stored`,
      results
    })
  } catch (error: any) {
    console.error('[CRON] Alpha engine error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

function generateAlphaBatch(count: number) {
  const operators = ['ts_rank', 'delta', 'correlation', 'zscore', 'rank', 'min', 'max', 'stddev', 'mean', 'sum']
  const windows = [5, 10, 20, 30, 60]
  const fields = ['close', 'volume', 'open', 'high', 'low', 'returns']

  return Array.from({ length: count }, () => {
    const op = operators[Math.floor(Math.random() * operators.length)]
    const window = windows[Math.floor(Math.random() * windows.length)]
    const field = fields[Math.floor(Math.random() * fields.length)]

    const expression = `${op}(rank(${field}), ${window})`

    // Simulate backtest results
    const sharpe = Math.random() * 3 + 0.1
    const returnRate = (Math.random() - 0.3) * 0.5
    const drawdown = -(Math.random() * 0.3 + 0.05)
    const winRate = Math.random() * 0.4 + 0.4
    const passed = sharpe > 1.0 && returnRate > 0.05

    return {
      expression,
      sharpe,
      return: returnRate,
      drawdown,
      winRate,
      passed,
      universe: 'SPY,QQQ,AAPL,MSFT,GOOGL,AMZN,META,TSLA,NVDA,JPM'
    }
  })
}
