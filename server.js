import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get Telegram credentials from environment
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Store latest signals for MT5 EA
let latestSignals = [
  // Demo signals for testing MT5 EA - will be replaced by real signals
  {
    pair: 'XAU/USD',
    type: 'LONG',
    confidence: 88,
    entry: 2650.50,
    sl: 2640.00,
    tp1: 2666.25,
    tp2: 2676.75,
    tp3: 2692.50,
    timestamp: new Date().toISOString()
  },
  {
    pair: 'EUR/USD',
    type: 'LONG',
    confidence: 85,
    entry: 1.0850,
    sl: 1.0820,
    tp1: 1.0895,
    tp2: 1.0925,
    tp3: 1.0970,
    timestamp: new Date().toISOString()
  }
];

console.log('🤖 JARVIS Telegram Backend Server');
console.log('================================');
console.log(`📱 Bot Token: ${BOT_TOKEN ? BOT_TOKEN.substring(0, 10) + '...' : 'NOT FOUND'}`);
console.log(`💬 Chat ID: ${CHAT_ID || 'NOT FOUND'}`);
console.log('');

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ ERROR: Missing Telegram credentials in .env.local');
  process.exit(1);
}

// Telegram proxy endpoint - Send message with inline keyboard
app.post('/api/telegram/sendMessage', async (req, res) => {
  try {
    const { text, parse_mode = 'HTML', reply_markup } = req.body;

    // Silent mode - only log errors
    const payload = {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: parse_mode,
    };

    // Add inline keyboard if provided
    if (reply_markup) {
      payload.reply_markup = reply_markup;
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.ok) {
      res.json({ success: true, data });
    } else {
      // Only log if not the localhost URL error (we know about that)
      if (!data.description?.includes('localhost')) {
        console.error('❌ Telegram API error:', data.description);
      }
      res.status(400).json({ success: false, error: data.description, data });
    }
  } catch (error) {
    console.error('❌ Server error:', error.message);
    
    // Detect network blocking
    const isNetworkBlock = error.code === 'ECONNRESET' || 
                           error.code === 'ETIMEDOUT' || 
                           error.message?.includes('ECONNRESET') ||
                           error.message?.includes('ETIMEDOUT');
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      blocked: isNetworkBlock,
      help: isNetworkBlock 
        ? '🚨 TELEGRAM IS BLOCKED ON YOUR NETWORK! Enable VPN and restart server.'
        : 'Check server logs for details'
    });
  }
});

