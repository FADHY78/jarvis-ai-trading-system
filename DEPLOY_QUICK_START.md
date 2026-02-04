# 🚀 Quick Start: Deploy JARVIS AI to Vercel

## Option 1: One-Click Deploy (Easiest)

### Windows:
```cmd
deploy-to-vercel.bat
```

### Mac/Linux:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Option 2: Manual Deploy

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
GEMINI_API_KEY=your_key_here
DERIV_TOKEN=your_token_here
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## Option 3: GitHub + Vercel (Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects settings ✅
4. Add environment variables
5. Click "Deploy"

### Step 3: Update MT5 EA
After deployment, update your EA:

```mql5
// In JARVIS_AI_EA.mq5, change:
input string API_URL = "https://your-project.vercel.app/api/signals";
```

In MT5:
```
Tools → Options → Expert Advisors → WebRequest
Add: https://your-project.vercel.app
```

## ✅ Verification

Test your deployed API:
```bash
curl https://your-project.vercel.app/api/signals
```

Should return signal data!

## 🎯 What You Get

- ✅ **HTTPS** - Required for MT5 WebRequest
- ✅ **Global Access** - Trade from anywhere
- ✅ **Free Hosting** - Generous free tier
- ✅ **Auto-Deploy** - Push to GitHub = instant deploy
- ✅ **99.9% Uptime** - Enterprise-grade infrastructure

## 📱 Your Live URLs

After deployment:
- Frontend: `https://your-project.vercel.app`
- Signals API: `https://your-project.vercel.app/api/signals`
- Telegram Test: `https://your-project.vercel.app/api/telegram/test`

## 🔧 Troubleshooting

**Build fails?**
- Check `package.json` has `vercel-build` script
- Verify all dependencies are listed

**API not working?**
- Check environment variables in Vercel
- View logs in Vercel dashboard

**MT5 can't connect?**
- Ensure HTTPS URL in WebRequest settings
- Recompile EA with new URL

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` for detailed guide!
