# 📱 JARVIS Telegram Bot Guide

Complete guide for using JARVIS AI Trading Bot on Telegram.

---

## 🚀 Setup

### 1. Create Your Bot

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Choose a name: `JARVIS Trading Bot`
5. Choose a username: `your_jarvis_trading_bot` (must end with "bot")
6. **Copy the bot token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

1. Search for `@userinfobot` in Telegram
2. Send `/start`
3. **Copy your numeric ID** (e.g., `5765732084`)

### 3. Start Your Bot

1. Search for your bot by username in Telegram
2. Click **START** button
3. You'll receive a welcome message once the system is running

### 4. Configure JARVIS

Add to `.env.local`:
```env
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

---

## 📨 Message Types

### 🎯 Trading Signals

Automated signals sent when AI detects high-probability trades.

**Format**:
```
🟢 JARVIS TRADING SIGNAL 📈
━━━━━━━━━━━━━━━━━━━━━
EUR/USD • BUY
🔍 DEEP SCAN ⚡ ICT POWERED
━━━━━━━━━━━━━━━━━━━━━

🟢 AI CONFIDENCE: 92%
💰 Current Price: 1.08450

═══ TRADE SETUP ═══
📍 Entry:        1.08400
🎯 Take Profit:  1.08800
🛡️ Stop Loss:    1.08200

📊 Risk/Reward: 1:2.00
⚠️ Risk Level: MODERATE

═══ KEY FACTORS ═══
▪️ Strong bullish structure
▫️ Demand zone respected
▫️ RSI divergence detected
▫️ Volume confirmation

⚡ ICT CONCEPTS DETECTED
🔸 London Kill Zone active
🔸 OTE entry at 70.8%
🔸 Fair Value Gap filled

═══════════════════
⏰ 14:35:22
🤖 JARVIS AI V12.0 + ICT
```

### 🔔 System Alerts

Status updates and notifications.

**Examples**:
- System startup confirmation
- Connection status updates
- Error notifications
- Market session changes

---

## 🎮 Interactive Buttons

Each signal includes interactive buttons for quick actions:

### 📊 View Analysis
- Opens detailed AI analysis page
- Shows all detected patterns
- Displays ICT concepts
- Market structure breakdown

### 📈 Live Chart
- Opens TradingView chart
- Shows real-time price action
- Includes indicators
- Multi-timeframe view

### 🛡️ Risk Check
- Risk assessment for the signal
- Position sizing calculator
- Risk/reward validation
- Stop loss verification

### ⚡ Quick Trade
- Fast trade execution (coming soon)
- Pre-filled order details
- One-click confirmation
- Instant order placement

### 📱 Open Dashboard
- Direct link to web interface
- Full system access
- All features available
- Works on mobile & desktop

---

## 🎯 Signal Indicators

### Confidence Levels

| Emoji | Range | Meaning |
|-------|-------|---------|
| 🟢 | 90-100% | Excellent - High probability |
| 🟡 | 80-89% | Good - Solid setup |
| 🟠 | 70-79% | Fair - Monitor closely |
| 🔴 | 60-69% | Weak - Use caution |

### Badges

| Badge | Meaning |
|-------|---------|
| 🔍 **DEEP SCAN** | Multi-timeframe analysis completed |
| ⚡ **ICT POWERED** | ICT concepts detected in setup |
| 🎯 **HIGH PRIORITY** | Urgent signal, strong confluence |
| 🔥 **HOT SIGNAL** | Immediate action recommended |

### ICT Concepts

When detected, signals include specific ICT concepts:

- 🌅 **Kill Zone**: London (2-5 AM EST) or NY (7-10 AM EST)
- 📐 **OTE**: Optimal Trade Entry (61.8-78.6% Fibonacci)
- 📦 **Breaker Block**: Failed support/resistance flip
- 💰 **Mitigation**: Price returning to institutional order
- 🔄 **Power of 3**: Accumulation → Manipulation → Distribution
- 📊 **Order Flow**: Institutional buying/selling detected
- 📏 **Fair Value Gap**: Imbalance in price action
- 🏦 **Institutional Flow**: Smart money footprints

---

## ⚙️ Bot Settings

### Customization (Coming Soon)

Future updates will include:

- Custom alert filters
- Preferred currency pairs
- Confidence threshold settings
- Time zone preferences
- Risk level filtering
- Session-specific alerts

### Notification Control

Current behavior:
- ✅ Signals sent automatically when detected
- ✅ System alerts for important events
- ✅ Error notifications for issues

---

## 🛠️ Troubleshooting

### Bot Not Responding

**Problem**: No messages received

**Solutions**:
1. ✅ Click START button in bot chat
2. ✅ Check JARVIS backend is running
3. ✅ Verify VPN is connected (if Telegram blocked)
4. ✅ Check `.env.local` credentials
5. ✅ Test in Settings page of JARVIS

### Messages Not Delivered

**Problem**: "Failed to send message"

**Solutions**:
1. Enable VPN if Telegram is blocked
2. Restart backend server
3. Verify bot token is correct
4. Check chat ID matches your account

### Buttons Not Working

**Problem**: Clicking buttons does nothing

**Solutions**:
1. Update Telegram app to latest version
2. Check backend webhook endpoint (future feature)
3. Dashboard link should always work
4. Some buttons are coming soon

---

## 📊 Message Examples

### Long Signal (Buy)

```
🟢 JARVIS TRADING SIGNAL 📈

