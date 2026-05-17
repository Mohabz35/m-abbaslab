// lib/linkedin.ts
// LinkedIn API connector for M-Abbas Lab

const LINKEDIN_UGC_BASE = 'https://api.linkedin.com/v2/ugcPosts'
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2'

interface PostResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Post to LinkedIn using UGC Posts API
 */
export async function postLinkedIn(text: string): Promise<PostResult> {
  try {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN
    const personId = process.env.LINKEDIN_PERSON_ID

    if (!accessToken || !personId) {
      return { success: false, error: 'LinkedIn credentials not configured.' }
    }

    const body = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    const response = await fetch(LINKEDIN_UGC_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, id: data.id }
    }

    const err = await response.json()
    return { success: false, error: err.message || 'Failed to post on LinkedIn.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Verify your LinkedIn connection is working
 */
export async function getLinkedInProfile() {
  try {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN
    if (!accessToken) return null

    const res = await fetch(`${LINKEDIN_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}