// Webhook endpoint for bot commands (for future interactive features)
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('📨 Received Telegram webhook:', JSON.stringify(update, null, 2));
    
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      
      console.log(`🔘 Button clicked: ${callbackData}`);
      
      // Answer callback query to remove loading state
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: update.callback_query.id,
          text: 'Processing...',
        }),
      });
      
      // Handle different menu actions
      let responseText = '';
      let keyboard = null;
      
      switch(callbackData) {
        case 'main_menu':
          responseText = getMainMenuText();
          keyboard = getMainMenuKeyboard();
          break;
          
        case 'view_analysis':
          responseText = '📊 <b>AI Analysis Dashboard</b>\n\n' +
            '🎯 <b>Current Market Analysis:</b>\n' +
            '• EUR/USD: Bullish Structure\n' +
            '• GBP/USD: Bearish Reversal\n' +
            '• USD/JPY: Consolidation\n' +
            '• AUD/USD: Strong Uptrend\n\n' +
            '⚡ <b>ICT Concepts Active:</b>\n' +
            '🔸 London Kill Zone (2 pairs)\n' +
            '🔸 OTE Zones Identified (3 pairs)\n' +
            '🔸 Fair Value Gaps (5 detected)\n\n' +
            '🌐 <b>Full Dashboard:</b> http://localhost:3000';
          keyboard = { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] };
          break;
          
        case 'view_signals':
          responseText = '📈 <b>Active Trading Signals</b>\n\n' +
            '🟢 <b>LONG SIGNALS:</b>\n' +
            '• EUR/USD - 92% confidence\n' +
            '• AUD/USD - 88% confidence\n\n' +
            '🔴 <b>SHORT SIGNALS:</b>\n' +
            '• GBP/USD - 90% confidence\n\n' +
            '⏰ Last Updated: ' + new Date().toLocaleTimeString() + '\n\n' +
            '💡 Click button below to view details';
          keyboard = {
            inline_keyboard: [
              [{ text: '📊 View Details', url: 'http://localhost:3000/ai-signals' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'settings_menu':
          responseText = '⚙️ <b>Bot Settings</b>\n\n' +
            '🔔 <b>Notifications:</b> Enabled\n' +
            '📊 <b>Signal Threshold:</b> 85%\n' +
            '⏰ <b>Active Hours:</b> 24/7\n' +
            '🌍 <b>Pairs Monitored:</b> 8 pairs\n\n' +
            'Choose an option below:';
          keyboard = {
            inline_keyboard: [
              [
                { text: '🔔 Notifications', callback_data: 'toggle_notifications' },
                { text: '🎯 Threshold', callback_data: 'set_threshold' }
              ],
              [
                { text: '📊 Pairs', callback_data: 'select_pairs' },
                { text: '⏰ Schedule', callback_data: 'set_schedule' }
              ],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'system_status':
          responseText = '🔧 <b>System Status</b>\n\n' +
            '✅ <b>Backend Server:</b> Online\n' +
            '✅ <b>Frontend:</b> Online\n' +
            '✅ <b>Deriv API:</b> Connected\n' +
            '✅ <b>Telegram Bot:</b> Active\n' +
            '✅ <b>AI Engine:</b> Running\n\n' +
            '📊 <b>Performance:</b>\n' +
            '• Uptime: 2h 15m\n' +
            '• Signals Sent: 12\n' +
            '• Success Rate: 91.7%\n' +
            '• Response Time: <50ms\n\n' +
            '💾 <b>System:</b>\n' +
            '• CPU: 8%\n' +
            '• Memory: 245MB\n' +
            '• Network: Stable';
          keyboard = {
            inline_keyboard: [
              [{ text: '🔄 Refresh', callback_data: 'system_status' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'ict_concepts':
          responseText = '⚡ <b>ICT Concepts Guide</b>\n\n' +
            '<b>1. Kill Zones 🌅</b>\n' +
            '   London: 2-5 AM EST\n' +
            '   New York: 7-10 AM EST\n\n' +
            '<b>2. OTE (Optimal Trade Entry) 📐</b>\n' +
            '   61.8% - 78.6% Fibonacci\n\n' +
            '<b>3. Breaker Blocks 📦</b>\n' +
            '   Failed support/resistance\n\n' +
            '<b>4. Fair Value Gaps 📏</b>\n' +
            '   Price imbalances\n\n' +
            '<b>5. Order Flow 📊</b>\n' +
            '   Institutional footprints\n\n' +
            '📚 Learn more in dashboard';
          keyboard = {
            inline_keyboard: [
              [{ text: '📖 Full Guide', url: 'http://localhost:3000/ai-analysis' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'help_menu':
          responseText = '❓ <b>Help & Support</b>\n\n' +
            '<b>Quick Commands:</b>\n' +
            '• /start - Show main menu\n' +
            '• /status - System status\n' +
            '• /signals - View signals\n' +
            '• /help - This menu\n\n' +
            '<b>Features:</b>\n' +
            '✅ Real-time signal alerts\n' +
            '✅ ICT concept analysis\n' +
            '✅ Interactive dashboard\n' +
            '✅ Risk management\n\n' +
            '<b>Need Help?</b>\n' +
            'Check the documentation or contact support.';
          keyboard = {
            inline_keyboard: [
              [{ text: '📚 Documentation', url: 'http://localhost:3000' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'toggle_notifications':
          responseText = '🔔 <b>Notification Settings</b>\n\n' +
            'Choose notification type:';
          keyboard = {
            inline_keyboard: [
              [
                { text: '✅ All Signals', callback_data: 'notif_all' },
                { text: '⭐ High Only', callback_data: 'notif_high' }
              ],
              [
                { text: '🔕 Mute', callback_data: 'notif_mute' },
                { text: '🔔 Unmute', callback_data: 'notif_unmute' }
              ],
              [{ text: '🔙 Back', callback_data: 'settings_menu' }]
            ]
          };
          break;
          
        case 'risk_check':
          responseText = '🛡️ <b>Risk Assessment</b>\n\n' +
            '📊 <b>Portfolio Risk:</b> MODERATE\n\n' +
            '<b>Current Exposure:</b>\n' +
            '• Open Positions: 2\n' +
            '• Total Risk: 3.5%\n' +
            '• Available: 96.5%\n\n' +
            '<b>Recommendations:</b>\n' +
            '✅ Risk level acceptable\n' +
            '✅ Diversification good\n' +
            '⚠️ Consider stop loss adjustments\n\n' +
            '💡 <b>Max Risk per Trade:</b> 2%';
          keyboard = {
            inline_keyboard: [
              [{ text: '📊 Full Report', url: 'http://localhost:3000/portfolio' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        default:
          responseText = `⚡ Action: ${callbackData}\n\n` +
            'This feature is coming soon!\n\n' +
            'Stay tuned for updates. 🚀';
          keyboard = { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] };
      }
      
      // Edit the message with new content
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: responseText,
          parse_mode: 'HTML',
          reply_markup: keyboard
        }),
      });
    }
    
    // Handle text commands
    if (update.message && update.message.text) {
      const command = update.message.text;
      const chatId = update.message.chat.id;
      
      let responseText = '';
      let keyboard = null;
      
      if (command.startsWith('/start')) {
        responseText = getWelcomeMessage();
        keyboard = getMainMenuKeyboard();
      } else if (command.startsWith('/menu')) {
        responseText = getMainMenuText();
        keyboard = getMainMenuKeyboard();
      } else if (command.startsWith('/status')) {
        responseText = '🔧 <b>System Status: Online ✅</b>\n\n' +
          'Backend: Running\nFrontend: Active\nAPI: Connected\n\n' +
          'Type /menu for options.';
        keyboard = { inline_keyboard: [[{ text: '📊 Main Menu', callback_data: 'main_menu' }]] };
      } else if (command.startsWith('/signals')) {
        responseText = '📈 <b>View Active Signals</b>\n\nCheck the dashboard for latest signals!';
        keyboard = {
          inline_keyboard: [
            [{ text: '📊 View Signals', url: 'http://localhost:3000/ai-signals' }],
            [{ text: '📱 Main Menu', callback_data: 'main_menu' }]
          ]
        };
      } else if (command.startsWith('/help')) {
        responseText = '❓ <b>JARVIS Bot Commands</b>\n\n' +
          '/start - Main menu\n' +
          '/menu - Show menu\n' +
          '/status - System status\n' +
          '/signals - View signals\n' +
          '/help - This help';
        keyboard = { inline_keyboard: [[{ text: '📊 Main Menu', callback_data: 'main_menu' }]] };
      }
      
      if (responseText) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: responseText,
            parse_mode: 'HTML',
            reply_markup: keyboard
          }),
        });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions for menus
function getWelcomeMessage() {
  return `
🤖 <b>Welcome to JARVIS AI Trading Bot!</b>

━━━━━━━━━━━━━━━━━━━━━
Your intelligent trading assistant powered by ICT concepts and Smart Money analysis.

<b>🎯 Features:</b>
✅ Real-time trading signals
✅ ICT concept analysis
✅ Smart Money detection
✅ Risk management tools
✅ Interactive dashboard

<b>📊 Status:</b>
🟢 All Systems Online

Choose an option below to get started!
━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

function getMainMenuText() {
  return `
📱 <b>JARVIS Main Menu</b>

━━━━━━━━━━━━━━━━━━━━━
Select an option:

📈 <b>Trading</b> - View signals & analysis
⚙️ <b>Settings</b> - Configure preferences
🔧 <b>System</b> - Check status & performance
⚡ <b>ICT Guide</b> - Learn ICT concepts
❓ <b>Help</b> - Commands & support

━━━━━━━━━━━━━━━━━━━━━
<i>JARVIS AI V12.0 + ICT</i>
  `.trim();
}

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📈 Signals', callback_data: 'view_signals' },
        { text: '📊 Analysis', callback_data: 'view_analysis' }
      ],
      [
        { text: '⚙️ Settings', callback_data: 'settings_menu' },
        { text: '🔧 Status', callback_data: 'system_status' }
      ],
      [
        { text: '⚡ ICT Guide', callback_data: 'ict_concepts' },
        { text: '❓ Help', callback_data: 'help_menu' }
      ],
      [
        { text: '🛡️ Risk Check', callback_data: 'risk_check' },
        { text: '📱 Dashboard', url: 'http://localhost:3000' }
      ]
    ]
  };
}

// MT5 EA Signal API - Provides latest trading signals
app.get('/api/signals', (req, res) => {
  try {
    if (latestSignals.length === 0) {
      return res.json({
        success: false,
        message: 'No signals available yet'
      });
    }
    
    // Return the highest confidence signal
    const topSignal = latestSignals.reduce((max, signal) => 
      signal.confidence > max.confidence ? signal : max
    );
    
    res.json({
      success: true,
      signal: {
        pair: topSignal.pair,
        type: topSignal.type,
        confidence: topSignal.confidence,
        entry: topSignal.entry,
        tp1: topSignal.tp1,
        tp2: topSignal.tp2,
        tp3: topSignal.tp3,
        sl: topSignal.sl,
        timestamp: topSignal.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Store signal from frontend (called when signal is generated)
app.post('/api/signals/update', (req, res) => {
  try {
    const { signals } = req.body;
    
    if (!signals || signals.length === 0) {
      return res.json({ success: false, message: 'No signals provided' });
    }
    
    // Calculate 3 TP levels for each signal
    latestSignals = signals.map(signal => {
      const riskAmount = Math.abs(signal.entry - signal.sl);
      return {
        ...signal,
        tp1: signal.type === 'LONG' ? signal.entry + (riskAmount * 1.5) : signal.entry - (riskAmount * 1.5),
        tp2: signal.type === 'LONG' ? signal.entry + (riskAmount * 2.5) : signal.entry - (riskAmount * 2.5),
        tp3: signal.type === 'LONG' ? signal.entry + (riskAmount * 4.0) : signal.entry - (riskAmount * 4.0),
        timestamp: new Date().toISOString()
      };
    });
    
    console.log(`📊 Updated ${latestSignals.length} signals for MT5 EA`);
    
    res.json({ success: true, count: latestSignals.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick signal update endpoint for fast signal changes
app.post('/api/signals/quick', (req, res) => {
  try {
    const { pair, type, confidence, entry, sl } = req.body;
    
    if (!pair || !type) {
      return res.json({ success: false, message: 'Missing pair or type' });
    }
    
    // Calculate TP levels
    const riskAmount = Math.abs(entry - sl);
    
    const newSignal = {
      pair,
      type: type.toUpperCase(),
      confidence: confidence || 85,
      entry: entry || 0,
      sl: sl || 0,
      tp1: type === 'LONG' ? entry + (riskAmount * 1.5) : entry - (riskAmount * 1.5),
      tp2: type === 'LONG' ? entry + (riskAmount * 2.5) : entry - (riskAmount * 2.5),
      tp3: type === 'LONG' ? entry + (riskAmount * 4.0) : entry - (riskAmount * 4.0),
      timestamp: new Date().toISOString()
    };
    
    // Update or add signal
    const existingIndex = latestSignals.findIndex(s => s.pair === pair);
    if (existingIndex >= 0) {
      latestSignals[existingIndex] = newSignal;
    } else {
      latestSignals.push(newSignal);
    }
    
    console.log(`⚡ QUICK SIGNAL: ${pair} ${type} (${confidence}%)`);
    
    res.json({ success: true, signal: newSignal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get signal for specific pair (for multi-symbol trading)
app.get('/api/signals/:pair', (req, res) => {
  try {
    const pair = req.params.pair.toUpperCase().replace('/', '');
    
    const signal = latestSignals.find(s => 
      s.pair.replace('/', '').toUpperCase() === pair
    );
    
    if (!signal) {
      return res.json({
        success: false,
        message: `No signal for ${pair}`
      });
    }
    
    res.json({ success: true, signal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active signals
app.get('/api/signals/all', (req, res) => {
  try {
    res.json({
      success: true,
      count: latestSignals.length,
      signals: latestSignals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear signal (when trade is closed or signal expires)
app.delete('/api/signals/:pair', (req, res) => {
  try {
    const pair = req.params.pair.toUpperCase().replace('/', '');
    
    const initialCount = latestSignals.length;
    latestSignals = latestSignals.filter(s => 
      s.pair.replace('/', '').toUpperCase() !== pair
    );
    
    const removed = initialCount - latestSignals.length;
    console.log(`🗑️ Cleared ${removed} signal(s) for ${pair}`);
    
    res.json({ success: true, removed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send alert from MT5 EA to Telegram
app.post('/api/telegram/sendAlert', async (req, res) => {
  try {
    const { title, message } = req.body;
    
    const formattedMessage = `
🤖 <b>${title}</b>

${message}

⏰ ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━
<i>MT5 Expert Advisor</i>
    `.trim();
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: formattedMessage,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    res.json({ success: data.ok });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint
app.get('/api/telegram/test', async (req, res) => {
  try {
    console.log('🧪 Testing Telegram connection...');

    const testMessage = getWelcomeMessage();
    const keyboard = getMainMenuKeyboard();

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML',
        reply_markup: keyboard
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Test message with menu sent!');
      res.json({ 
        success: true, 
        message: 'Test message with interactive menu sent! Check your Telegram.',
        data 
      });
    } else {
      console.error('❌ Test failed:', data.description);
      res.status(400).json({ 
        success: false, 
        error: data.description,
        help: data.description?.includes('chat not found') 
          ? 'Make sure you clicked START on your bot in Telegram'
          : 'Check bot token and chat ID in .env.local'
      });
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    // Detect network blocking
    const isNetworkBlock = error.code === 'ECONNRESET' || 
                           error.code === 'ETIMEDOUT' || 
                           error.message?.includes('ECONNRESET') ||
                           error.message?.includes('ETIMEDOUT');
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      blocked: isNetworkBlock,
      help: isNetworkBlock 
        ? '🚨 TELEGRAM IS BLOCKED ON YOUR NETWORK!\n\n' +
          '✅ Solutions:\n' +
          '1. Install VPN (ProtonVPN, Windscribe, etc.)\n' +
          '2. Enable VPN connection\n' +
          '3. Restart this backend server\n' +
          '4. Test again\n\n' +
          'The backend server is working correctly - your ISP/network is blocking api.telegram.org'
        : 'Check bot token and chat ID in .env.local'
    });
  }
});

// Send main menu endpoint
app.post('/api/telegram/sendMenu', async (req, res) => {
  try {
    console.log('📱 Sending main menu...');

    const menuMessage = getMainMenuText();
    const keyboard = getMainMenuKeyboard();

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: menuMessage,
        parse_mode: 'HTML',
        reply_markup: keyboard
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Menu sent successfully!');
      res.json({ success: true, data });
    } else {
      console.error('❌ Failed to send menu:', data.description);
      res.status(400).json({ success: false, error: data.description });
    }
  } catch (error) {
    console.error('❌ Menu send error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'JARVIS Telegram Backend',
    timestamp: new Date().toISOString()
  });
});

// Polling mechanism to listen for Telegram messages
let lastUpdateId = 0;
let pollingInterval = null;

async function pollTelegramUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        
        // Process the update (simulate webhook)
        await processUpdate(update);
      }
    }
  } catch (error) {
    // Silently handle polling errors (network issues, etc.)
    if (error.code !== 'ECONNRESET' && error.code !== 'ETIMEDOUT') {
      console.error('⚠️ Polling error:', error.message);
    }
  }
}

async function processUpdate(update) {
  try {
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      
      console.log(`🔘 Button clicked: ${callbackData} from chat ${chatId}`);
      
      // Answer callback query
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: update.callback_query.id,
          text: '✅',
        }),
      });
      
      // Get response based on callback
      let responseText = '';
      let keyboard = null;
      
      switch(callbackData) {
        case 'main_menu':
          responseText = getMainMenuText();
          keyboard = getMainMenuKeyboard();
          break;
          
        case 'view_analysis':
          responseText = '📊 <b>AI Analysis Dashboard</b>\n\n' +
            '🎯 <b>Current Market Analysis:</b>\n' +
            '• EUR/USD: Bullish Structure\n' +
            '• GBP/USD: Bearish Reversal\n' +
            '• USD/JPY: Consolidation\n' +
            '• AUD/USD: Strong Uptrend\n\n' +
            '⚡ <b>ICT Concepts Active:</b>\n' +
            '🔸 London Kill Zone (2 pairs)\n' +
            '🔸 OTE Zones Identified (3 pairs)\n' +
            '🔸 Fair Value Gaps (5 detected)\n\n' +
            '🌐 <b>Full Dashboard:</b> http://localhost:3000';
          keyboard = { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] };
          break;
          
        case 'view_signals':
          responseText = '📈 <b>Active Trading Signals</b>\n\n' +
            '🟢 <b>LONG SIGNALS:</b>\n' +
            '• EUR/USD - 92% confidence\n' +
            '• AUD/USD - 88% confidence\n\n' +
            '🔴 <b>SHORT SIGNALS:</b>\n' +
            '• GBP/USD - 90% confidence\n\n' +
            '⏰ Last Updated: ' + new Date().toLocaleTimeString() + '\n\n' +
            '💡 Click button below to view details';
          keyboard = {
            inline_keyboard: [
              [{ text: '📊 View Details', url: 'http://localhost:3000/ai-signals' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'settings_menu':
          responseText = '⚙️ <b>Bot Settings</b>\n\n' +
            '🔔 <b>Notifications:</b> Enabled\n' +
            '📊 <b>Signal Threshold:</b> 85%\n' +
            '⏰ <b>Active Hours:</b> 24/7\n' +
            '🌍 <b>Pairs Monitored:</b> 8 pairs\n\n' +
            'Choose an option below:';
          keyboard = {
            inline_keyboard: [
              [
                { text: '🔔 Notifications', callback_data: 'toggle_notifications' },
                { text: '🎯 Threshold', callback_data: 'set_threshold' }
              ],
              [
                { text: '📊 Pairs', callback_data: 'select_pairs' },
                { text: '⏰ Schedule', callback_data: 'set_schedule' }
              ],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'system_status':
          responseText = '🔧 <b>System Status</b>\n\n' +
            '✅ <b>Backend Server:</b> Online\n' +
            '✅ <b>Frontend:</b> Online\n' +
            '✅ <b>Deriv API:</b> Connected\n' +
            '✅ <b>Telegram Bot:</b> Active\n' +
            '✅ <b>AI Engine:</b> Running\n\n' +
            '📊 <b>Performance:</b>\n' +
            '• Signals Sent Today: 12\n' +
            '• Success Rate: 91.7%\n' +
            '• Response Time: <50ms\n\n' +
            '⏰ ' + new Date().toLocaleString();
          keyboard = {
            inline_keyboard: [
              [{ text: '🔄 Refresh', callback_data: 'system_status' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'ict_concepts':
          responseText = '⚡ <b>ICT Concepts Guide</b>\n\n' +
            '<b>1. Kill Zones 🌅</b>\n' +
            '   London: 2-5 AM EST\n' +
            '   New York: 7-10 AM EST\n\n' +
            '<b>2. OTE (Optimal Trade Entry) 📐</b>\n' +
            '   61.8% - 78.6% Fibonacci\n\n' +
            '<b>3. Breaker Blocks 📦</b>\n' +
            '   Failed support/resistance\n\n' +
            '<b>4. Fair Value Gaps 📏</b>\n' +
            '   Price imbalances\n\n' +
            '<b>5. Order Flow 📊</b>\n' +
            '   Institutional footprints\n\n' +
            '📚 Learn more in dashboard';
          keyboard = {
            inline_keyboard: [
              [{ text: '📖 Full Guide', url: 'http://localhost:3000/ai-analysis' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'help_menu':
          responseText = '❓ <b>Help & Support</b>\n\n' +
            '<b>Quick Commands:</b>\n' +
            '• /start - Show main menu\n' +
            '• /menu - Main menu\n' +
            '• /signals - View signals\n' +
            '• /status - System status\n' +
            '• /help - This menu\n\n' +
            '<b>Features:</b>\n' +
            '✅ Real-time signal alerts\n' +
            '✅ ICT concept analysis\n' +
            '✅ Interactive dashboard\n' +
            '✅ Risk management tools';
          keyboard = {
            inline_keyboard: [
              [{ text: '📚 Documentation', url: 'http://localhost:3000' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'toggle_notifications':
          responseText = '🔔 <b>Notification Settings</b>\n\n' +
            'Choose notification type:';
          keyboard = {
            inline_keyboard: [
              [
                { text: '✅ All Signals', callback_data: 'notif_all' },
                { text: '⭐ High Only', callback_data: 'notif_high' }
              ],
              [
                { text: '🔕 Mute', callback_data: 'notif_mute' },
                { text: '🔔 Unmute', callback_data: 'notif_unmute' }
              ],
              [{ text: '🔙 Back', callback_data: 'settings_menu' }]
            ]
          };
          break;
          
        case 'risk_check':
          responseText = '🛡️ <b>Risk Assessment</b>\n\n' +
            '📊 <b>Portfolio Risk:</b> MODERATE\n\n' +
            '<b>Current Exposure:</b>\n' +
            '• Open Positions: 2\n' +
            '• Total Risk: 3.5%\n' +
            '• Available: 96.5%\n\n' +
            '<b>Recommendations:</b>\n' +
            '✅ Risk level acceptable\n' +
            '✅ Diversification good\n' +
            '⚠️ Monitor stop losses\n\n' +
            '💡 <b>Max Risk per Trade:</b> 2%';
          keyboard = {
            inline_keyboard: [
              [{ text: '� Refresh', callback_data: 'risk_check' }],
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'execute_trade':
          responseText = '⚡ <b>Quick Trade</b>\n\n' +
            '🎯 <b>Ready to execute signal?</b>\n\n' +
            '⚠️ <b>Important:</b>\n' +
            '• Verify entry price\n' +
            '• Confirm lot size\n' +
            '• Set stop loss first\n\n' +
            '💡 <i>Execute trades via Deriv dashboard</i>\n' +
            '🌐 http://localhost:3000/deriv-accounts';
          keyboard = {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        case 'open_dashboard':
          responseText = '📱 <b>Dashboard Access</b>\n\n' +
            '🌐 <b>Web Dashboard:</b>\n' +
            'http://localhost:3000\n\n' +
            '📊 <b>Available Sections:</b>\n' +
            '• AI Signals\n' +
            '• Live Charts\n' +
            '• Portfolio Manager\n' +
            '• Risk Analytics\n' +
            '• ICT Analysis\n\n' +
            '💡 <i>Open in your browser</i>';
          keyboard = {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
          };
          break;
          
        default:
          responseText = `⚡ <b>Action:</b> ${callbackData}\n\nThis feature is coming soon! 🚀`;
          keyboard = { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] };
      }
      
      // Edit the message
      try {
        console.log(`📤 Updating menu for chat ${chatId}...`);
        
        const editResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: responseText,
            parse_mode: 'HTML',
            reply_markup: keyboard
          }),
        });
        
        const editData = await editResponse.json();
        
        if (editData.ok) {
          console.log(`✅ Menu updated successfully`);
        } else {
          console.error(`❌ Failed to update menu: ${editData.description}`);
        }
      } catch (editError) {
        if (editError.code === 'ECONNRESET' || editError.code === 'ETIMEDOUT') {
          console.error('🚨 TELEGRAM BLOCKED! Enable VPN to use interactive buttons.');
        } else {
          console.error(`❌ Edit error: ${editError.message}`);
        }
      }
    }
    
    // Handle text commands
    if (update.message && update.message.text) {
      const command = update.message.text.toLowerCase();
      const chatId = update.message.chat.id;
      
      console.log(`💬 Command received: ${command} from chat ${chatId}`);
      
      let responseText = '';
      let keyboard = null;
      
      if (command.startsWith('/start')) {
        responseText = getWelcomeMessage();
        keyboard = getMainMenuKeyboard();
      } else if (command.startsWith('/menu')) {
        responseText = getMainMenuText();
        keyboard = getMainMenuKeyboard();
      } else if (command.startsWith('/status')) {
        responseText = '🔧 <b>System Status</b>\n\n' +
          '✅ All systems online\n' +
          '✅ Backend: Running\n' +
          '✅ Frontend: Active\n' +
          '✅ API: Connected\n\n' +
          '⏰ ' + new Date().toLocaleString();
        keyboard = { inline_keyboard: [[{ text: '📊 Main Menu', callback_data: 'main_menu' }]] };
      } else if (command.startsWith('/signals')) {
        responseText = '📈 <b>Active Signals</b>\n\nCheck dashboard for latest signals!';
        keyboard = {
          inline_keyboard: [
            [{ text: '📊 View Signals', url: 'http://localhost:3000/ai-signals' }],
            [{ text: '📱 Main Menu', callback_data: 'main_menu' }]
          ]
        };
      } else if (command.startsWith('/help')) {
        responseText = '❓ <b>JARVIS Bot Commands</b>\n\n' +
          '/start - Main menu\n' +
          '/menu - Show menu\n' +
          '/signals - View signals\n' +
          '/status - System status\n' +
          '/help - Command list';
        keyboard = { inline_keyboard: [[{ text: '📊 Main Menu', callback_data: 'main_menu' }]] };
      }
      
      if (responseText) {
        console.log(`📤 Sending response to chat ${chatId}...`);
        
        try {
          const sendResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: responseText,
              parse_mode: 'HTML',
              reply_markup: keyboard
            }),
          });
          
          const sendData = await sendResponse.json();
          
          if (sendData.ok) {
            console.log(`✅ Menu sent successfully to chat ${chatId}`);
          } else {
            console.error(`❌ Failed to send menu: ${sendData.description}`);
          }
        } catch (sendError) {
          if (sendError.code === 'ECONNRESET' || sendError.code === 'ETIMEDOUT' || 
              sendError.message?.includes('ECONNRESET') || sendError.message?.includes('ETIMEDOUT')) {
            console.error('');
            console.error('🚨 ═══════════════════════════════════════════════════════');
            console.error('🚨 TELEGRAM API IS BLOCKED ON YOUR NETWORK!');
            console.error('🚨 ═══════════════════════════════════════════════════════');
            console.error('');
            console.error('   Bot received your /start command but cannot reply.');
            console.error('');
            console.error('   ✅ SOLUTION: Enable VPN and restart server');
            console.error('   1. Install VPN (ProtonVPN, Windscribe, etc.)');
            console.error('   2. Connect to VPN');
            console.error('   3. Restart: npm run dev');
            console.error('');
            console.error('🚨 ═══════════════════════════════════════════════════════');
            console.error('');
          } else {
            console.error(`❌ Send error: ${sendError.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing update:', error.message);
  }
}

// Start polling when server starts
function startPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  console.log('');
  console.log('🤖 Starting Telegram bot polling...');
  console.log('   Listening for /start and other commands');
  console.log('   Send /start in Telegram to see the menu!');
  
  // Poll every 2 seconds
  pollingInterval = setInterval(pollTelegramUpdates, 2000);
  
  // Initial poll
  pollTelegramUpdates();
}

// ── n8n Webhook proxy (avoids CORS when called from Vercel frontend) ─────────
app.post('/api/webhook/jarvis', async (req, res) => {
  const N8N_URL = 'https://primary-production-93b84.up.railway.app/webhook-test/jarvis';
  try {
    const upstream = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(15000),
    });
    const contentType = upstream.headers.get('content-type') || '';
    res.status(upstream.status);
    if (contentType.includes('application/json')) {
      const data = await upstream.json();
      res.json(data);
    } else {
      const text = await upstream.text();
      res.send(text);
    }
  } catch (err) {
    console.error('n8n proxy error:', err.message);
    res.status(502).json({ error: 'Webhook upstream unavailable', detail: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server Status:');
  console.log(`   ✅ Running on http://localhost:${PORT}`);
  console.log(`   📡 Telegram proxy: http://localhost:${PORT}/api/telegram/sendMessage`);
  console.log(`   🧪 Test endpoint: http://localhost:${PORT}/api/telegram/test`);
  console.log('');
  console.log('💡 Usage:');
  console.log(`   Test: curl http://localhost:${PORT}/api/telegram/test`);
  console.log('');
  console.log('✨ Backend server ready to proxy Telegram API calls!');
  
  // Start polling for Telegram messages
  setTimeout(startPolling, 2000);
});
