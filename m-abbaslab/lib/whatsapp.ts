// lib/whatsapp.ts
// WhatsApp Cloud API connector for M-Abbas Lab

const WA_BASE = 'https://graph.facebook.com/v19.0'

/**
 * Send a WhatsApp text reply to a user
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
      console.error('WhatsApp credentials not configured.')
      return false
    }

    const response = await fetch(`${WA_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    })

    return response.ok
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return false
  }
}

/**
 * Mark a WhatsApp message as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    if (!phoneNumberId || !accessToken) return

    await fetch(`${WA_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    })
  } catch {
    // Non-critical — ignore
  }
}
