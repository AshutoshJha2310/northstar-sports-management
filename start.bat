@echo off
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo Starting Northstar. Open the local URL shown below in your browser.
echo Leave this window open while you use the app.
echo.
call npm.cmd run dev -- --host 127.0.0.1
