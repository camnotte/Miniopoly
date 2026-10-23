@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js LTS from https://nodejs.org/
  echo Then double-click this file again.
  pause
  exit /b 1
)
if not exist "scripts\start-local.js" (
  echo The local launcher helper is missing. Extract the whole Local Start Fix ZIP
  echo into your existing game folder, including its scripts folder.
  pause
  exit /b 1
)
echo Starting Miniopoly Local Multiplayer...
node scripts\start-local.js
if errorlevel 1 pause
