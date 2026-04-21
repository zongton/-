@echo off
title [DOC_CENTER] Dual-Mode Starter
cd /d %~dp0
echo --- Starting Document Center (Port: 7070) ---
if not exist "node_modules" (
    echo [!] Installing dependencies...
    call npm install express cors sqlite3
)
start /b node server.js
timeout /t 2
echo [OK] Launching Viewer...
start "" "VIEW.html"
pause