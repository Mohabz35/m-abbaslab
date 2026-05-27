import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { generateBatch, AlphaExpression, AlphaMetrics } from '@/lib/alphaEngine'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
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
              batch_name: `Manual_${new Date().toISOString().replace(/[:.]/g, '-')}`,
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

      // Generate alphas
      const results = generateBatch(size)
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
                generation_method: 'systematic',
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
                  message_text: `🧠 WORLD QUANT LAB ALERT\n\nAlpha PASSED all criteria!\n\nCode: ${alpha.code}\nSharpe: ${metrics.sharpe_ratio}\nReturn: ${(metrics.annual_return * 100).toFixed(1)}%\nDrawdown: ${(metrics.max_drawdown * 100).toFixed(1)}%\nWin Rate: ${(metrics.win_rate * 100).toFixed(1)}%\n\nReview: https://m-abbaslab.vercel.app/admin/dashboard`,
                  status: 'pending'
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
            message: `Manual cycle: ${results.length} generated, ${passedAlphas.length} passed`,
            details: { batch_id: batchId }
          })
      }

      await logAudit('WQ_BATCH_RUN', `World Quant batch completed: ${results.length} generated, ${passedAlphas.length} passed. DB: ${dbSaved}`)

      return NextResponse.json({
        success: true,
        batch_id: batchId,
        generated: results.length,
        passed: passedAlphas.length,
        message: passedAlphas.length > 0
          ? `Batch complete! ${passedAlphas.length} alphas passed criteria. JARVIS will notify via WhatsApp.`
          : 'Batch complete. No alphas passed the threshold criteria this round.'
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
      return NextResponse.json({ success: true, message: 'Engine stopped.' })

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

      await logAudit('WQ_SUBMIT', `Alpha ${alphaId} submitted to World Quant`)
      return NextResponse.json({ success: true, message: 'Alpha submitted to World Quant.' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update alpha' }, { status: 500 })
  }
}
