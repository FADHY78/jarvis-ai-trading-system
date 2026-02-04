@echo off
echo ========================================
echo JARVIS AI - Quick Deploy to Vercel
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo Git initialized!
) else (
    echo Git already initialized
)

REM Add all files
echo.
echo Adding files to Git...
git add .

REM Commit
echo.
set /p "commit_msg=Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set "commit_msg=Update JARVIS AI Trading System"
git commit -m "%commit_msg%"

REM Check if remote exists
git remote | findstr "origin" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: No GitHub remote found!
    echo.
    echo Please:
    echo 1. Create a new repository on GitHub.com
    echo 2. Copy the repository URL
    echo.
    set /p "add_remote=Want to add GitHub remote now? (y/n): "
    
    if /i "%add_remote%"=="y" (
        set /p "repo_url=Enter your GitHub repo URL: "
        git remote add origin !repo_url!
        git branch -M main
        echo Remote added!
    )
)

REM Push to GitHub
git remote | findstr "origin" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo Pushing to GitHub...
    git push -u origin main
    
    echo.
    echo ========================================
    echo SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Next Steps:
    echo 1. Go to vercel.com
    echo 2. Click "New Project"
    echo 3. Import your GitHub repository
    echo 4. Add environment variables:
    echo    - GEMINI_API_KEY
    echo    - DERIV_TOKEN
    echo    - TELEGRAM_BOT_TOKEN
    echo    - TELEGRAM_CHAT_ID
    echo 5. Click "Deploy"
    echo.
    echo Your system will be live at:
    echo https://your-project.vercel.app
    echo.
    echo Update MT5 EA with:
    echo https://your-project.vercel.app/api/signals
    echo.
) else (
    echo.
    echo Skipped push. Add remote manually:
    echo git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai-trading.git
    echo git push -u origin main
)

echo.
echo Done!
pause
