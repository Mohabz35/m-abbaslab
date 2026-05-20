// lib/linkedin.ts (UPDATED)
// LinkedIn API connector for M-Abbas Lab with media support

import fs from 'fs'

const LINKEDIN_UGC_BASE = 'https://api.linkedin.com/v2/ugcPosts'
const LINKEDIN_ASSETS_BASE = 'https://api.linkedin.com/v2/assets?action=registerUpload'
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2'

interface PostResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Post to LinkedIn with optional media using UGC Posts API
 * @param text - Post text
 * @param mediaPath - Optional path to image file
 */
export async function postLinkedIn(text: string, mediaPath?: string): Promise<PostResult> {
  try {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN
    const personId = process.env.LINKEDIN_PERSON_ID

    if (!accessToken || !personId) {
      return { success: false, error: 'LinkedIn credentials not configured.' }
    }

    let mediaAsset: any = null

    // Upload media if provided
    if (mediaPath) {
      const uploadResult = await uploadLinkedInMedia(mediaPath, accessToken)

      if (!uploadResult.success || !uploadResult.assetUrn) {
        return { success: false, error: `Media upload failed: ${uploadResult.error}` }
      }

      mediaAsset = uploadResult.assetUrn
    }

    // Build the post payload
    const shareContent: any = {
      shareCommentary: { text },
      shareMediaCategory: mediaAsset ? 'IMAGE' : 'NONE',
    }

    if (mediaAsset) {
      shareContent.media = [
        {
          status: 'READY',
          media: mediaAsset,
        },
      ]
    }

    const body = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': shareContent,
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
 * Upload media to LinkedIn
 */
async function uploadLinkedInMedia(
  mediaPath: string,
  accessToken: string
): Promise<{ success: boolean; assetUrn?: string; error?: string }> {
  try {
    // Step 1: Register upload
    const registerResponse = await fetch(LINKEDIN_ASSETS_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    })

    const registerData = await registerResponse.json()

    if (!registerData.value?.uploadMechanism?.com?.linkedin?.digitalmedia?.uploading?.MediaUploadHttpRequest) {
      return { success: false, error: 'Failed to register upload' }
    }

    const uploadRequest =
      registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
    const uploadUrl = uploadRequest.uploadUrl
    const assetUrn = registerData.value.asset

    // Step 2: Upload the file
    const fileBuffer = fs.readFileSync(mediaPath)

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    })

    if (!uploadResponse.ok) {
      return { success: false, error: 'Failed to upload media to LinkedIn' }
    }

    return { success: true, assetUrn }
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
