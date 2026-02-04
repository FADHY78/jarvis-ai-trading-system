# 🚀 JARVIS Auto-Startup Guide

## Quick Start

### Option 1: Double-Click to Start (Recommended)
1. **Double-click** `start-jarvis.bat`
2. Wait for both services to load
3. Browser opens automatically at http://localhost:5173
4. Backend runs on http://localhost:3001

### Option 2: Use npm command
```bash
npm start
```

---

## 🔄 Auto-Start on Windows Boot

### Method 1: Startup Folder (Simple)
1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Create a shortcut to `start-jarvis.bat` in this folder
4. Right-click shortcut → Properties
5. Set "Run": **Minimized** (optional)
6. Click OK

### Method 2: Task Scheduler (Advanced)
1. Press `Win + R`, type `taskschd.msc`, press Enter
2. Click "Create Basic Task"
3. Name: "JARVIS AI Trading System"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program: `C:\Windows\System32\cmd.exe`
7. Arguments: `/c "cd /d "D:\jarvis-ai-trading-system" && start-jarvis.bat"`
8. Finish

---

## 📊 Services Overview

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main UI Dashboard |
| **Backend** | http://localhost:3001 | Telegram Bot API Proxy |

---

## ⚠️ Important Notes

### VPN Requirement
- **Telegram API is blocked** on your network
- **Solution**: Install and enable VPN before starting JARVIS
- Recommended VPNs:
  - Proton VPN (free)
  - Windscribe (free 10GB)
  - TunnelBear (free 500MB)

### Token Configuration
- Deriv Token: Configured in `.env.local` (15 characters)
- Telegram Bot Token: Configured in `.env.local`
- Get Deriv token: https://app.deriv.com/account/api-token

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

### Frontend won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

### Telegram not working
1. ✅ Enable VPN
2. ✅ Restart backend: `npm run backend`
3. ✅ Test in Settings page

---

## 🎯 Manual Control

### Start services separately:
```bash
# Backend only
npm run backend

# Frontend only
npm run dev
```

### Stop all services:
- Press `Ctrl + C` in terminal
- Or close the command window

---

## 📞 Support

- GitHub Issues: Report bugs
- Documentation: Check README.md
- Logs: Check terminal output

---

**JARVIS AI Trading System V12.0 + ICT**
*Powered by Smart Money Concepts & Inner Circle Trader*
