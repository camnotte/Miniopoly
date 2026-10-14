@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js LTS from https://nodejs.org/
  echo Then double-click this file again.
  pause
  exit /b 1
)
echo Starting Mini-opoly Wi-Fi multiplayer...
node server.js
if errorlevel 1 pause
