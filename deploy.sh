#!/bin/bash

echo "🚀 JARVIS AI - Quick Deploy to Vercel"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update JARVIS AI Trading System"
fi
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote | grep -q 'origin'; then
    echo ""
    echo "⚠️  No GitHub remote found!"
    echo "Please create a repository on GitHub first, then add remote:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai-trading.git"
    echo ""
    read -p "Have you created a GitHub repo and want to add it now? (y/n): " add_remote
    
    if [ "$add_remote" = "y" ]; then
        read -p "Enter your GitHub repo URL: " repo_url
        git remote add origin $repo_url
        git branch -M main
        echo "✅ Remote added"
    fi
fi

# Push to GitHub
if git remote | grep -q 'origin'; then
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    echo ""
    echo "✅ Pushed to GitHub!"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Go to vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Add environment variables (see VERCEL_DEPLOYMENT.md)"
    echo "4. Deploy!"
    echo ""
    echo "Your JARVIS system will be live at:"
    echo "https://your-project.vercel.app"
else
    echo ""
    echo "⚠️  Skipped push. Add remote manually and push:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai-trading.git"
    echo "git push -u origin main"
fi

echo ""
echo "✨ Done!"
