export interface AlphaConfig {
  dataFields: string[]
  operators: string[]
  lookbacks: number[]
  minSharpe: number
  maxDrawdown: number
  minWinRate: number
  maxTurnover: number
  universe: string[]
}

export interface AlphaExpression {
  code: string
  field: string
  operator: string
  lookback: number
  transform: string | null
  hash: string
}

export interface AlphaMetrics {
  sharpe_ratio: number
  annual_return: number
  max_drawdown: number
  win_rate: number
  turnover: number
  fitness_score: number
  status: "passed" | "failed"
  is_passed: boolean
  pnl_curve: number[]
  drawdown_curve: number[]
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

function hashCode(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8)
}

export function generateAlpha(config: AlphaConfig = DEFAULT_CONFIG): AlphaExpression {
  const field = config.dataFields[Math.floor(Math.random() * config.dataFields.length)]
  const operator = config.operators[Math.floor(Math.random() * config.operators.length)]
  const lookback = config.lookbacks[Math.floor(Math.random() * config.lookbacks.length)]
  const transforms = [null, "abs", "sign", "neg"]
  const transform = transforms[Math.floor(Math.random() * transforms.length)] as string | null

  let code = `${operator}(${field}, ${lookback})`
  if (transform) code = `${transform}(${code})`

  return { code, field, operator, lookback, transform, hash: hashCode(code) }
}

export function simulateBacktest(alpha: AlphaExpression, config: AlphaConfig = DEFAULT_CONFIG): AlphaMetrics {
  const sharpe = Math.random() * 3 - 0.5
  const annualReturn = (Math.random() - 0.3) * 0.4
  const maxDrawdown = -(Math.random() * 0.25 + 0.02)
  const winRate = Math.random() * 0.3 + 0.4
  const turnover = Math.random() * 0.6 + 0.1

  const pnlCurve: number[] = [1.0]
  for (let i = 0; i < 252; i++) {
    const dailyReturn = (Math.random() - 0.5) * 0.02
    pnlCurve.push(pnlCurve[pnlCurve.length - 1] * (1 + dailyReturn))
  }

  const ddCurve: number[] = [0]
  let peak = 1.0
  for (let i = 1; i < pnlCurve.length; i++) {
    if (pnlCurve[i] > peak) peak = pnlCurve[i]
    ddCurve.push((pnlCurve[i] - peak) / peak)
  }

  const isPassed = sharpe >= config.minSharpe && Math.abs(maxDrawdown) <= config.maxDrawdown && winRate >= config.minWinRate

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

export function generateBatch(batchSize: number = 10, config: AlphaConfig = DEFAULT_CONFIG): Array<{ alpha: AlphaExpression; metrics: AlphaMetrics }> {
  const generatedHashes = new Set<string>()
  const results: Array<{ alpha: AlphaExpression; metrics: AlphaMetrics }> = []
  let attempts = 0
  const maxAttempts = batchSize * 10

  while (results.length < batchSize && attempts < maxAttempts) {
    attempts++
    const alpha = generateAlpha(config)
    if (!generatedHashes.has(alpha.hash)) {
      generatedHashes.add(alpha.hash)
      const metrics = simulateBacktest(alpha, config)
      results.push({ alpha, metrics })
    }
  }

  return results
}
