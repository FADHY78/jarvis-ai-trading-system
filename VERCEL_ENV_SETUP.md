# 🚀 Vercel Environment Variables Setup

## Critical Issue: Missing Environment Variables

Your deployment is failing because environment variables are not configured in Vercel.

### **ERROR ANALYSIS**
```
Global News Intelligence System failed: Error: An API Key must be set when running in a browser
```
This means `GEMINI_API_KEY` is missing from Vercel environment variables.

---

## ✅ **STEP-BY-STEP FIX**

### **Option 1: Add via Vercel Dashboard (Recommended)**

1. **Go to your Vercel project:**
   ```
   https://vercel.com/dashboard
   ```

2. **Click on your project** (jarvis-ai-trading-system)

3. **Navigate to Settings → Environment Variables**

4. **Add the following variables ONE BY ONE:**

   | Variable Name | Value | Environment |
   |---------------|-------|-------------|
   | `GEMINI_API_KEY` | `AIzaSyARCJzNSlYd3crcnVnLVqyK0--KbT73UjM` | Production, Preview, Development |
   | `DERIV_TOKEN` | `mGcPVj7dP04873c` | Production, Preview, Development |
   | `TELEGRAM_BOT_TOKEN` | `8265907534:AAGX4UYCyT77bRrolkY3TtE1uzCdxEJpJ28` | Production, Preview, Development |
   | `TELEGRAM_CHAT_ID` | `5765732084` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production only |

5. **Click "Save" after each variable**

6. **Redeploy your application:**
   - Go to **Deployments** tab
   - Click the **three dots** on the latest deployment
   - Click **Redeploy**
   - Select **Use existing Build Cache** (faster)

---

### **Option 2: Add via Vercel CLI**

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add GEMINI_API_KEY production
# Paste: AIzaSyARCJzNSlYd3crcnVnLVqyK0--KbT73UjM

vercel env add DERIV_TOKEN production
# Paste: mGcPVj7dP04873c

vercel env add TELEGRAM_BOT_TOKEN production
# Paste: 8265907534:AAGX4UYCyT77bRrolkY3TtE1uzCdxEJpJ28

vercel env add TELEGRAM_CHAT_ID production
# Paste: 5765732084

vercel env add NODE_ENV production
# Paste: production

# Redeploy
vercel --prod
```

---

## 🧪 **VERIFY THE FIX**

After redeploying with environment variables:

### **1. Test API Endpoint**
```bash
curl https://your-project.vercel.app/api/signals
```

**Expected Response:**
```json
{
  "success": true,
  "signal": {
    "pair": "EUR/USD",
    "type": "LONG",
    "confidence": 92,
    "entry": 1.08543,
    "tp1": 1.08785,
    "tp2": 1.08945,
    "tp3": 1.09187,
    "sl": 1.08340
  }
}
```

### **2. Check Frontend**
- Open `https://your-project.vercel.app`
- Dashboard should load without "An API Key must be set" error
- News section should work
- AI Analysis should generate insights

### **3. Test Telegram Bot**
- Send `/start` to your bot
- Should receive professional menu
- Backend is now on HTTPS

---

## 🔧 **MT5 EA UPDATE REQUIRED**

After successful deployment, update your MT5 EA:

### **1. Edit JARVIS_AI_EA.mq5 Line 15:**

**Before:**
```mql5
input string API_URL = "http://localhost:3001/api/signals";
```

**After:**
```mql5
input string API_URL = "https://your-project.vercel.app/api/signals";
```

Replace `your-project.vercel.app` with your actual Vercel URL.

### **2. Add to MT5 WebRequest Allowed URLs:**
1. Open MT5
2. Tools → Options → Expert Advisors
3. Click **"Allow WebRequest for listed URL"**
4. Add: `https://your-project.vercel.app`
5. Click **OK**

### **3. Recompile EA:**
1. Open MetaEditor (F4 in MT5)
2. Open JARVIS_AI_EA.mq5
3. Press **F7** to compile
4. Look for "0 error(s), 0 warning(s)"

### **4. Test EA:**
1. Attach EA to a chart
2. Enable **AutoTrading** (Ctrl+E)
3. Check Experts tab for log messages:
   ```
   🚀 JARVIS AI Expert Advisor Started!
   📡 Connected to: https://your-project.vercel.app/api/signals
   ```

---

## 📊 **COMMON ERRORS AFTER DEPLOYMENT**

### **Error: "An API Key must be set"**
- ❌ Environment variables not added
- ✅ **Fix:** Add GEMINI_API_KEY to Vercel dashboard

### **Error: "404 Not Found"**
- ❌ API routes not deployed
- ✅ **Fix:** Check vercel.json routes configuration
- ✅ Redeploy with `vercel --prod`

### **Error: "CORS Policy Blocked"**
- ❌ Frontend calling wrong API URL
- ✅ **Fix:** Update frontend API_BASE_URL to Vercel URL

### **Telegram Bot Not Responding**
- ❌ TELEGRAM_BOT_TOKEN not set
- ✅ **Fix:** Add TELEGRAM_BOT_TOKEN to Vercel env vars
- ✅ Restart Telegram bot polling

---

## 🎯 **NEXT STEPS**

1. ✅ Add environment variables to Vercel dashboard
2. ✅ Redeploy application
3. ✅ Test `/api/signals` endpoint
4. ✅ Update MT5 EA with HTTPS URL
5. ✅ Add Vercel URL to MT5 WebRequest whitelist
6. ✅ Recompile and test MT5 EA
7. ✅ Verify Telegram bot works with HTTPS backend

---

## 🆘 **SUPPORT**

If you still see errors after following this guide:

1. **Check Vercel Deployment Logs:**
   - Vercel Dashboard → Deployments → Click deployment → Runtime Logs

2. **Check Browser Console:**
   - F12 → Console tab → Look for red errors

3. **Verify Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure all 5 variables are set

4. **Test API Directly:**
   ```bash
   curl -v https://your-project.vercel.app/api/signals
   ```

---

**🚀 Your JARVIS AI system will be fully operational once environment variables are configured!**
