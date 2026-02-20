@echo off
:: Set UTF-8 encoding so emojis display correctly in the Windows console
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Starting Electron Grid Browser Build Process...

:: 1. Safety Check: Ensure we are in the project root
if not exist "package.json" (
    echo ❌ Error: package.json not found. Make sure you are in the project root.
    exit /b 1
)

:: 2. Environment Check
echo 💻 Standard Environment detected.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Node.js is not installed.
    exit /b 1
)

echo 📦 Installing dependencies...
:: The 'call' command is required in Windows batch files when running another .cmd file (like npm) 
:: Otherwise, the script will exit immediately after npm finishes.
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: npm install failed.
    exit /b %ERRORLEVEL%
)

echo ⚡ Starting Development Mode...
call npm run dev
