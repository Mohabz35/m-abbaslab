const { createClient } = require('@supabase/supabase-js')

class GroupMonitor {
  constructor(sock, supabase, configData) {
    this.sock = sock
    this.supabase = supabase
    this.configData = configData || {}
    this.statusQueue = []
    this.processedStatuses = new Set()
  }

  // Load the latest config from site_config table
  async getLiveConfig() {
    if (!this.supabase) return this.configData

    try {
      const { data, error } = await this.supabase
        .from('site_config')
        .select('config_data')
        .eq('id', 1)
        .single()

      if (!error && data && data.config_data) {
        return data.config_data
      }
    } catch (e) {
      console.warn('[GROUP-MONITOR] Failed to fetch live config:', e.message)
    }
    return this.configData
  }

  async initializeGroupMonitoring() {
    console.log('[GROUP-MONITOR] Discovering groups...')
    try {
      // Fetch all groups from Baileys
      const groups = await this.sock.groupFetchAllParticipating()
      const groupJids = Object.keys(groups)

      for (const jid of groupJids) {
        const group = groups[jid]
        const groupName = group.subject || 'Unnamed Group'
        const participantCount = group.participants?.length || 0

        console.log(`[GROUP-MONITOR] 📍 Discovered group: ${groupName} (${jid})`)

        if (this.supabase) {
          // Check if group exists
          const { data: existing } = await this.supabase
            .from('whatsapp_groups')
            .select('*')
            .eq('group_jid', jid)
            .single()

          if (!existing) {
            await this.supabase.from('whatsapp_groups').insert([{
              group_jid: jid,
              group_name: groupName,
              participant_count: participantCount,
              metadata: { monitored: true },
              last_seen_at: new Date().toISOString()
            }])
          } else {
            await this.supabase.from('whatsapp_groups').update({
              group_name: groupName,
              participant_count: participantCount,
              last_seen_at: new Date().toISOString()
            }).eq('group_jid', jid)
          }
        }
      }
      console.log(`[GROUP-MONITOR] Group discovery completed. Monitored groups synched.`)
    } catch (error) {
      console.error('[GROUP-MONITOR] Error during group discovery:', error.message)
    }
  }

  async initializeStatusMonitoring() {
    console.log('[STATUS-MONITOR] Status monitoring active.')
    // Set up status queue processor to run every 2 minutes (120000 ms)
    setInterval(async () => {
      await this.processStatusQueue()
    }, 120000)
  }

  // Queue status updates from messages.upsert
  handleStatusUpdate(msg) {
    const sender = msg.key.remoteJid
    if (sender !== 'status@broadcast') return

    const contact = msg.key.participant || msg.participant || msg.key.remoteJid
    if (msg.key.fromMe) return // Skip own statuses

    const text = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || ''

    const mediaType = msg.message?.imageMessage ? 'image' : 
                      msg.message?.videoMessage ? 'video' : 'text'

    const statusId = msg.key.id

    // Check if we've already queued/processed this status message id
    if (this.processedStatuses.has(statusId)) return

    this.statusQueue.push({
      msg,
      contact,
      text,
      mediaType,
      statusId,
      timestamp: new Date()
    })
    this.processedStatuses.add(statusId)
    console.log(`[STATUS-MONITOR] Captured new status from ${contact.split('@')[0]}: "${text.substring(0, 30)}..."`)
  }

