@echo off
cd /d "%~dp0"

echo Starting Electron Grid Browser Build Process...

if not exist "package.json" (
    echo Error: package.json not found in %CD%
    echo Make sure this script is in the same folder as your package.json.
    pause
    exit /b 1
)

echo Standard Environment detected.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed, or it is not in your system PATH.
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: npm install failed. Check the errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo Starting Development Mode...
call npm run dev
if %ERRORLEVEL% neq 0 (
    echo Error: npm run dev failed. Check package.json for a dev script.
    pause
    exit /b %ERRORLEVEL%
)