EUR/USD • BUY
⚡ ICT POWERED

🟢 92% confidence
Entry: 1.08400
TP: 1.08800
SL: 1.08200
R/R: 1:2.00

[📊 Analysis] [📈 Chart] [🛡️ Risk] [📱 Dashboard]
```

### Short Signal (Sell)

```
🔴 JARVIS TRADING SIGNAL 📉

GBP/USD • SELL
🔍 DEEP SCAN

🟡 85% confidence
Entry: 1.26550
TP: 1.26150
SL: 1.26750
R/R: 1:2.00

[📊 Analysis] [📈 Chart] [🛡️ Risk] [📱 Dashboard]
```

### System Alert

```
🔔 System Status Update

Backend server reconnected successfully!

⏰ 14:35:22
━━━━━━━━━━━━━━━━
JARVIS AI System Alert

[📱 Dashboard] [📈 Charts]
```

---

## 🔐 Security

### Best Practices

1. ✅ **Never share bot token** with anyone
2. ✅ **Keep chat ID private** - it's your account
3. ✅ **Don't forward sensitive signals** publicly
4. ✅ **Revoke token if compromised** via @BotFather
5. ✅ **Use strong Telegram password**
6. ✅ **Enable 2FA on Telegram** for security

### Token Management

**To revoke compromised token**:
1. Go to @BotFather
2. Send `/mybots`
3. Select your bot
4. Choose "API Token"
5. Select "Revoke current token"
6. Generate new token
7. Update `.env.local`

---

## 💡 Tips

1. **Enable Notifications**: Keep Telegram notifications on for instant signals
2. **Pin Important Messages**: Pin signals you're tracking
3. **Use Multiple Devices**: Access bot from phone, tablet, desktop
4. **Create Groups**: Add bot to private group for team trading (future)
5. **Save Signals**: Use Telegram's "Saved Messages" for later review
6. **Quick Access**: Add bot to home screen on mobile

---

## 📈 Statistics (Coming Soon)

Future analytics will show:
- Total signals sent
- Win rate percentage
- Average risk/reward
- Most profitable pairs
- Best trading sessions
- ICT concept accuracy

---

## 🚧 Upcoming Features

### V13.0 Roadmap

- [ ] Bot commands (`/start`, `/help`, `/status`)
- [ ] Custom alert filters
- [ ] Trade execution via Telegram
- [ ] Performance analytics
- [ ] Multi-user support
- [ ] Group chat functionality
- [ ] Voice message signals
- [ ] Screenshot attachments
- [ ] Webhook for real-time updates

---

## 📞 Support

**Issues**:
- Check [README.md](./README.md) for troubleshooting
- Verify VPN connection if Telegram blocked
- Test in Settings page of JARVIS

**Questions**:
- Review this guide first
- Check [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
- Examine backend logs for errors

---

## 📄 Technical Details

### Message Format
- **Parse Mode**: HTML
- **Max Length**: 4096 characters
- **Encoding**: UTF-8
- **Buttons**: Inline keyboard (up to 8 buttons)

### API Endpoints Used
- `/sendMessage` - Send text messages
- `/answerCallbackQuery` - Handle button clicks (future)
- `/setWebhook` - Real-time updates (future)

### Backend Proxy
- **URL**: http://localhost:3001/api/telegram
- **Purpose**: Bypass network blocking
- **Method**: HTTP POST with fetch API
- **Retry Logic**: Automatic error handling

---

**JARVIS Telegram Bot**  
*Real-time Trading Signals on Your Phone*

Made with ❤️ by JARVIS AI Team
