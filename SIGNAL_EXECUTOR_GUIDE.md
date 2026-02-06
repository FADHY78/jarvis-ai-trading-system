# JARVIS Signal Executor EA - Setup Guide

## 🚀 Overview

The **JARVIS Signal Executor** is an ultra-fast EA that connects to your JARVIS AI Trading System and executes trades based on live signals. It supports XAUUSD and EURUSD with instant execution and smart exit logic.

---

## 📦 Files Created

| File | Location | Purpose |
|------|----------|---------|
| `JARVIS_SIGNAL_EXECUTOR.mq5` | Project folder | The main EA file |

---

## ⚙️ Installation

### Step 1: Copy EA to MT5

1. Copy `JARVIS_SIGNAL_EXECUTOR.mq5` to:
   ```
   C:\Users\<YourName>\AppData\Roaming\MetaQuotes\Terminal\<ID>\MQL5\Experts\
   ```

2. Open **MetaEditor** (F4 in MT5)

3. Click **Compile** (F7)

### Step 2: Enable WebRequest

**CRITICAL:** The EA needs permission to access your signal server.

1. In MT5: **Tools → Options → Expert Advisors**
2. Check ✅ **Allow WebRequest for listed URL**
3. Click **Add** and enter: `http://localhost:3001`
4. Click **OK**

