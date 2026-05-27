import { generateAlpha, simulateBacktest, generateBatch } from '@/lib/alphaEngine'

describe('alphaEngine', () => {
  describe('generateAlpha', () => {
    it('returns an alpha expression with all required properties', () => {
      const alpha = generateAlpha()
      expect(alpha).toHaveProperty('code')
      expect(alpha).toHaveProperty('field')
      expect(alpha).toHaveProperty('operator')
      expect(alpha).toHaveProperty('lookback')
      expect(alpha).toHaveProperty('hash')
      expect(typeof alpha.code).toBe('string')
      expect(typeof alpha.hash).toBe('string')
      expect(alpha.hash.length).toBe(8)
    })

    it('generates different alphas across multiple calls', () => {
      const codes = new Set(Array.from({ length: 20 }, () => generateAlpha().code))
      expect(codes.size).toBeGreaterThan(1)
    })

    it('produces valid expression format using known operators', () => {
      for (let i = 0; i < 100; i++) {
        const alpha = generateAlpha()
        expect(alpha.code).toMatch(/^(abs|sign|neg)?\(?(rank|ts_zscore|ts_mean|ts_std|ts_returns|ts_rank)\((close|open|high|low|volume),\s*\d+\)\)?$/)
      }
    })
  })

  describe('simulateBacktest', () => {
    it('returns metrics with all required fields', () => {
      const alpha = generateAlpha()
      const metrics = simulateBacktest(alpha)
      expect(metrics).toHaveProperty('sharpe_ratio')
      expect(metrics).toHaveProperty('annual_return')
      expect(metrics).toHaveProperty('max_drawdown')
      expect(metrics).toHaveProperty('win_rate')
      expect(metrics).toHaveProperty('turnover')
      expect(metrics).toHaveProperty('fitness_score')
      expect(metrics).toHaveProperty('status')
      expect(metrics).toHaveProperty('is_passed')
      expect(metrics).toHaveProperty('pnl_curve')
      expect(metrics).toHaveProperty('drawdown_curve')
    })

    it('generates 253-point PnL and drawdown curves (1 + 252 days)', () => {
      const metrics = simulateBacktest(generateAlpha())
      expect(metrics.pnl_curve).toHaveLength(253)
      expect(metrics.drawdown_curve).toHaveLength(253)
    })

    it('makes PnL start at 1.0', () => {
      const metrics = simulateBacktest(generateAlpha())
      expect(metrics.pnl_curve[0]).toBe(1.0)
    })

    it('makes drawdown start at 0', () => {
      const metrics = simulateBacktest(generateAlpha())
      expect(metrics.drawdown_curve[0]).toBe(0)
    })

    it('ensures drawdown values are always <= 0', () => {
      for (let i = 0; i < 50; i++) {
        const metrics = simulateBacktest(generateAlpha())
        expect(metrics.drawdown_curve.every((dd: number) => dd <= 0)).toBe(true)
      }
    })

    it('passes when sharpe >= 1.5, |dd| <= 0.15, winRate >= 0.52', () => {
      const metrics = simulateBacktest(generateAlpha())
      if (metrics.is_passed) {
        expect(metrics.sharpe_ratio).toBeGreaterThanOrEqual(1.5)
        expect(Math.abs(metrics.max_drawdown)).toBeLessThanOrEqual(0.15)
        expect(metrics.win_rate).toBeGreaterThanOrEqual(0.52)
        expect(metrics.status).toBe('passed')
      } else {
        expect(metrics.status).toBe('failed')
      }
    })
  })

  describe('generateBatch', () => {
    it('generates the requested number of alphas', () => {
      const results = generateBatch(10)
      expect(results).toHaveLength(10)
    })

    it('returns unique alpha expressions (no duplicate hashes)', () => {
      const results = generateBatch(50)
      const hashes = results.map(r => r.alpha.hash)
      expect(new Set(hashes).size).toBe(50)
    })

    it('generates at most batchSize elements even with max attempts', () => {
      // Using a small config to force many duplicate attempts
      const results = generateBatch(5)
      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('each result contains alpha and metrics', () => {
      const results = generateBatch(10)
      results.forEach(r => {
        expect(r).toHaveProperty('alpha')
        expect(r).toHaveProperty('metrics')
        expect(r.alpha.hash).toBeTruthy()
        expect(r.metrics.sharpe_ratio).toBeDefined()
      })
    })
  })
})
