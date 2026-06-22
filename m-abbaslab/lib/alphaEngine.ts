export interface AlphaConfig {
  dataFields: string[]
  operators: string[]
  groupOperators: string[]
  lookbacks: number[]
  minSharpe: number
  maxDrawdown: number
  minWinRate: number
  maxTurnover: number
  universe: string[]
  sectors: Record<string, string[]>
}

export interface AlphaExpression {
  code: string
  field: string
  operator: string
  lookback: number
  transform: string | null
  hash: string
  order: 1 | 2 | 3
  decay: number
  delay: number
  groupNeutralized: boolean
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

// ── WorldQuant-style Configuration ────────────────────────────────────────────

const SECTORS: Record<string, string[]> = {
  Technology: ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "ADBE", "NFLX", "CRM", "ACN", "AVGO", "CSCO", "QCOM", "TXN", "IBM"],
  Finance: ["JPM", "V", "MA", "BAC", "GS", "MS", "SPGI", "ABBV"],
  Healthcare: ["JNJ", "UNH", "PFE", "MRK", "ABT", "DHR", "TMO", "AMGN", "BMY"],
  Consumer: ["PG", "KO", "PEP", "WMT", "COST", "HD", "LOW", "DIS", "MCD", "NKE"],
  Energy: ["XOM", "CVX", "COP", "SLB", "EOG"],
  Industrial: ["HON", "UPS", "RTX", "BA", "CAT", "DE", "UNP", "LMT"],
  Telecom: ["VZ", "T", "CMCSA", "DIS"],
  RealEstate: ["AMT", "PLD", "CCI", "EQIX"],
}

const UNIVERSE = Object.values(SECTORS).flat()

const DATA_FIELDS = [
  "close", "open", "high", "low", "volume", "returns", "vwap",
  "amount", "turn", "adv20", "adv60", "high_low_spread", "close_open_return",
  "volume_ma_ratio", "price_momentum_5", "price_momentum_20",
]

const TS_OPERATORS = [
  "ts_rank", "ts_zscore", "ts_mean", "ts_std_dev", "ts_delta",
  "ts_arg_max", "ts_arg_min", "ts_corr", "ts_cov", "ts_sum",
  "ts_min", "ts_max", "ts_backfill",
]

const CROSS_SECTIONAL_OPS = ["rank", "zscore", "quantile", "scale"]

const GROUP_OPS = ["group_neutralize", "group_rank", "group_zscore"]

const MATH_OPS = ["abs", "sign", "neg", "log1p", "signed_power"]

const LOOKBACKS = [5, 10, 22, 66, 120, 240]

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
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

function getSector(ticker: string): string {
  for (const [sector, tickers] of Object.entries(SECTORS)) {
    if (tickers.includes(ticker)) return sector
  }
  return "Unknown"
}

// ── Preprocessing (WorldQuant-style) ──────────────────────────────────────────

function preprocessField(field: string): string {
  return `winsorize(ts_backfill(${field}, 120), std=4)`
}

// ── 1st Order: Simple field transformations ───────────────────────────────────

function genFirstOrder(): { code: string; field: string; operator: string; lookback: number } {
  const field = pick(DATA_FIELDS)
  const rawField = preprocessField(field)
  const op = pick(TS_OPERATORS)
  const lb = pick(LOOKBACKS)

  const templates = [
    `${op}(${rawField}, ${lb})`,
    `rank(${rawField})`,
    `zscore(${rawField})`,
    `delta(${rawField}, ${lb})`,
    `ts_rank(${rawField}, ${lb})`,
    `ts_zscore(${rawField}, ${lb})`,
    `decay_linear(${rawField}, ${lb})`,
    `rank(delta(${rawField}, ${lb}))`,
    `rank(ts_corr(${rawField}, ${pick(DATA_FIELDS)}, ${lb}))`,
    `ts_std_dev(${rawField}, ${lb})`,
  ]

  return { code: pick(templates), field, operator: op, lookback: lb }
}

// ── 2nd Order: Group-neutralized alphas ───────────────────────────────────────

function genSecondOrder(): { code: string; field: string; operator: string; lookback: number } {
  const first = genFirstOrder()
  const groupOp = pick(GROUP_OPS)
  const groupField = pick(["sector", "subindustry", "country", "market_cap_bucket"])

  const templates = [
    `${groupOp}(${first.code}, ${groupField})`,
    `${groupOp}(${first.code}, sector) + rank(delta(${pick(DATA_FIELDS)}, ${pick(LOOKBACKS)}))`,
    `rank(${first.code}) * (1 + ${groupOp}(rank(${pick(DATA_FIELDS)}), sector))`,
    `${groupOp}(rank(${first.code}), ${groupField})`,
    `rank(${first.code}) - ${groupOp}(rank(${first.code}), ${groupField})`,
  ]

  return { code: pick(templates), field: first.field, operator: first.operator, lookback: first.lookback }
}

// ── 3rd Order: Conditional trade_when alphas ──────────────────────────────────

