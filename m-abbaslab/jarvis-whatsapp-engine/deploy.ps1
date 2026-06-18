# M-Abbas WhatsApp Engine - Fly.io Deployment Script
# Run this after: fly auth login

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " M-Abbas WhatsApp Engine - Fly.io Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$env:PATH = "C:\Users\USER\.fly\bin;$env:PATH"

Write-Host "`n[1/4] Launching app on Fly.io..." -ForegroundColor Yellow
fly launch --no-deploy --copy-config --name jarvis-whatsapp-engine

Write-Host "`n[2/4] Setting secrets..." -ForegroundColor Yellow
fly secrets set `
  "SUPABASE_URL=https://nspzkkemwaaokpiykfvv.supabase.co" `
  "SUPABASE_SERVICE_KEY=<your-supabase-service-key>" `
  "OPENROUTER_API_KEY=<your-openrouter-api-key>" `
  "PHONE_NUMBER=254702894309"

Write-Host "`n[3/4] Deploying..." -ForegroundColor Yellow
fly deploy

Write-Host "`n[4/4] Getting app URL..." -ForegroundColor Yellow
$apps = fly status --json | ConvertFrom-Json
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nYour WhatsApp engine is now running on Fly.io (free tier)"
Write-Host "URL: https://jarvis-whatsapp-engine.fly.dev"
Write-Host "`nNext steps:"
Write-Host "1. Set NEXT_PUBLIC_JARVIS_ENGINE_URL in Vercel to: https://jarvis-whatsapp-engine.fly.dev"
Write-Host "2. Go to Admin > WhatsApp > Connection to pair your phone"
Write-Host "3. The engine will auto-reconnect on restarts"
