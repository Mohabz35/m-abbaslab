import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY")!
const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE") || "+254712345678"
const JARVIS_ENGINE_URL = Deno.env.get("JARVIS_ENGINE_URL")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function sendViaJarvis(message: string) {
  if (JARVIS_ENGINE_URL) {
    try {
      const response = await fetch(`${JARVIS_ENGINE_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: ADMIN_PHONE,
          message: message,
          source: "world_quant_lab"
        })
      })
      return await response.json()
    } catch (err) {
      console.error("[JARVIS] Engine send failed:", err)
      return null
    }
  }
  return null
}

async function processNotifications() {
  const { data: notifications, error } = await supabase
    .from("wq_notifications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(10)

  if (error) {
    console.error("[JARVIS] Error fetching notifications:", error)
    return
  }

  for (const notification of notifications || []) {
    try {
      console.log(`[JARVIS] Sending notification ${notification.id}...`)

      const result = await sendViaJarvis(notification.message_text)

      await supabase
        .from("wq_notifications")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", notification.id)

      console.log(`[JARVIS] Notification ${notification.id} sent`)
    } catch (err) {
      console.error(`[JARVIS] Failed to send ${notification.id}:`, err)
      await supabase
        .from("wq_notifications")
        .update({ status: "failed" })
        .eq("id", notification.id)
    }
  }
}

serve(async (req) => {
  const url = new URL(req.url)

  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ status: "healthy", last_check: new Date().toISOString() }), {
      headers: { "Content-Type": "application/json" }
    })
  }

  if (url.pathname === "/trigger") {
    await processNotifications()
    return new Response(JSON.stringify({ status: "triggered" }), {
      headers: { "Content-Type": "application/json" }
    })
  }

  return new Response("JARVIS Notification Service", { status: 200 })
})