![WebRequest Setup](https://i.imgur.com/example.png)

### Step 3: Start Your Signal Server

```bash
cd d:\jarvis-ai-trading-system
node server.js
```

You should see:
```
🤖 JARVIS Telegram Backend Server
================================
Server running on port 3001
```

### Step 4: Attach EA to Charts

1. Open **XAUUSD M1** chart (fast timeframe for quick signals)
2. Drag **JARVIS_SIGNAL_EXECUTOR** onto the chart
3. Configure settings:

---

## 🎛️ EA Settings

### Server Connection
| Setting | Default | Description |
|---------|---------|-------------|
| SignalServerURL | `http://localhost:3001/api/signals` | Your JARVIS API endpoint |
| PollIntervalMS | 500 | How often to check for signals (ms) |
| EnableWebRequest | true | Enable API communication |

### Trading Settings
| Setting | Default | Description |
|---------|---------|-------------|
| LotSize_XAUUSD | 0.05 | Lot size for gold trades |
| LotSize_EURUSD | 0.10 | Lot size for EUR/USD trades |
| MagicNumber | 888999 | Unique ID for EA trades |
| MaxSpread_XAUUSD | 35 | Max spread for gold (points) |
| MaxSpread_EURUSD | 15 | Max spread for EUR/USD (points) |

### Fast Exit Settings
| Setting | Default | Description |
|---------|---------|-------------|
| EnableFastExit | true | Close on signal reversal |
| EnableQuickProfit | true | Take quick profits |
| QuickProfitXAU | 150 | Quick profit target for gold (pts) |
| QuickProfitEUR | 80 | Quick profit target for EUR (pts) |
| MinProfitToExit | 30 | Min profit before reversal exit (pts) |

### Trailing Stop
| Setting | Default | Description |
|---------|---------|-------------|
| UseTrailingStop | true | Enable trailing stop |
| TrailingStart_XAU | 100 | Start trailing for gold (pts) |
| TrailingStep_XAU | 50 | Trail distance for gold (pts) |
| TrailingStart_EUR | 50 | Start trailing for EUR (pts) |
| TrailingStep_EUR | 25 | Trail distance for EUR (pts) |

### Risk Management
| Setting | Default | Description |
|---------|---------|-------------|
| DefaultSL_XAU | 300 | Default SL for gold (pts) |
| DefaultSL_EUR | 150 | Default SL for EUR (pts) |
| MaxDailyLoss | 500 | Max daily loss before stopping ($) |
| MaxPositions | 2 | Max simultaneous positions |

### Confidence Filter
| Setting | Default | Description |
|---------|---------|-------------|
| MinConfidence | 75 | Minimum signal confidence (%) |
| OnlyHighConfidence | false | Only trade 90%+ signals |

---

## 📡 Signal API Endpoints

Your server now supports these endpoints:

### Get Latest Signal
```
GET http://localhost:3001/api/signals
```

Returns:
```json
{
  "success": true,
  "signal": {
    "pair": "XAU/USD",
    "type": "LONG",
    "confidence": 88,
    "entry": 2650.50,
    "sl": 2640.00,
    "tp1": 2666.25,
    "tp2": 2676.75,
    "tp3": 2692.50,
    "timestamp": "2026-02-04T10:30:00.000Z"
  }
}
```

### Get Signal for Specific Pair
```
GET http://localhost:3001/api/signals/XAUUSD
GET http://localhost:3001/api/signals/EURUSD
```

### Update Signal Quickly
```
POST http://localhost:3001/api/signals/quick
Content-Type: application/json

{
  "pair": "XAU/USD",
  "type": "LONG",
  "confidence": 92,
  "entry": 2655.00,
  "sl": 2645.00
}
```

### Get All Signals
```
GET http://localhost:3001/api/signals/all
```

### Clear Signal
```
DELETE http://localhost:3001/api/signals/XAUUSD
```

---

## 🔄 How It Works

### Signal Flow

```
┌─────────────────────────────────────────────────────────────┐
│  JARVIS AI SYSTEM (Web Dashboard)                          │
│  ├── Generates signals from AI analysis                    │
│  └── Sends to: POST /api/signals/update                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  NODE.JS SERVER (server.js on port 3001)                   │
│  ├── Stores signals in memory                              │
│  └── Serves: GET /api/signals                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ (polls every 500ms)
┌─────────────────────────────────────────────────────────────┐
│  JARVIS SIGNAL EXECUTOR EA (MT5)                           │
│  ├── Reads signal from API                                 │
│  ├── Validates (confidence, spread, positions)             │
│  ├── Executes trade instantly                              │
│  └── Manages: trailing, quick profit, reversal exit        │
└─────────────────────────────────────────────────────────────┘
```

### Execution Logic

1. **Poll Server** - Every 500ms checks for new signals
2. **Detect Change** - Compares with last signal
3. **Validate** - Checks confidence, spread, positions
4. **Execute** - Opens trade with calculated SL/TP
5. **Manage** - Trailing stop, quick profit, reversal exit

### Signal Reversal Handling

When signal changes from LONG to SHORT (or vice versa):

1. EA detects the reversal
2. Checks existing positions for that pair
3. If position is opposite to new signal AND in profit/breakeven:
   - Closes the position immediately
4. Opens new position in signal direction

---

## 🧪 Testing

### Test Signal API

```bash
# Check if server is responding
curl http://localhost:3001/api/signals

# Send a test signal
curl -X POST http://localhost:3001/api/signals/quick \
  -H "Content-Type: application/json" \
  -d '{"pair":"XAU/USD","type":"LONG","confidence":90,"entry":2650,"sl":2640}'
```

### Test EA

1. Attach EA to XAUUSD M1 chart
2. Enable AutoTrading (green button)
3. Watch Experts tab for:

```
═══════════════════════════════════════════════════════════
📡 NEW SIGNAL RECEIVED!
   Pair: XAU/USD | Type: LONG
   Confidence: 90%
   Entry: 2650.00 | SL: 2640.00
═══════════════════════════════════════════════════════════
⚡ EXECUTING SIGNAL TRADE:
   XAUUSD LONG @ 2650.50
   SL: 2640.00 | TP: 2675.00
   Confidence: 90%
═══════════════════════════════════════════════════════════
✅ TRADE EXECUTED SUCCESSFULLY!
═══════════════════════════════════════════════════════════
```

---

## 🌐 Production Deployment

For Vercel deployment, change the server URL:

1. In EA settings, change `SignalServerURL` to:
   ```
   https://jarvis-ai-trading-system.vercel.app/api/signals
   ```

2. In MT5 WebRequest settings, add:
   ```
   https://jarvis-ai-trading-system.vercel.app
   ```

---

## ⚠️ Important Notes

1. **One EA per account** - Only run one instance of this EA
2. **Same symbols** - EA handles both XAUUSD and EURUSD from one chart
3. **Server must be running** - Start server before EA
4. **WebRequest permission** - Required for API access
5. **Demo first** - Test on demo account before live trading

---

## 🔧 Troubleshooting

### EA not receiving signals

1. Check if server is running: `curl http://localhost:3001/api/signals`
2. Verify WebRequest is enabled in MT5
3. Check Expert tab for errors

### Trade not executing

1. Check spread (may be too high)
2. Check confidence (may be below threshold)
3. Check max positions (may be reached)
4. Check daily loss limit

### "WebRequest not allowed" error

Add the URL to MT5:
- Tools → Options → Expert Advisors → Allow WebRequest
- Add: `http://localhost:3001`

---

## 📊 Expected Results

With proper signals:

- **Response time:** < 1 second from signal to execution
- **Quick profits:** Captured at 150pts (gold) / 80pts (EUR)
- **Trailing stops:** Lock in profits on extended moves
- **Signal reversal:** Fast exit and re-entry on direction change

---

**Happy Trading! 🚀**
