import fs from 'fs'
import path from 'path'

const TWITTER_API_BASE = 'https://api.twitter.com/2'
const TWITTER_UPLOAD_BASE = 'https://upload.twitter.com/1.1'

interface PostResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Post a tweet with optional media using X API v2
 * @param text - Tweet text (max 280 characters)
 * @param mediaPath - Optional path to image file
 */
export async function postTweet(text: string, mediaPath?: string): Promise<PostResult> {
  try {
    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET
    const accessToken = process.env.TWITTER_ACCESS_TOKEN
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      return { success: false, error: 'Twitter credentials not configured.' }
    }

    let mediaIds: string[] = []

    // Upload media if provided
    if (mediaPath) {
      const uploadResult = await uploadMedia(mediaPath, {
        apiKey,
        apiSecret,
        accessToken,
        accessSecret,
      })

      if (!uploadResult.success || !uploadResult.mediaId) {
        return { success: false, error: `Media upload failed: ${uploadResult.error}` }
      }

      mediaIds = [uploadResult.mediaId]
    }

    // Create tweet payload
    const tweetPayload: any = {
      text: text.slice(0, 280),
    }

    if (mediaIds.length > 0) {
      tweetPayload.media = {
        media_ids: mediaIds,
      }
    }

    const url = `${TWITTER_API_BASE}/tweets`
    const oauth = await generateOAuth1Header('POST', url, {}, {
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: oauth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload),
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
 * Upload media to Twitter
 */
async function uploadMedia(
  mediaPath: string,
  credentials: { apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  try {
    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(mediaPath)
    const base64Data = fileBuffer.toString('base64')
    const mimeType = mediaPath.endsWith('.png') ? 'image/png' : 'image/jpeg'

    const url = `${TWITTER_UPLOAD_BASE}/media/upload.json`
    const oauth = await generateOAuth1Header(
      'POST',
      url,
      {},
      credentials
    )

    // Step 1: INIT
    const initResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: oauth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `command=INIT&total_bytes=${fileBuffer.length}&media_type=${encodeURIComponent(mimeType)}`,
    })

    const initData = await initResponse.json()

    if (!initData.media_id_string) {
      return { success: false, error: 'Failed to initialize media upload' }
    }

    const mediaId = initData.media_id_string

    // Step 2: APPEND
    const appendFormData = new FormData()
    appendFormData.append('command', 'APPEND')
    appendFormData.append('media_id', mediaId)
    appendFormData.append('segment_index', '0')
    appendFormData.append('media_data', base64Data)

    const appendOAuth = await generateOAuth1Header(
      'POST',
      url,
      {
        command: 'APPEND',
        media_id: mediaId,
        segment_index: '0',
      },
      credentials
    )

    const appendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: appendOAuth,
      },
      body: appendFormData,
    })

    if (!appendResponse.ok) {
      return { success: false, error: 'Failed to append media' }
    }

    // Step 3: FINALIZE
    const finalizeOAuth = await generateOAuth1Header(
      'POST',
      url,
      {
        command: 'FINALIZE',
        media_id: mediaId,
      },
      credentials
    )

    const finalizeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: finalizeOAuth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `command=FINALIZE&media_id=${mediaId}`,
    })

    const finalizeData = await finalizeResponse.json()

    if (finalizeData.media_id_string) {
      return { success: true, mediaId: finalizeData.media_id_string }
    }

    return { success: false, error: 'Failed to finalize media upload' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Generate OAuth 1.0a Authorization header
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

  const signatureBase = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sortedParams)].join('&')

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
  const signatureB64 = btoa(
    Array.from(new Uint8Array(signature))
      .map((b) => String.fromCharCode(b))
      .join('')
  )
  oauthParams.oauth_signature = signatureB64

  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
      .join(', ')
  )
}
