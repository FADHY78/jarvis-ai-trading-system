@echo off
REM JARVIS System Test Script
REM Tests all components before starting the system

title JARVIS System Test
color 0B

echo.
echo ========================================
echo    JARVIS SYSTEM TEST
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Testing Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [FAIL] Node.js not found!
    echo    Install from: https://nodejs.org
    pause
    exit /b 1
)
echo    [PASS] Node.js installed

echo.
echo [2/4] Testing dependencies...
if not exist "node_modules\" (
    echo    [WARN] Dependencies not installed
    echo    Run: npm install
    pause
    exit /b 1
)
echo    [PASS] Dependencies installed

echo.
echo [3/4] Testing configuration...
if not exist ".env.local" (
    echo    [FAIL] .env.local not found!
    echo    Create .env.local with your credentials
    pause
    exit /b 1
)
echo    [PASS] Configuration file exists

echo.
echo [4/4] Running health check...
node health-check.js
if %errorlevel% neq 0 (
    echo.
    echo    [FAIL] Health check failed!
    echo    Fix errors above before starting
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ALL TESTS PASSED!
echo ========================================
echo.
echo System is ready to start.
echo.
echo Press any key to start JARVIS...
pause >nul

start-jarvis.bat
