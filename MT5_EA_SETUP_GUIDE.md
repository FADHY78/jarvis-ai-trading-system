# 🤖 JARVIS AI MT5 Expert Advisor Setup Guide

## 📋 Installation Steps

### 1. Copy EA to MetaTrader 5
1. Open MT5
2. Click `File` → `Open Data Folder`
3. Navigate to `MQL5\Experts\`
4. Copy `JARVIS_AI_EA.mq5` to this folder
5. Restart MT5 or click `Refresh` in Navigator

### 2. Enable WebRequest for API
⚠️ **CRITICAL: MT5 blocks external URLs by default**

1. In MT5: `Tools` → `Options`
2. Go to `Expert Advisors` tab
3. Check ✅ `Allow WebRequest for listed URLs`
4. Add this URL: `http://localhost:3001`
5. Click `OK`

### 3. Enable Auto Trading
1. Click the `AutoTrading` button in MT5 toolbar (make it GREEN)
2. Or press `Ctrl + E`

### 4. Attach EA to Chart
1. Open any chart (EUR/USD, BOOM 500, etc.)
2. In Navigator panel, find `JARVIS_AI_EA` under Experts
3. Drag and drop onto chart
4. Configure parameters:
   - **LotSize**: 0.01 (recommended for testing)
   - **RiskPercent**: 2.0
   - **EnableAutoTrading**: true
   - **CloseOnSignalChange**: true
   - **UsePartialTPs**: true
5. Check ✅ `Allow Algorithmic Trading`
6. Click `OK`

## ⚙️ How It Works

### Signal Flow
```
JARVIS AI Signal Page → Backend API → MT5 EA → Deriv Account
```

### EA Behavior
1. **Checks signals every 3 seconds** from `http://localhost:3001/api/signals`
2. **Opens trades** when signal confidence ≥ 85%
3. **Manages 3 TP levels**:
   - TP1 (1:1.5 R:R) → Closes 30% of position
   - TP2 (1:2.5 R:R) → Closes 40% of position
   - TP3 (1:4.0 R:R) → Closes remaining 30%
4. **Auto-closes** position when signal direction changes
5. **Sends Telegram notifications** for all trades

## 📊 Parameters Explained

| Parameter | Default | Description |
|-----------|---------|-------------|
| `LotSize` | 0.01 | Trade volume per signal |
| `RiskPercent` | 2.0 | Max risk per trade (%) |
| `MagicNumber` | 123456 | Unique ID for EA trades |
| `API_URL` | localhost:3001 | JARVIS API endpoint |
| `SignalCheckInterval` | 3000 | Check signals every 3 seconds |
| `EnableAutoTrading` | true | Enable/disable auto trading |
| `CloseOnSignalChange` | true | Close when signal flips |
| `UsePartialTPs` | true | Enable 3-level TP management |

## 🎯 Testing Checklist

### Before Going Live
- [ ] Test on DEMO account first
- [ ] Verify WebRequest is enabled
- [ ] Confirm JARVIS backend is running (`npm run dev`)
- [ ] Check signals appear in signal page
- [ ] Start with small lot size (0.01)
- [ ] Monitor first few trades manually

### Monitoring
1. **Check MT5 Journal tab** for EA logs
2. **Watch Experts tab** for real-time status
3. **Monitor Telegram** for trade notifications
4. **Review signal page** for accuracy

## 🔧 Troubleshooting

### ❌ "Error connecting to JARVIS API"
**Solution**: Add `http://localhost:3001` to allowed URLs in MT5 settings

### ❌ "No signals available yet"
**Solution**: 
- Ensure backend is running (`npm run dev`)
- Open AI Signals page to generate signals
- Wait for high-confidence signals (≥85%)

### ❌ "OrderSend error"
**Solution**:
- Check account balance
- Verify lot size is valid for your account
- Ensure you're trading allowed symbols

### ❌ EA not trading
**Solution**:
- Enable AutoTrading button (green)
- Check `EnableAutoTrading = true` in EA parameters
- Verify EA is attached to chart (smiling face icon)

## 📈 Performance Tips

### Optimization
1. **Use on volatile pairs**: BOOM/CRASH, Volatility indices
2. **Match timeframes**: EA works best with H1/H4 signals
3. **Monitor during active sessions**: London/New York overlap
4. **Risk management**: Never risk more than 2% per trade

### Best Practices
- ✅ Start with demo account
- ✅ Test for 1 week before live
- ✅ Use proper position sizing
- ✅ Keep backend running during trading hours
- ✅ Monitor Telegram for alerts

## 🚀 Going Live

When ready for real trading:

1. Test on demo for minimum 1 week
2. Verify 60%+ win rate
3. Switch to real account
4. Start with minimum lot size
5. Gradually increase as confidence grows

## 📱 Telegram Notifications

EA sends notifications for:
- ✅ Trade opened
- 🎯 TP1, TP2, TP3 hit
- ❌ Position closed
- ⚠️ Signal direction changed
- 📊 Risk warnings

## ⚠️ Important Notes

1. **Keep backend running**: EA needs JARVIS API active
2. **Monitor regularly**: Check trades daily
3. **Respect risk management**: Max 2% per trade
4. **Test thoroughly**: Use demo before live
5. **Stay updated**: Check for EA updates

## 🆘 Support

Issues? Check:
1. MT5 Journal tab for error messages
2. Backend terminal for API logs
3. Telegram for trade confirmations
4. Signal page for current signals

---

**🤖 JARVIS AI Trading System V12.0**  
*Intelligent. Automated. Profitable.*
