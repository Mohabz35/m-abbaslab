# M-Abbas WhatsApp Engine — Fly.io Deployment

## Why Fly.io?
- **Free tier**: 3 shared-cpu-1x VMs, 256MB RAM, always-on
- **No sleeping**: Unlike Render free tier, Fly.io apps stay alive
- **Auto-restart**: If the app crashes, Fly.io restarts it automatically
- **Global**: Deploy to Tokyo (nrt) for low latency

## One-Time Setup

### 1. Install flyctl (if not already installed)
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Authenticate
```bash
fly auth login
```

### 3. Launch the app
```bash
cd jarvis-whatsapp-engine
fly launch --no-deploy --copy-config --name jarvis-whatsapp-engine
```

### 4. Set secrets
```bash
fly secrets set \
  "SUPABASE_URL=https://nspzkkemwaaokpiykfvv.supabase.co" \
  "SUPABASE_SERVICE_KEY=eyJ..." \
  "OPENROUTER_API_KEY=sk-or-v1-..." \
  "PHONE_NUMBER=254702894309"
```

### 5. Deploy
```bash
fly deploy
```

### 6. Update Vercel env vars
In your Vercel dashboard, set:
```
JARVIS_ENGINE_URL=https://jarvis-whatsapp-engine.fly.dev
NEXT_PUBLIC_JARVIS_ENGINE_URL=https://jarvis-whatsapp-engine.fly.dev
```

### 7. Pair your phone
Go to Admin → WhatsApp → Connection and enter the pairing code.

## Useful Commands

```bash
# Check status
fly status

# View logs
fly logs

# Restart
fly restart

# Scale to zero (stop paying)
fly scale count 0

# Scale back up
fly scale count 1
```

## How It Works

The engine runs as a persistent Node.js process on Fly.io:
1. Connects to WhatsApp Web via Baileys (WebSocket)
2. Listens for incoming messages
3. Responds using keyword rules from Supabase + OpenRouter AI fallback
4. Logs all messages to Supabase
5. Reports connection status to Supabase

The Next.js admin dashboard reads status from Supabase and sends commands to the engine's HTTP API.

## Troubleshooting

**Engine won't connect:**
- Check `fly logs` for errors
- Make sure your phone number is correct
- Try re-pairing: Admin → WhatsApp → Reconnect

**Engine keeps disconnecting:**
- This is normal if WhatsApp Web is open on another device
- The engine will auto-reconnect after 5 seconds

**Engine sleeping:**
- Fly.io free tier apps can be stopped if inactive
- Set `min_machines_running = 1` in fly.toml to prevent this (already configured)
