/**
 * Real Market Data Backtesting Engine
 * Integrates with Alpha Engine for actual performance metrics
 */

export interface MarketData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  returns: number // daily return
}

export interface BacktestResult {
  pnlCurve: number[]
  drawdownCurve: number[]
  sharpe: number
  annualReturn: number
  maxDrawdown: number
  winRate: number
  turnover: number
  trades: number
}

/**
 * Calculate daily returns from price data
 */
export function calculateReturns(prices: number[]): number[] {
  return prices.slice(1).map((price, i) => {
    return (price - prices[i]) / prices[i]
  })
}

/**
 * Apply simple alpha expression to market data
 * Supports: rank, ts_zscore, ts_mean, ts_std, ts_returns
 */
export function evaluateAlpha(
  data: MarketData[],
  field: string,
  operator: string,
  lookback: number
): number[] {
  const signals: number[] = []

  for (let i = lookback; i < data.length; i++) {
    const window = data.slice(i - lookback, i)
    const values = window.map(d => d[field as keyof MarketData] as number)

    let signal = 0

    switch (operator) {
      case "rank":
        // Rank the values in the window (normalized to -1 to 1)
        const sorted = [...values].sort((a, b) => a - b)
        const currentIdx = sorted.indexOf(values[values.length - 1])
        signal = (currentIdx / values.length) * 2 - 1
        break

      case "ts_zscore":
        // Z-score of current value
        const mean = values.reduce((a, b) => a + b) / values.length
        const variance = values.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / values.length
        const std = Math.sqrt(variance)
        signal = std > 0 ? (values[values.length - 1] - mean) / std : 0
        break

      case "ts_mean":
        // Distance from mean
        const m = values.reduce((a, b) => a + b) / values.length
        signal = (values[values.length - 1] - m) / m
        break

      case "ts_std":
        // Volatility / momentum
        const v = values.reduce((a, b) => a + b) / values.length
        const var_ = values.reduce((a, x) => a + Math.pow(x - v, 2), 0) / values.length
        signal = Math.sqrt(var_) / v
        break

      case "ts_returns":
        // Return momentum
        const rets = calculateReturns(values)
        const avgRet = rets.reduce((a, b) => a + b) / rets.length
        signal = rets[rets.length - 1] - avgRet
        break

      case "ts_rank":
        // Percentile rank
        const sorted2 = [...values].sort((a, b) => a - b)
        const idx = sorted2.indexOf(values[values.length - 1])
        signal = (idx + 1) / values.length
        break

      default:
        signal = 0
    }

    signals.push(isFinite(signal) ? signal : 0)
  }

  return signals
}

/**
 * Apply optional transformations to signals
 */
export function applyTransform(signals: number[], transform: string | null): number[] {
  if (!transform) return signals

  return signals.map(s => {
    switch (transform) {
      case "abs":
        return Math.abs(s)
      case "sign":
        return s > 0 ? 1 : s < 0 ? -1 : 0
      case "neg":
        return -s
      default:
        return s
    }
  })
}

/**
 * Backtest alpha signals on market data
 * Returns performance metrics
 */
export function backtestAlpha(
  signals: number[],
  returns: number[],
  initialCapital: number = 100000
): BacktestResult {
  if (signals.length === 0 || returns.length === 0) {
    throw new Error("Signals and returns cannot be empty")
  }

  const minLength = Math.min(signals.length, returns.length)
  const alignedSignals = signals.slice(0, minLength)
  const alignedReturns = returns.slice(0, minLength)

  // Position sizing: normalize signals to -1 to 1 range
  const maxSignal = Math.max(...alignedSignals.map(Math.abs))
  const positions = maxSignal > 0 ? alignedSignals.map(s => s / maxSignal) : alignedSignals

  // Calculate P&L
  const pnl: number[] = [1.0]
  let winningDays = 0
  let totalDays = 0

  for (let i = 0; i < positions.length; i++) {
    const dayPnL = positions[i] * alignedReturns[i]
    pnl.push(pnl[pnl.length - 1] * (1 + dayPnL))

    if (alignedReturns[i] * positions[i] > 0) winningDays++
    totalDays++
  }

  // Calculate metrics
  const pnlReturns = calculateReturns(pnl)
  const meanReturn = pnlReturns.reduce((a, b) => a + b) / pnlReturns.length
  const variance = pnlReturns.reduce((a, r) => a + Math.pow(r - meanReturn, 2), 0) / pnlReturns.length
  const stdReturn = Math.sqrt(variance)
  const sharpe = stdReturn > 0 ? (meanReturn * 252) / (stdReturn * Math.sqrt(252)) : 0 // Annualized

  // Drawdown
  let peak = 1.0
  let maxDD = 0
  const ddCurve: number[] = []

  for (const val of pnl) {
    if (val > peak) peak = val
    const dd = (val - peak) / peak
    ddCurve.push(dd)
    if (dd < maxDD) maxDD = dd
  }

  const annualReturn = (pnl[pnl.length - 1] - 1)
  const turnover = positions.reduce((a, b) => a + Math.abs(b), 0) / positions.length

  return {
    pnlCurve: pnl,
    drawdownCurve: ddCurve,
    sharpe: isFinite(sharpe) ? sharpe : 0,
    annualReturn: annualReturn,
    maxDrawdown: maxDD,
    winRate: totalDays > 0 ? winningDays / totalDays : 0,
    turnover: turnover,
    trades: positions.filter((v, i) => i === 0 || v !== positions[i - 1]).length
  }
}

/**
 * Full backtest pipeline: signal generation -> evaluation -> P&L calculation
 */
export function runFullBacktest(
  marketData: MarketData[],
  field: string,
  operator: string,
  lookback: number,
  transform: string | null
): BacktestResult {
  // Generate signals
  const signals = evaluateAlpha(marketData, field, operator, lookback)

  // Apply transformation
  const transformedSignals = applyTransform(signals, transform)

  // Get returns from market data
  const prices = marketData.map(d => d.close)
  const returns = calculateReturns(prices)

  // Backtest
  return backtestAlpha(transformedSignals, returns)
}
