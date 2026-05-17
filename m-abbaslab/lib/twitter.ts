// lib/twitter.ts
// X (Twitter) API v2 connector for M-Abbas Lab

const TWITTER_API_BASE = 'https://api.twitter.com/2'

interface PostResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Post a tweet using X API v2 with OAuth 1.0a (user context — required for writing)
 */
export async function postTweet(text: string): Promise<PostResult> {
  try {
    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET
    const accessToken = process.env.TWITTER_ACCESS_TOKEN
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      return { success: false, error: 'Twitter credentials not configured.' }
    }

    const url = `${TWITTER_API_BASE}/tweets`
    const oauth = await generateOAuth1Header('POST', url, {}, { apiKey, apiSecret, accessToken, accessSecret })

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: oauth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 280) }),
    })

    const data = await response.json()

    if (response.ok && data.data?.id) {
      return { success: true, id: data.data.id }
    }

    return { success: false, error: data.detail || data.title || 'Failed to post tweet.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Generate OAuth 1.0a Authorization header using Web Crypto API (Edge-compatible)
 */
async function generateOAuth1Header(
  method: string,
  url: string,
  params: Record<string, string>,
  credentials: { apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }
): Promise<string> {
  const { apiKey, apiSecret, accessToken, accessSecret } = credentials

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.random().toString(36).substring(2) + Date.now().toString(36),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  const allParams = { ...params, ...oauthParams }
  const sortedParams = Object.keys(allParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&')

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&')

  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureBase))
  const signatureB64 = btoa(Array.from(new Uint8Array(signature)).map((b) => String.fromCharCode(b)).join(''))
  oauthParams.oauth_signature = signatureB64

  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
      .join(', ')
  )
}
