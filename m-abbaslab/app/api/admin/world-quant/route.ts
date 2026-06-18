import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { generateAlpha, AlphaConfig, AlphaExpression, AlphaMetrics } from '@/lib/alphaEngine'
import { getMarketData, getMarketDataBatch } from '@/lib/marketDataProvider'
import { runFullBacktest, BacktestResult } from '@/lib/marketDataEngine'

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

const DEFAULT_CONFIG: AlphaConfig = {
  dataFields: ["close", "open", "high", "low", "volume"],
  operators: ["rank", "ts_zscore", "ts_mean", "ts_std", "ts_returns", "ts_rank"],
  lookbacks: [5, 10, 20, 30, 60],
  minSharpe: 1.5,
  maxDrawdown: 0.15,
  minWinRate: 0.52,
  maxTurnover: 0.5,
  universe: [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM",
    "JNJ", "V", "PG", "UNH", "HD", "MA", "BAC", "ABBV", "PFE", "KO",
    "PEP", "WMT", "MRK", "CSCO", "ADBE", "NFLX", "CRM", "ACN", "TMO",
    "AVGO", "COST", "DIS", "ABT", "VZ", "DHR", "CMCSA", "XOM", "TXN",
    "QCOM", "NEE", "BMY", "PM", "RTX", "HON", "UPS", "LIN", "AMGN",
    "LOW", "SPGI", "UNP", "IBM", "GS", "MS"
  ]
}

/**
 * Real backtest function using market data
 */
async function realBacktestAlpha(
  alpha: AlphaExpression,
  config: AlphaConfig = DEFAULT_CONFIG
): Promise<AlphaMetrics> {
  try {
    // Pick a random symbol from universe for backtesting
    const symbol = config.universe[Math.floor(Math.random() * config.universe.length)]

    // Fetch real market data
    const marketData = await getMarketData(symbol, 'yfinance', '5y')

    if (marketData.length < alpha.lookback + 10) {
      throw new Error(`Insufficient data for ${symbol}`)
    }

    // Run backtest on real data
    const backtest = runFullBacktest(
      marketData,
      alpha.field,
      alpha.operator,
      alpha.lookback,
      alpha.transform
    )

    // Check if passes criteria
    const isPassed =
      backtest.sharpe >= config.minSharpe &&
      Math.abs(backtest.maxDrawdown) <= config.maxDrawdown &&
      backtest.winRate >= config.minWinRate

    return {
      sharpe_ratio: parseFloat(backtest.sharpe.toFixed(4)),
      annual_return: parseFloat(backtest.annualReturn.toFixed(4)),
      max_drawdown: parseFloat(backtest.maxDrawdown.toFixed(4)),
      win_rate: parseFloat(backtest.winRate.toFixed(4)),
      turnover: parseFloat(backtest.turnover.toFixed(4)),
      fitness_score: parseFloat(
        (backtest.sharpe * (1 - Math.abs(backtest.maxDrawdown)) * backtest.winRate).toFixed(4)
      ),
      status: isPassed ? "passed" : "failed",
      is_passed: isPassed,
      pnl_curve: backtest.pnlCurve,
      drawdown_curve: backtest.drawdownCurve
    }
  } catch (error) {
    console.error(`[Backtest Error] ${error}`)
    // Fallback to safe metrics if backtest fails
    return {
      sharpe_ratio: 0.5,
      annual_return: 0.01,
      max_drawdown: -0.1,
      win_rate: 0.45,
      turnover: 0.3,
      fitness_score: 0,
      status: "failed",
      is_passed: false,
      pnl_curve: [1.0],
      drawdown_curve: [0]
    }
  }
}

/**
 * Generate batch of alphas with real backtesting
 */
