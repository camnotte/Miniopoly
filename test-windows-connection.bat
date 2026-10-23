@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is needed. Use the same Windows PC where Miniopoly already runs.
  echo You can install Node.js LTS from https://nodejs.org/ if needed.
  pause
  exit /b 1
)
node scripts\connection-test.js
pause