  // Process the queue every 2 minutes
  async processStatusQueue() {
    if (this.statusQueue.length === 0) return

    console.log(`[STATUS-MONITOR] Processing ${this.statusQueue.length} status updates...`)
    const items = [...this.statusQueue]
    this.statusQueue = []

    const liveConfig = await this.getLiveConfig()
    const jarvisConfig = liveConfig?.jarvisConfig || {}
    const monitorEnabled = jarvisConfig.monitorStatuses !== false
    const autoLikeEnabled = jarvisConfig.autoLikeStatuses !== false

    if (!monitorEnabled) {
      console.log('[STATUS-MONITOR] Status monitoring is disabled in settings. Clearing queue.')
      return
    }

    // Process each status update
    for (const item of items) {
      const { msg, contact, text, mediaType } = item
      const contactClean = contact.split('@')[0]

      let category = 'other'
      let interesting = false
      let analysis = 'Shared a standard status update.'
      const openRouterKey = process.env.OPENROUTER_API_KEY

      if (text && openRouterKey) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://m-abbaslab.vercel.app',
              'X-Title': 'M-AbbasLab Jarvis Status Analyzer'
            },
            body: JSON.stringify({
              model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
              messages: [
                {
                  role: 'system',
                  content: `Analyze this WhatsApp status text. Categorize it as one of the following: "achievement", "travel", "celebration", "motivation", "work", or "other".
Determine if it is "interesting" or positive (e.g. sharing accomplishments, vacation/trips, birthdays/events, inspirational quotes, or work/business updates).
Return JSON output ONLY in this format:
{
  "category": "achievement" | "travel" | "celebration" | "motivation" | "work" | "other",
  "interesting": true | false,
  "analysis": "a brief description of what was shared"
}`
                },
                { role: 'user', content: text }
              ],
              temperature: 0.3,
              max_tokens: 150
            })
          })

          if (response.ok) {
            const data = await response.json()
            const resultText = data.choices?.[0]?.message?.content?.trim() || ''
            // Clean markdown blocks if present
            const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim()
            const parsed = JSON.parse(cleanJson)
            category = parsed.category || 'other'
            interesting = Boolean(parsed.interesting)
            analysis = parsed.analysis || 'Analyzed content'
          }
        } catch (err) {
          console.warn('[STATUS-MONITOR] AI status analysis failed, using fallback keyword matching:', err.message)
          // Fallback keyword check
          const lower = text.toLowerCase()
          if (lower.includes('promotion') || lower.includes('won') || lower.includes('award') || lower.includes('pass') || lower.includes('grad') || lower.includes('completed')) {
            category = 'achievement'
            interesting = true
            analysis = 'Shared an achievement update.'
          } else if (lower.includes('travel') || lower.includes('trip') || lower.includes('flight') || lower.includes('vacation') || lower.includes('beach') || lower.includes('road')) {
            category = 'travel'
            interesting = true
            analysis = 'Shared a travel update.'
          } else if (lower.includes('birthday') || lower.includes('party') || lower.includes('celebrat') || lower.includes('anniversary') || lower.includes('wedding')) {
            category = 'celebration'
            interesting = true
            analysis = 'Shared a celebration update.'
          } else if (lower.includes('quote') || lower.includes('motivation') || lower.includes('inspire') || lower.includes('focus') || lower.includes('believe')) {
            category = 'motivation'
            interesting = true
            analysis = 'Shared a motivational quote/update.'
          } else if (lower.includes('work') || lower.includes('office') || lower.includes('project') || lower.includes('client') || lower.includes('launch')) {
            category = 'work'
            interesting = true
            analysis = 'Shared a work/project update.'
          }
        }
      }

      const shouldLike = interesting && autoLikeEnabled
      console.log(`[STATUS-MONITOR] Status from ${contactClean}: Category = ${category}, Interesting = ${interesting}, Auto-Liked = ${shouldLike}`)

      // Like/React to status
      if (shouldLike) {
        try {
          await this.sock.sendMessage(contact, {
            react: {
              text: '❤️',
              key: msg.key
            }
          })
          console.log(`[STATUS-MONITOR] ❤️ Liked status from ${contactClean}`)
        } catch (err) {
          console.error('[STATUS-MONITOR] Failed to like status:', err.message)
        }
      }

      // Mark status as read
      try {
        await this.sock.readMessages([msg.key])
      } catch (err) {
        // Suppress read receipts errors as status read can sometimes fail depending on Baileys sync
      }

      // Log status analysis to Supabase
      if (this.supabase) {
        const payload = {
          contact_number: contact,
          status_text: text || `[Media Status: ${mediaType}]`,
          media_url: mediaType,
          metadata: {
            category,
            analysis,
            auto_liked: shouldLike,
            timestamp: new Date().toISOString()
          },
          captured_at: new Date().toISOString()
        }

        try {
          // Attempt inserting with explicit jarvis_liked column
          await this.supabase.from('whatsapp_status_updates').insert([{
            ...payload,
            jarvis_liked: shouldLike
          }])
        } catch (err) {
          // Fallback if jarvis_liked column is not present
          try {
            await this.supabase.from('whatsapp_status_updates').insert([payload])
          } catch (e2) {
            console.error('[STATUS-MONITOR] Failed to write status to Supabase:', e2.message)
          }
        }
      }
    }
  }

  // Handle group messages
  async handleGroupMessage(msg, senderJid, messageText, senderName) {
    if (!this.supabase) return

    const liveConfig = await this.getLiveConfig()
    const jarvisConfig = liveConfig?.jarvisConfig || {}
    
    // Check if group response is enabled globally
    const respondToGroups = jarvisConfig.respondToGroups !== false && process.env.RESPOND_TO_GROUPS === 'true'
    if (!respondToGroups) return

    try {
      // 1. Verify if group is monitored in the database
      const { data: groupData, error } = await this.supabase
        .from('whatsapp_groups')
        .select('metadata')
        .eq('group_jid', senderJid)
        .single()

      if (error || !groupData) return
      
      const isMonitored = groupData.metadata?.monitored !== false
      if (!isMonitored) return

      // 2. Check if message mentions "jarvis" or contains questions
      const textLower = messageText.toLowerCase()
      const isMentioned = textLower.includes('jarvis') || textLower.includes('bot')
      const isQuestion = messageText.includes('?') || textLower.includes('how') || textLower.includes('why') || textLower.includes('what') || textLower.includes('who')

      if (!isMentioned && !isQuestion) return

      console.log(`[GROUP-MONITOR] Processing group message in "${senderJid}" from "${senderName}": "${messageText}"`)

      // 3. Generate AI response (1-2 sentences, natural tone)
      const openRouterKey = process.env.OPENROUTER_API_KEY
      let reply = null

      if (openRouterKey) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://m-abbaslab.vercel.app',
              'X-Title': 'M-AbbasLab Jarvis Group Bot'
            },
            body: JSON.stringify({
              model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
              messages: [
                {
                  role: 'system',
                  content: `You are Jarvis, the friendly AI assistant for Mohammed Abbas. You are in a group chat.
Respond to the user's message briefly, in 1-2 sentences. Maintain a helpful, intelligent, yet natural tone.
Use an emoji if appropriate, but keep it subtle. Refer to yourself as Jarvis.`
                },
                { role: 'user', content: `[Sender: ${senderName}] ${messageText}` }
              ],
              temperature: 0.7,
              max_tokens: 150
            })
          })

          if (response.ok) {
            const data = await response.json()
            reply = data.choices?.[0]?.message?.content?.trim() || null
          }
        } catch (err) {
          console.error('[GROUP-MONITOR] OpenRouter API call failed:', err.message)
        }
      }

      // Fallback if AI fails
      if (!reply) {
        if (textLower.includes('hello') || textLower.includes('hi')) {
          reply = `Hello! I'm Jarvis, Mohammed's assistant. How can I help the group today?`
        } else {
          reply = `I've logged that question for Mohammed and will let him know. Let me know if I can assist with anything else! 💡`
        }
      }

      // 4. Send response
      const sentMsg = await this.sock.sendMessage(senderJid, { text: reply }, { quoted: msg })

      // 5. Log interaction to message table
      try {
        await this.supabase.from('whatsapp_messages').insert([{
          sender_number: senderJid,
          sender_name: senderName || 'Unknown Group Member',
          message_text: messageText,
          jarvis_reply: reply,
          message_type: 'text',
          direction: 'incoming',
          metadata: { is_group: true, sender_jid: msg.key.participant || msg.participant || senderJid },
          timestamp: new Date().toISOString(),
          is_read: true
        }])
      } catch (err) {
        console.error('[GROUP-MONITOR] Failed to log group message:', err.message)
      }

      // 6. Log to jarvis_interactions for learning
      try {
        await this.supabase.from('jarvis_interactions').insert([{
          sender_number: senderJid,
          sender_name: senderName || 'Unknown Group Member',
          user_message: messageText,
          ai_reply: reply,
          provider: openRouterKey ? 'openrouter' : 'fallback',
          metadata: { is_group: true },
          created_at: new Date().toISOString()
        }])
      } catch (err) {
        console.error('[GROUP-MONITOR] Failed to log jarvis interaction:', err.message)
      }

      console.log(`[GROUP-MONITOR] Replied to group message: "${reply}"`)
    } catch (err) {
      console.error('[GROUP-MONITOR] Error handling group message:', err.message)
    }
  }
}

module.exports = GroupMonitor
