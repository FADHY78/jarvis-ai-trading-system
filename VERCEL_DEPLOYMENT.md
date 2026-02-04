# Vercel Deployment Guide for JARVIS AI Trading System

## 🚀 Deploy to Vercel (3 Minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "JARVIS AI Trading System V12.0"

# Create GitHub repo and push
# (Create new repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai-trading.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings ✅
5. Click "Deploy"

### Step 3: Add Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```
GEMINI_API_KEY=AIzaSyARCJzNSlYd3crcnVnLVqyK0--KbT73UjM
DERIV_TOKEN=mGcPVj7dP04873c
TELEGRAM_BOT_TOKEN=8265907534:AAGX4UYCyT77bRrolkY3TtE1uzCdxEJpJ28
TELEGRAM_CHAT_ID=5765732084
NODE_ENV=production
```

4. Click "Save"
5. Redeploy (Deployments → ⋯ → Redeploy)

### Step 4: Update MT5 EA

After deployment, you'll get a URL like: `https://jarvis-ai-trading.vercel.app`

Update your EA:

```mql5
input string API_URL = "https://jarvis-ai-trading.vercel.app/api/signals";
```

In MT5 Settings, allow this URL:
```
Tools → Options → Expert Advisors → WebRequest URLs
Add: https://jarvis-ai-trading.vercel.app
```

## 🎯 Your Live URLs

After deployment:

- **Frontend**: `https://your-project.vercel.app`
- **API Endpoint**: `https://your-project.vercel.app/api/signals`
- **Telegram Test**: `https://your-project.vercel.app/api/telegram/test`

## ✅ Verification

Test your API:
```bash
curl https://your-project.vercel.app/api/signals
```

Should return:
```json
{
  "success": true,
  "signal": {
    "pair": "EURUSD",
    "type": "LONG",
    "confidence": 92,
    ...
  }
}
```

## 🔧 Troubleshooting

### Build Fails
- Check `vercel-build` script in package.json
- Verify all dependencies are listed

### API Not Working
- Check Environment Variables are set
- Verify Telegram tokens are correct
- Check Vercel Function Logs

### MT5 Can't Connect
- Ensure HTTPS URL is in WebRequest allowed list
- Check EA uses correct Vercel URL
- Verify API endpoint returns data

## 📱 Continuous Deployment

Every push to GitHub automatically deploys to Vercel:

```bash
git add .
git commit -m "Updated trading logic"
git push
# ✅ Auto-deploys in 30 seconds!
```

## 🎉 You're Live!

Your JARVIS AI system is now:
- ✅ Hosted on Vercel (HTTPS)
- ✅ Accessible from MT5 worldwide
- ✅ Auto-updating on every push
- ✅ Free hosting (generous limits)

---

**🤖 JARVIS AI Trading System V12.0**  
*Now Globally Accessible via HTTPS*
