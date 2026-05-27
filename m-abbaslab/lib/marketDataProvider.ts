/**
 * Market Data Provider
 * Fetches real OHLCV data from free/paid sources
 */

import { MarketData } from './marketDataEngine'

/**
 * Option 1: Use YFinance (Free, no API key needed)
 */
export async function fetchYFinanceData(
  symbol: string,
  period: string = '5y'
): Promise<MarketData[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${period}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.chart.result[0]) {
      throw new Error(`No data for ${symbol}`)
    }

    const chart = data.chart.result[0]
    const timestamps = chart.timestamp
    const quotes = chart.indicators.quote[0]

    return timestamps.map((ts: number, i: number) => {
      const date = new Date(ts * 1000).toISOString().split('T')[0]
      const close = quotes.close[i]
      const prevClose = i > 0 ? quotes.close[i - 1] : quotes.open[i]

      return {
        date,
        open: quotes.open[i],
        high: quotes.high[i],
        low: quotes.low[i],
        close: close,
        volume: quotes.volume[i],
        returns: (close - prevClose) / prevClose
      }
    })
  } catch (error) {
    throw new Error(`Failed to fetch YFinance data for ${symbol}: ${error}`)
  }
}

/**
 * Option 2: Use Alpha Vantage (Free with API key)
 * Get key from: https://www.alphavantage.co/api/
 */
export async function fetchAlphaVantageData(
  symbol: string,
  outputsize: 'compact' | 'full' = 'full'
): Promise<MarketData[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY not set')
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=${outputsize}`

  const response = await fetch(url)
  const data = await response.json()

  if (data['Error Message']) {
    throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`)
  }

  if (!data['Time Series (Daily)']) {
    throw new Error(`No data returned for ${symbol}`)
  }

  const timeSeries = data['Time Series (Daily)']
  const dates = Object.keys(timeSeries).sort()

  return dates.map((date, i) => {
    const candle = timeSeries[date]
    const prevDate = i > 0 ? dates[i - 1] : null
    const prevClose = prevDate ? parseFloat(timeSeries[prevDate]['4. close']) : parseFloat(candle['4. close'])
    const close = parseFloat(candle['4. close'])

    return {
      date,
      open: parseFloat(candle['1. open']),
      high: parseFloat(candle['2. high']),
      low: parseFloat(candle['3. low']),
      close,
      volume: parseInt(candle['6. volume'], 10),
      returns: (close - prevClose) / prevClose
    }
  })
}

/**
 * Option 3: Use Polygon.io (Professional grade)
 * Get key from: https://polygon.io/
 */
export async function fetchPolygonData(
  symbol: string,
  from: string,
  to: string
): Promise<MarketData[]> {
  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    throw new Error('POLYGON_API_KEY not set')
  }

  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?apiKey=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (!data.results) {
    throw new Error(`No data returned from Polygon for ${symbol}`)
  }

  return data.results.map((bar: any, i: number) => {
    const prevClose = i > 0 ? data.results[i - 1]['c'] : bar['o']
    return {
      date: new Date(bar['t']).toISOString().split('T')[0],
      open: bar['o'],
      high: bar['h'],
      low: bar['l'],
      close: bar['c'],
      volume: bar['v'],
      returns: (bar['c'] - prevClose) / prevClose
    }
  })
}

/**
 * Cache table migration for Supabase
 * Run this in Supabase SQL Editor once
 */
export const CACHE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS market_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    source TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(symbol, source)
);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_updated ON market_data_cache(updated_at DESC);
`

/**
 * Get market data from cache or API
 */
export async function getMarketData(
  symbol: string,
  source: 'yfinance' | 'polygon' | 'alpha_vantage' = 'yfinance',
  period: string = '5y',
  forceRefresh: boolean = false
): Promise<MarketData[]> {
  // Try to get from cache first
  if (!forceRefresh) {
    try {
      const { supabase } = await import('./supabase')
      const { data: cached } = await supabase
        .from('market_data_cache')
        .select('*')
        .eq('symbol', symbol)
        .eq('source', source)
        .single()

      if (cached && new Date(cached.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        console.log(`[Cache Hit] ${symbol} from ${source}`)
        return cached.data
      }
    } catch (e) {
      // Cache miss, fetch fresh data
    }
  }

  console.log(`[Fetching] ${symbol} from ${source}`)

  // Fetch fresh data
  let data: MarketData[]
  if (source === 'yfinance') {
    data = await fetchYFinanceData(symbol, period)
  } else if (source === 'polygon') {
    const to = new Date().toISOString().split('T')[0]
    const from = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    data = await fetchPolygonData(symbol, from, to)
  } else {
    data = await fetchAlphaVantageData(symbol, 'full')
  }

  // Cache the data
  try {
    const { supabase } = await import('./supabase')
    await supabase.from('market_data_cache').upsert({
      symbol,
      source,
      data,
      updated_at: new Date().toISOString()
    })
    console.log(`[Cached] ${symbol} from ${source}`)
  } catch (e) {
    console.warn(`Failed to cache market data: ${e}`)
  }

  return data
}

/**
 * Batch fetch market data for multiple symbols
 */
export async function getMarketDataBatch(
  symbols: string[],
  source: 'yfinance' | 'polygon' | 'alpha_vantage' = 'yfinance',
  period: string = '5y'
): Promise<Record<string, MarketData[]>> {
  const results: Record<string, MarketData[]> = {}

  for (const symbol of symbols) {
    try {
      results[symbol] = await getMarketData(symbol, source, period)
    } catch (e) {
      console.error(`Failed to fetch data for ${symbol}:`, e)
      results[symbol] = []
    }
  }

  return results
}