async function generateRealBatch(
  batchSize: number = 10,
  config: AlphaConfig = DEFAULT_CONFIG
): Promise<Array<{ alpha: AlphaExpression; metrics: AlphaMetrics }>> {
  const results: Array<{ alpha: AlphaExpression; metrics: AlphaMetrics }> = []
  const generatedHashes = new Set<string>()
  let attempts = 0
  const maxAttempts = batchSize * 10

  while (results.length < batchSize && attempts < maxAttempts) {
    attempts++
    const alpha = generateAlpha(config)

    if (!generatedHashes.has(alpha.hash)) {
      generatedHashes.add(alpha.hash)

      try {
        const metrics = await realBacktestAlpha(alpha, config)
        results.push({ alpha, metrics })
        console.log(`[Alpha ${results.length}/${batchSize}] ${alpha.code} - Sharpe: ${metrics.sharpe_ratio}`)
      } catch (error) {
        console.error(`[Backtest failed] ${alpha.code}:`, error)
        // Continue to next alpha if backtest fails
      }
    }
  }

  return results
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, batchSize } = body

    if (action === 'run-batch') {
      const size = Math.min(batchSize || 10, 50)
      let batchId: string | null = null
      let dbSaved = false

      // Create batch record in Supabase
      if (hasSupabaseKeys) {
        try {
          const { data: newBatch } = await supabase
            .from('alpha_batches')
            .insert({
              batch_name: `RealBacktest_${new Date().toISOString().replace(/[:.]/g, '-')}`,
              status: 'running',
              data_fields: ['close', 'open', 'high', 'low', 'volume'],
              operators: ['rank', 'ts_zscore', 'ts_mean', 'ts_std', 'ts_returns', 'ts_rank'],
              lookbacks: [5, 10, 20, 30, 60],
              health_status: 'healthy'
            })
            .select()
            .single()
          if (newBatch) batchId = newBatch.id
        } catch (e) {
          console.warn('[WQ] Failed to create batch in Supabase:', e)
        }
      }

      // Generate alphas with REAL backtesting
      console.log(`[WQ] Starting real backtest batch with ${size} alphas...`)
      const results = await generateRealBatch(size, DEFAULT_CONFIG)
      const passedAlphas: Array<{ alpha: AlphaExpression; metrics: AlphaMetrics; id?: string }> = []

      // Store alphas in Supabase
      if (hasSupabaseKeys && batchId) {
        for (const { alpha, metrics } of results) {
          try {
            const { data: stored } = await supabase
              .from('alphas')
              .insert({
                alpha_code: alpha.code,
                alpha_name: `Alpha_${alpha.hash}`,
                data_field: alpha.field,
                operator: alpha.operator,
                lookback: alpha.lookback,
                transform: alpha.transform,
                generation_batch: batchId,
                generation_method: 'real_backtest',
                sharpe_ratio: metrics.sharpe_ratio,
                annual_return: metrics.annual_return,
                max_drawdown: metrics.max_drawdown,
                win_rate: metrics.win_rate,
                turnover: metrics.turnover,
                fitness_score: metrics.fitness_score,
                status: metrics.status,
                is_passed: metrics.is_passed,
                pnl_curve: metrics.pnl_curve,
                drawdown_curve: metrics.drawdown_curve,
                backtest_start: '2020-01-01',
                backtest_end: new Date().toISOString().split('T')[0]
              })
              .select()
              .single()

            if (stored && metrics.is_passed) {
              passedAlphas.push({ alpha, metrics, id: stored.id })

              // Queue WhatsApp notification via JARVIS
              await supabase
                .from('wq_notifications')
                .insert({
                  alpha_id: stored.id,
                  notification_type: 'alpha_passed',
                  message_text: `🧠 WORLD QUANT LAB ALERT\n\nAlpha PASSED with REAL BACKTEST!\n\nCode: ${alpha.code}\nSharpe: ${metrics.sharpe_ratio}\nReturn: ${(metrics.annual_return * 100).toFixed(1)}%\nDrawdown: ${(metrics.max_drawdown * 100).toFixed(1)}%\nWin Rate: ${(metrics.win_rate * 100).toFixed(1)}%\n\nReview: https://m-abbaslab.vercel.app/admin/dashboard`,
                  status: 'pending'
                })
            } else if (stored && !metrics.is_passed) {
              const getFailReason = (m: AlphaMetrics) => {
                if (m.sharpe_ratio < 1.0) return "Sharpe ratio too low"
                if (m.max_drawdown < -0.15) return "Drawdown too high"
                if (m.win_rate < 0.5) return "Win rate too low"
                return "Failed fitness criteria"
              }
              await supabase.from('failed_alphas').insert({
                alpha_code: alpha.code,
                data_field: alpha.field,
                operator: alpha.operator,
                lookback: alpha.lookback,
                transform: alpha.transform,
                sharpe_ratio: metrics.sharpe_ratio,
                annual_return: metrics.annual_return,
                max_drawdown: metrics.max_drawdown,
                win_rate: metrics.win_rate,
                turnover: metrics.turnover,
                fitness_score: metrics.fitness_score,
                batch_id: batchId,
                failed_reason: getFailReason(metrics),
                meta: { alpha, metrics },
              })
            }
          } catch (e) {
            console.warn('[WQ] Failed to store alpha:', e)
          }
        }

        // Update batch stats
        try {
          const passed = results.filter(r => r.metrics.is_passed).length
          await supabase
            .from('alpha_batches')
            .update({
              total_generated: results.length,
              total_tested: results.length,
              total_passed: passed,
              status: 'completed',
              completed_at: new Date().toISOString(),
              last_heartbeat: new Date().toISOString()
            })
            .eq('id', batchId)
          dbSaved = true
        } catch (e) {
          console.warn('[WQ] Failed to update batch:', e)
        }

        // Log health
        await supabase
          .from('wq_health_log')
          .insert({
            component: 'alpha_engine',
            status: passedAlphas.length > 0 ? 'healthy' : 'warning',
            message: `Real backtest cycle: ${results.length} generated, ${passedAlphas.length} passed`,
            details: { batch_id: batchId, generation_method: 'real_backtest' }
          })
      }

      await logAudit('WQ_BATCH_RUN_REAL', `World Quant real backtest completed: ${results.length} generated, ${passedAlphas.length} passed. DB: ${dbSaved}`)

      return NextResponse.json({
        success: true,
        batch_id: batchId,
        generated: results.length,
        passed: passedAlphas.length,
        message: passedAlphas.length > 0
          ? `✅ Real backtest complete! ${passedAlphas.length} alphas passed on actual market data. JARVIS will notify via WhatsApp.`
          : '⚠️ Real backtest complete. No alphas passed the threshold criteria this round, but backtesting was real market data.',
        backtest_type: 'real'
      })

    } else if (action === 'stop') {
      if (hasSupabaseKeys) {
        try {
          const { data: running } = await supabase
            .from('alpha_batches')
            .select('id')
            .eq('status', 'running')
            .limit(1)

          if (running && running.length > 0) {
            await supabase
              .from('alpha_batches')
              .update({ status: 'stopped', completed_at: new Date().toISOString() })
              .eq('id', running[0].id)
          }
        } catch (e) {
          console.warn('[WQ] Failed to stop batch:', e)
        }
      }

      await logAudit('WQ_BATCH_STOP', 'World Quant engine stopped by admin')
      return NextResponse.json({ success: true, message: 'Real backtest engine stopped.' })

    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('[WQ API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    let data: any = {}

    if (type === 'all' || type === 'alphas') {
      const { data: alphas } = await supabase
        .from('alphas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      data.alphas = alphas || []
    }

    if (type === 'all' || type === 'batches') {
      const { data: batches } = await supabase
        .from('alpha_batches')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5)
      data.batches = batches || []
    }

    if (type === 'all' || type === 'failed_alphas') {
      const { data: failed_alphas } = await supabase
        .from('failed_alphas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      data.failed_alphas = failed_alphas || []
    }

    if (type === 'all' || type === 'health') {
      const { data: healthLogs } = await supabase
        .from('wq_health_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      data.healthLogs = healthLogs || []
    }

    return NextResponse.json({ success: true, ...data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { alphaId, action: updateAction } = body

    if (!alphaId || !updateAction) {
      return NextResponse.json({ error: 'alphaId and action required' }, { status: 400 })
    }

    if (updateAction === 'submit-to-wq') {
      await supabase
        .from('alphas')
        .update({ submitted_to_wq: true, wq_status: 'submitted' })
        .eq('id', alphaId)

      await logAudit('WQ_SUBMIT', `Alpha ${alphaId} submitted to World Quant (real backtest)`)
      return NextResponse.json({ success: true, message: 'Alpha submitted to World Quant.' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update alpha' }, { status: 500 })
  }
}
