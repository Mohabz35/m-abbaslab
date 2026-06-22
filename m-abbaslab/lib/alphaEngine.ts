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
  complexity: 'simple' | 'compound' | 'nested'
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
  dataFields: ["close", "open", "high", "low", "volume", "returns", "vwap", "spread"],
  operators: ["rank", "ts_zscore", "ts_mean", "ts_std", "ts_returns", "ts_rank", "delta", "ts_corr", "ts_cov", "ts_min", "ts_max", "ts_argmin", "ts_argmax", "decay_linear", "ts_sum"],
  lookbacks: [5, 10, 15, 20, 30, 40, 60],
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Expression Generators ─────────────────────────────────────────────────────

function genSimple(config: AlphaConfig): { code: string; field: string; operator: string; lookback: number } {
  const field = pick(config.dataFields)
  const operator = pick(config.operators)
  const lookback = pick(config.lookbacks)
  return { code: `${operator}(${field}, ${lookback})`, field, operator, lookback }
}

function genCompound(config: AlphaConfig): { code: string; field: string; operator: string; lookback: number } {
  const field1 = pick(config.dataFields)
  const field2 = pick(config.dataFields)
  const op1 = pick(config.operators)
  const op2 = pick(config.operators)
  const lb1 = pick(config.lookbacks)
  const lb2 = pick(config.lookbacks)

  const templates = [
    `${op1}(${field1}, ${lb1}) - ${op2}(${field2}, ${lb2})`,
    `${op1}(${field1}, ${lb1}) * ${op2}(${field2}, ${lb2})`,
    `${op1}(${field1}, ${lb1}) / (${op2}(${field2}, ${lb2}) + 0.001)`,
    `rank(${op1}(${field1}, ${lb1})) - rank(${op2}(${field2}, ${lb2}))`,
    `delta(${op1}(${field1}, ${lb1}), ${lb2})`,
    `ts_corr(${field1}, ${field2}, ${lb1})`,
    `ts_cov(${field1}, ${field2}, ${lb1})`,
  ]
  return { code: pick(templates), field: field1, operator: op1, lookback: lb1 }
}

function genNested(config: AlphaConfig): { code: string; field: string; operator: string; lookback: number } {
  const field = pick(config.dataFields)
  const field2 = pick(config.dataFields)
  const op1 = pick(config.operators)
  const op2 = pick(config.operators)
  const op3 = pick(config.operators)
  const lb1 = pick(config.lookbacks)
  const lb2 = pick(config.lookbacks)
  const lb3 = pick(config.lookbacks)

  const templates = [
    `${op1}(${op2}(${field}, ${lb1}) - ${op3}(${field2}, ${lb2}), ${lb3})`,
    `rank(${op1}(${field}, ${lb1})) * rank(${op2}(${field2}, ${lb2}))`,
    `${op1}(${op2}(${field}, ${lb1}), ${lb2}) - ${op3}(${field}, ${lb3})`,
    `decay_linear(${op1}(${field}, ${lb1}), ${lb2})`,
    `ts_rank(${op1}(${field}, ${lb1}), ${lb2})`,
  ]
  return { code: pick(templates), field, operator: op1, lookback: lb1 }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateAlpha(config: AlphaConfig = DEFAULT_CONFIG): AlphaExpression {
  const complexityRoll = Math.random()
  let result: { code: string; field: string; operator: string; lookback: number }
  let complexity: 'simple' | 'compound' | 'nested'

  if (complexityRoll < 0.3) {
    result = genSimple(config)
    complexity = 'simple'
  } else if (complexityRoll < 0.75) {
    result = genCompound(config)
    complexity = 'compound'
  } else {
    result = genNested(config)
    complexity = 'nested'
  }

  const transforms = [null, "abs", "sign", "neg", "log"]
  const transform = pick(transforms) as string | null
  let code = result.code
  if (transform) code = `${transform}(${code})`

  return { code, field: result.field, operator: result.operator, lookback: result.lookback, transform, hash: hashCode(code), complexity }
}

export function simulateBacktest(alpha: AlphaExpression, config: AlphaConfig = DEFAULT_CONFIG): AlphaMetrics {
  // Simulate metrics with bias based on expression complexity
  const complexityBonus = alpha.complexity === 'nested' ? 0.15 : alpha.complexity === 'compound' ? 0.08 : 0
  const transformBonus = alpha.transform ? 0.05 : 0

  const sharpe = Math.random() * 2.5 + 0.1 + complexityBonus + transformBonus
  const annualReturn = (Math.random() - 0.25) * 0.5 + complexityBonus * 0.1
  const maxDrawdown = -(Math.random() * 0.25 + 0.02)
  const winRate = Math.random() * 0.35 + 0.4 + complexityBonus * 0.05
  const turnover = Math.random() * 0.6 + 0.1

  // Generate realistic PnL curve with momentum and mean-reversion regimes
  const pnlCurve: number[] = [1.0]
  const regimeLength = 20 + Math.floor(Math.random() * 40)
  let regime = 1 // 1 = up, -1 = down
  let regimeCounter = 0
  for (let i = 0; i < 252; i++) {
    regimeCounter++
    if (regimeCounter > regimeLength) {
      regime *= -1
      regimeCounter = 0
    }
    const drift = regime * 0.0003 * sharpe
    const vol = 0.012 + Math.random() * 0.008
    const dailyReturn = drift + (Math.random() - 0.5) * vol
    pnlCurve.push(pnlCurve[pnlCurve.length - 1] * (1 + dailyReturn))
  }

  // Drawdown curve
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
