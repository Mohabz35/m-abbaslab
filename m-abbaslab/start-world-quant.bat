@echo off
title World Quant Lab - M-AbbasLab
echo ========================================
echo   World Quant Lab - M-AbbasLab
echo   Starting all services...
echo ========================================
echo.
echo [1/2] Starting JARVIS WhatsApp Engine on port 3009...
start "JARVIS WhatsApp Engine" cmd /c "cd /d %~dp0jarvis-whatsapp-engine && npm start"
echo.
echo [2/2] Starting Next.js dev server on port 3000...
echo.
echo Open Admin Dashboard at: http://localhost:3000/admin/dashboard
echo World Quant Tab: Admin Dashboard ^> World Quant
echo.
npm run dev
