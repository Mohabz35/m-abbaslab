/**
 * Zapier Integration Helper
 * Used to trigger webhooks in Zapier for automation workflows.
 */

const ZAPIER_WEBHOOK_URL = process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL || ''

export async function triggerZap(eventName: string, payload: any) {
  if (!ZAPIER_WEBHOOK_URL) {
    console.warn(`[Zapier] Triggered '${eventName}' but no Webhook URL configured.`)
    return false
  }

  try {
    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        data: payload
      })
    })

    return response.ok
  } catch (error) {
    console.error(`[Zapier] Failed to trigger '${eventName}':`, error)
    return false
  }
}
