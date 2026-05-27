import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY")!

const CONFIG = {
  dataFields: ["close", "open", "high", "low", "volume"],
  operators: ["rank", "ts_zscore", "ts_mean", "ts_std", "ts_returns", "ts_rank"],
  lookbacks: [5, 10, 20, 30, 60],
  minSharpe: 1.5,
  maxDrawdown: 0.15,
  universe: [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM",
    "JNJ", "V", "PG", "UNH", "HD", "MA", "BAC", "ABBV", "PFE", "KO",
    "PEP", "WMT", "MRK", "CSCO", "ADBE", "NFLX", "CRM", "ACN", "TMO",
    "AVGO", "COST", "DIS", "ABT", "VZ", "DHR", "CMCSA", "XOM", "TXN",
    "QCOM", "NEE", "BMY", "PM", "RTX", "HON", "UPS", "LIN", "AMGN",
    "LOW", "SPGI", "UNP", "IBM", "GS", "MS"
  ]
}

function generateAlpha() {
  const field = CONFIG.dataFields[Math.floor(Math.random() * CONFIG.dataFields.length)]
  const operator = CONFIG.operators[Math.floor(Math.random() * CONFIG.operators.length)]
  const lookback = CONFIG.lookbacks[Math.floor(Math.random() * CONFIG.lookbacks.length)]
  const transforms = [null, "abs", "sign", "neg"]
  const transform = transforms[Math.floor(Math.random() * transforms.length)]
  let code = `${operator}(${field}, ${lookback})`
  if (transform) code = `${transform}(${code})`
  return { code, field, operator, lookback, transform }
}

function simulateBacktest() {
  const sharpe = Math.random() * 3 - 0.5
  const annualReturn = (Math.random() - 0.3) * 0.4
  const maxDrawdown = -(Math.random() * 0.25 + 0.02)
  const winRate = Math.random() * 0.3 + 0.4
  const turnover = Math.random() * 0.6 + 0.1

  const pnlCurve: number[] = [1.0]
  for (let i = 0; i < 252; i++) {
    pnlCurve.push(pnlCurve[pnlCurve.length - 1] * (1 + (Math.random() - 0.5) * 0.02))
  }

  const ddCurve: number[] = [0]
  let peak = 1.0
  for (let i = 1; i < pnlCurve.length; i++) {
    if (pnlCurve[i] > peak) peak = pnlCurve[i]
    ddCurve.push((pnlCurve[i] - peak) / peak)
  }

  const isPassed = sharpe >= CONFIG.minSharpe && Math.abs(maxDrawdown) <= CONFIG.maxDrawdown && winRate >= 0.52

  return {
    sharpe_ratio: parseFloat(sharpe.toFixed(4)),
    annual_return: parseFloat(annualReturn.toFixed(4)),
    max_drawdown: parseFloat(maxDrawdown.toFixed(4)),
    win_rate: parseFloat(winRate.toFixed(4)),
    turnover: parseFloat(turnover.toFixed(4)),
    status: isPassed ? "passed" : "failed",
    is_passed: isPassed,
    pnl_curve: pnlCurve,
    drawdown_curve: ddCurve,
    fitness_score: parseFloat((sharpe * (1 - Math.abs(maxDrawdown)) * winRate).toFixed(4))
  }
}

async function notifyAlphaFound(supabase: any, alphaId: string, metrics: any) {
  const message = `🧠 *WORLD QUANT LAB ALERT*\n\nAlpha PASSED all criteria!\n\nCode: ${metrics.alpha_code}\nSharpe: ${metrics.sharpe_ratio}\nReturn: ${(metrics.annual_return * 100).toFixed(1)}%\nDrawdown: ${(metrics.max_drawdown * 100).toFixed(1)}%\nWin Rate: ${(metrics.win_rate * 100).toFixed(1)}%\n\nReview: https://m-abbaslab.vercel.app/admin/dashboard`

  await supabase.from("wq_notifications").insert({
    alpha_id: alphaId,
    notification_type: "alpha_passed",
    message_text: message,
    status: "pending"
  })
}

serve(async (req) => {
  const startTime = Date.now()
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    let batchId: string
    const { data: activeBatches } = await supabase
      .from("alpha_batches")
      .select("*")
      .eq("status", "running")
      .limit(1)

    if (!activeBatches || activeBatches.length === 0) {
      const { data: newBatch } = await supabase
        .from("alpha_batches")
        .insert({
          batch_name: `Auto_${new Date().toISOString()}`,
          status: "running",
          data_fields: CONFIG.dataFields,
          operators: CONFIG.operators,
          lookbacks: CONFIG.lookbacks,
          health_status: "healthy"
        })
        .select()
        .single()
      batchId = newBatch.id
    } else {
      batchId = activeBatches[0].id
    }

    const batchSize = 10
    const generatedAlphas: any[] = []
    const passedAlphas: any[] = []

    for (let i = 0; i < batchSize; i++) {
      const alpha = generateAlpha()
      const metrics = simulateBacktest()

      const { data: storedAlpha } = await supabase
        .from("alphas")
        .insert({
          alpha_code: alpha.code,
          alpha_name: `Alpha_${Date.now()}_${i}`,
          data_field: alpha.field,
          operator: alpha.operator,
          lookback: alpha.lookback,
          transform: alpha.transform,
          generation_batch: batchId,
          generation_method: "systematic",
          ...metrics,
          backtest_start: "2020-01-01",
          backtest_end: new Date().toISOString().split("T")[0]
        })
        .select()
        .single()

      generatedAlphas.push(storedAlpha)

      if (metrics.is_passed) {
        passedAlphas.push(storedAlpha)
        await notifyAlphaFound(supabase, storedAlpha.id, { ...metrics, alpha_code: alpha.code })
      }
    }

    await supabase
      .from("alpha_batches")
      .update({
        total_generated: generatedAlphas.length,
        total_tested: generatedAlphas.length,
        total_passed: passedAlphas.length,
        last_heartbeat: new Date().toISOString()
      })
      .eq("id", batchId)

    const duration = Date.now() - startTime

    await supabase.from("wq_health_log").insert({
      component: "alpha_engine",
      status: "healthy",
      message: `Cycle complete: ${generatedAlphas.length} generated, ${passedAlphas.length} passed`,
      details: { duration_ms: duration, batch_id: batchId }
    })

    return new Response(
      JSON.stringify({ success: true, batch_id: batchId, generated: generatedAlphas.length, passed: passedAlphas.length, duration_ms: duration }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    await supabase.from("wq_health_log").insert({
      component: "alpha_engine",
      status: "critical",
      message: error.message,
      details: { stack: error.stack }
    })

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