function genThirdOrder(): { code: string; field: string; operator: string; lookback: number } {
  const second = genSecondOrder()

  const eventField = pick(DATA_FIELDS)
  const eventOp = pick(["ts_rank", "ts_mean", "ts_std_dev", "ts_corr"])
  const eventLb = pick(LOOKBACKS)
  const threshold = pick([">", "<", ">=", "<="])
  const thresholdVal = pick(["adv20", "ts_mean(volume, 60)", "0", "1", "ts_rank(volume, 20)"])

  const event = `${eventOp}(${eventField}, ${eventLb}) ${threshold} ${thresholdVal}`
  const exitCondition = pick(["-1", "1", "0", `ts_rank(${eventField}, ${eventLb})`])

  return {
    code: `trade_when(${event}, ${second.code}, ${exitCondition})`,
    field: second.field,
    operator: second.operator,
    lookback: second.lookback,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateAlpha(config?: Partial<AlphaConfig>): AlphaExpression {
  const orderRoll = Math.random()
  let result: { code: string; field: string; operator: string; lookback: number }
  let order: 1 | 2 | 3

  if (orderRoll < 0.4) {
    result = genFirstOrder()
    order = 1
  } else if (orderRoll < 0.75) {
    result = genSecondOrder()
    order = 2
  } else {
    result = genThirdOrder()
    order = 3
  }

  const transforms = [null, "abs", "sign", "neg"]
  const transform = pick(transforms) as string | null
  let code = result.code
  if (transform) code = `${transform}(${code})`

  return {
    code,
    field: result.field,
    operator: result.operator,
    lookback: result.lookback,
    transform,
    hash: hashCode(code),
    order,
    decay: pick([0, 3, 5, 10]),
    delay: pick([0, 1]),
    groupNeutralized: order >= 2,
  }
}

export function simulateBacktest(alpha: AlphaExpression, config?: Partial<AlphaConfig>): AlphaMetrics {
  const cfg: AlphaConfig = {
    dataFields: DATA_FIELDS,
    operators: TS_OPERATORS,
    groupOperators: GROUP_OPS,
    lookbacks: LOOKBACKS,
    minSharpe: 1.2,
    maxDrawdown: 0.25,
    minWinRate: 0.50,
    maxTurnover: 0.5,
    universe: UNIVERSE,
    sectors: SECTORS,
    ...config,
  }

  const orderBonus = alpha.order === 3 ? 0.25 : alpha.order === 2 ? 0.15 : 0
  const decayPenalty = alpha.decay > 5 ? -0.05 : 0
  const delayPenalty = alpha.delay > 0 ? -0.08 : 0

  const sharpe = Math.max(0.1, Math.random() * 3.0 + 0.3 + orderBonus + decayPenalty + delayPenalty)
  const annualReturn = (Math.random() - 0.15) * 0.4 + orderBonus * 0.08
  const winRate = Math.max(0.38, Math.random() * 0.30 + 0.42 + orderBonus * 0.05)
  const turnover = Math.random() * 0.6 + 0.1

  // Generate PnL curve with regime switching
  const pnlCurve: number[] = [1.0]
  const regimeLen = 15 + Math.floor(Math.random() * 45)
  let regime = 1
  let regimeCtr = 0
  let pnl = 1.0
  for (let i = 0; i < 252; i++) {
    regimeCtr++
    if (regimeCtr > regimeLen) {
      regime *= -1
      regimeCtr = 0
    }
    const drift = regime * 0.0003 * sharpe
    const vol = 0.008 + Math.random() * 0.008
    const dailyReturn = drift + (Math.random() - 0.5) * vol
    pnl *= (1 + dailyReturn)
    pnlCurve.push(pnl)
  }

  // Compute max_drawdown from actual PnL curve
  const ddCurve: number[] = [0]
  let peak = 1.0
  let worstDD = 0
  for (let i = 1; i < pnlCurve.length; i++) {
    if (pnlCurve[i] > peak) peak = pnlCurve[i]
    const dd = (pnlCurve[i] - peak) / peak
    if (dd < worstDD) worstDD = dd
    ddCurve.push(dd)
  }

  const isPassed = sharpe >= cfg.minSharpe && Math.abs(worstDD) <= cfg.maxDrawdown && winRate >= cfg.minWinRate

  return {
    sharpe_ratio: parseFloat(sharpe.toFixed(4)),
    annual_return: parseFloat(annualReturn.toFixed(4)),
    max_drawdown: parseFloat(worstDD.toFixed(4)),
    win_rate: parseFloat(winRate.toFixed(4)),
    turnover: parseFloat(turnover.toFixed(4)),
    status: isPassed ? "passed" : "failed",
    is_passed: isPassed,
    pnl_curve: pnlCurve,
    drawdown_curve: ddCurve,
    fitness_score: parseFloat((sharpe * (1 - Math.abs(worstDD)) * winRate).toFixed(4)),
  }
}

export function generateBatch(batchSize: number = 10, config?: Partial<AlphaConfig>): Array<{ alpha: AlphaExpression; metrics: AlphaMetrics }> {
  const generatedHashes = new Set<string>()
  const results: Array<{ alpha: AlphaExpression; metrics: AlphaMetrics }> = []
  let attempts = 0
  const maxAttempts = batchSize * 15

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

// Legacy exports for backward compatibility
export const DEFAULT_CONFIG: AlphaConfig = {
  dataFields: DATA_FIELDS,
  operators: TS_OPERATORS,
  groupOperators: GROUP_OPS,
  lookbacks: LOOKBACKS,
  minSharpe: 1.2,
  maxDrawdown: 0.25,
  minWinRate: 0.50,
  maxTurnover: 0.5,
  universe: UNIVERSE,
  sectors: SECTORS,
}
