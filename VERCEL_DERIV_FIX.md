# 🔧 VERCEL ENVIRONMENT VARIABLES - CRITICAL FIX

## ❌ **PROBLEM**
Your Deriv service is not working in production because environment variables are not being read correctly.

## ✅ **SOLUTION**

### **STEP 1: Verify Your Vercel Environment Variables**

Go to your Vercel project dashboard and check **Settings → Environment Variables**.

You MUST have these **EXACT** variable names (case-sensitive):

| Variable Name | Example Value | Your Actual Value |
|---------------|---------------|-------------------|
| `GEMINI_API_KEY` | AIzaSyARCJzNSlYd3crcnVnLVqyK0--KbT73UjM | (your Gemini key) |
| `DERIV_TOKEN` | ymGcPVj7dP04873c | (your 15-char Deriv token) |
| `TELEGRAM_BOT_TOKEN` | 8265907534:AAG... | (your bot token) |
| `TELEGRAM_CHAT_ID` | 5765732084 | (your chat ID) |

### **STEP 2: Check Each Variable's Scope**

For EACH variable, make sure **ALL THREE** checkboxes are selected:
- ☑️ **Production**
- ☑️ **Preview**
- ☑️ **Development**

### **STEP 3: Verify Deriv Token Format**

Your Deriv token MUST be **EXACTLY 15 characters**.

❌ **WRONG:**
```
DERIV_TOKEN=mGcPVj7dP04873c   (16 characters - has extra 'm')
```

✅ **CORRECT:**
```
DERIV_TOKEN=ymGcPVj7dP04873c  (15 characters)
```

Or if your actual token is without the 'y':
```
DERIV_TOKEN=mGcPVj7dP04873c   (15 characters)
```

**TO VERIFY YOUR TOKEN:**
1. Go to https://app.deriv.com/account/api-token
2. Check your token length
3. Copy it EXACTLY as shown (no extra spaces or characters)

---

## 🔍 **DEBUGGING CHECKLIST**

### **1. Check Vercel Build Logs**

Go to: **Vercel Dashboard → Deployments → Latest Deployment → Build Logs**

Look for these lines:
```
✅ GEMINI_API_KEY is set
✅ DERIV_TOKEN is set
✅ TELEGRAM_BOT_TOKEN is set
```

If you see `undefined` or errors, your env vars aren't loaded.

### **2. Test API Endpoint**

After adding environment variables, test your backend:

```bash
curl https://your-project.vercel.app/api/signals
```

Should return:
```json
{
  "success": true,
  "signal": { ... }
}
```

### **3. Check Browser Console**

Open your deployed site → F12 → Console

You should see:
```
✅ JARVIS: Deriv token loaded from environment
📡 JARVIS: Subscribing to realtime market data
```

**NOT:**
```
ℹ️ JARVIS: No token found - running in demo mode
⚠️ JARVIS: Cannot subscribe to balance - not authorized
```

---

## 🚀 **QUICK FIX STEPS**

### **Option A: Re-add Environment Variables (Recommended)**

Sometimes variables don't save correctly. Delete and re-add them:

1. Go to **Vercel Dashboard → Settings → Environment Variables**
2. **Delete all existing variables**
3. **Add them again ONE BY ONE** using this exact format:

#### Add GEMINI_API_KEY:
- Key: `GEMINI_API_KEY`
- Value: `AIzaSyARCJzNSlYd3crcnVnLVqyK0--KbT73UjM`
- Environments: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

#### Add DERIV_TOKEN:
- Key: `DERIV_TOKEN`
- Value: `ymGcPVj7dP04873c` (or your actual 15-char token)
- Environments: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

#### Add TELEGRAM_BOT_TOKEN:
- Key: `TELEGRAM_BOT_TOKEN`
- Value: `8265907534:AAGX4UYCyT77bRrolkY3TtE1uzCdxEJpJ28`
- Environments: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

#### Add TELEGRAM_CHAT_ID:
- Key: `TELEGRAM_CHAT_ID`
- Value: `5765732084`
- Environments: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

4. **Trigger a new deployment:**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Select **"Use existing Build Cache"** for faster deployment

---

### **Option B: Use Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add GEMINI_API_KEY production
# When prompted, paste: AIzaSyARCJzNSlYd3crcnVnLVqyK0--KbT73UjM

vercel env add DERIV_TOKEN production
# When prompted, paste: ymGcPVj7dP04873c

vercel env add TELEGRAM_BOT_TOKEN production
# When prompted, paste: 8265907534:AAGX4UYCyT77bRrolkY3TtE1uzCdxEJpJ28

vercel env add TELEGRAM_CHAT_ID production
# When prompted, paste: 5765732084

# Pull env vars to all environments
vercel env pull .env.production.local

# Redeploy
vercel --prod
```

---

## 📊 **VERIFICATION STEPS**

After redeploying:

### **1. Check Frontend Console**
Open https://your-project.vercel.app → F12 → Console

✅ **SUCCESS:**
```
✅ JARVIS: Deriv token loaded from environment
✅ JARVIS: Deriv Uplink Established
📡 JARVIS: Subscribing to realtime market data for 15 symbols
🎯 JARVIS: getAccountList callback invoked!
💰 Balance: $10,000.00
```

❌ **STILL FAILING:**
```
ℹ️ JARVIS: No token found - running in demo mode
⚠️ JARVIS: Cannot subscribe to balance - not authorized
```

### **2. Check Network Tab**
F12 → Network → Filter: WS (WebSocket)

You should see:
- Connection to `wss://ws.derivws.com/websockets/v3`
- Status: **101 Switching Protocols** (green)
- Messages flowing back and forth

### **3. Test Deriv API Directly**

```bash
# Test if your token is valid
curl -X POST https://ws.derivws.com/websockets/v3?app_id=1089 \
  -H "Content-Type: application/json" \
  -d '{
    "authorize": "ymGcPVj7dP04873c"
  }'
```

Should return:
```json
{
  "authorize": {
    "account_list": [ ... ],
    "balance": 10000,
    "currency": "USD"
  }
}
```

---

## 🔴 **COMMON ISSUES**

### **Issue 1: Token Length Wrong**
```
⚠️ JARVIS: Invalid Deriv token format - must be exactly 15 characters
```

**Fix:** Check token at https://app.deriv.com/account/api-token
- Count characters
- Remove any spaces or line breaks
- Should be EXACTLY 15 characters

### **Issue 2: Token Scopes Missing**
```
Error: AuthorizationRequired
```

**Fix:** Create new token with ALL scopes:
1. Go to https://app.deriv.com/account/api-token
2. Delete old token
3. Create new with scopes: Read, Trade, Trading Information, Payments
4. Update in Vercel

### **Issue 3: Environment Variables Not Updating**
```
ℹ️ JARVIS: No token found - running in demo mode
```

**Fix:**
1. Clear Vercel build cache
2. Redeploy with "Clear Cache and Deploy" option
3. Wait 2-3 minutes for deployment
4. Hard refresh browser (Ctrl+Shift+R)

---

## 📞 **NEED HELP?**

If still not working after following ALL steps:

1. **Share screenshot of:**
   - Vercel Environment Variables page (hide actual tokens)
   - Browser console errors
   - Vercel deployment logs

2. **Verify:**
   - Token length is EXACTLY 15 characters
   - All 3 environment checkboxes are selected
   - Deployment completed successfully
   - Hard refreshed browser (Ctrl+Shift+R)

---

**🎯 After fixing, you should see Deriv accounts and live market data in your dashboard!**
