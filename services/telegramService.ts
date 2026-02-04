// Telegram Bot Service for Signal Alerts with ICT Integration

// Backend server URL (running on localhost)
const BACKEND_URL = 'http://localhost:3001';

// Debug: Log configuration status
console.log('🔧 JARVIS: Telegram Service Configuration');
console.log(`   Backend Server: ${BACKEND_URL}`);
console.log('✅ JARVIS: Using backend proxy for Telegram API');

interface SignalData {
  pair: string;
  type: 'LONG' | 'SHORT';
  confidence: number;
  entry: number;
  tp: number;
  sl: number;
  currentPrice: number;
  timestamp: string;
  riskProfile: string;
  reasons: string[];
  isDeepScanned?: boolean;
}

export const sendTelegramSignal = async (signal: SignalData): Promise<boolean> => {
  try {
    const emoji = signal.type === 'LONG' ? '🟢' : '🔴';
    const arrow = signal.type === 'LONG' ? '📈' : '📉';
    const direction = signal.type === 'LONG' ? 'BUY' : 'SELL';
    const scanBadge = signal.isDeepScanned ? '🔍 <b>DEEP SCAN</b>' : '';
    
    // Extract ICT factors from reasons
    const ictFactors = signal.reasons.filter(r => 
      r.includes('ICT') || r.includes('Kill Zone') || r.includes('OTE') || 
      r.includes('Power of 3') || r.includes('Institutional')
    );
    const hasICT = ictFactors.length > 0;
    const ictBadge = hasICT ? '⚡ <b>ICT POWERED</b>' : '';
    
    // Calculate 3 Take Profit levels with real risk/reward
    const riskAmount = Math.abs(signal.entry - signal.sl);
    const tp1 = signal.type === 'LONG' 
      ? signal.entry + (riskAmount * 1.5) 
      : signal.entry - (riskAmount * 1.5);
    const tp2 = signal.type === 'LONG' 
      ? signal.entry + (riskAmount * 2.5) 
      : signal.entry - (riskAmount * 2.5);
    const tp3 = signal.type === 'LONG' 
      ? signal.entry + (riskAmount * 4.0) 
      : signal.entry - (riskAmount * 4.0);
    
    // Calculate risk/reward ratios
    const rr1 = '1:1.5';
    const rr2 = '1:2.5';
    const rr3 = '1:4.0';
    
    // Confidence indicator
    let confidenceEmoji = '⚪';
    if (signal.confidence >= 90) confidenceEmoji = '🟢';
    else if (signal.confidence >= 80) confidenceEmoji = '🟡';
    else if (signal.confidence >= 70) confidenceEmoji = '🟠';
    else confidenceEmoji = '🔴';
    
    // Get key factors (non-ICT) for main display
    const keyFactors = signal.reasons.filter(r => 
      !r.includes('ICT') && !r.includes('Kill Zone') && !r.includes('OTE') && 
      !r.includes('Power of 3') && !r.includes('Institutional Flow')
    ).slice(0, 3);
    
    // Format the message with HTML for better formatting
    const message = `
${emoji} <b>JARVIS TRADING SIGNAL</b> ${arrow}

━━━━━━━━━━━━━━━━━━━━━
<b>${signal.pair}</b> • <b>${direction}</b>
${scanBadge} ${ictBadge}
━━━━━━━━━━━━━━━━━━━━━

${confidenceEmoji} <b>AI CONFIDENCE:</b> <code>${signal.confidence}%</code>
💰 <b>Current Price:</b> <code>${signal.currentPrice.toFixed(5)}</code>

<b>═══ TRADE SETUP ═══</b>
📍 <b>Entry:</b>        <code>${signal.entry.toFixed(5)}</code>

🎯 <b>Take Profit Levels:</b>
   TP1: <code>${tp1.toFixed(5)}</code> ${rr1}
   TP2: <code>${tp2.toFixed(5)}</code> ${rr2}
   TP3: <code>${tp3.toFixed(5)}</code> ${rr3}

🛡️ <b>Stop Loss:</b>    <code>${signal.sl.toFixed(5)}</code>

⚠️ <b>Risk Level:</b> ${signal.riskProfile}

<b>═══ KEY FACTORS ═══</b>
${keyFactors.map((r, i) => `${i === 0 ? '▪️' : '▫️'} ${r}`).join('\n')}

${hasICT ? `<b>⚡ ICT CONCEPTS DETECTED</b>
${ictFactors.slice(0, 3).map(r => {
  const clean = r.replace(/^⚡|🎯|📦|💰|📊|🔄/g, '').trim();
  return `🔸 ${clean}`;
}).join('\n')}
` : ''}
<b>═══════════════════</b>
⏰ ${signal.timestamp}
🤖 <i>JARVIS AI V12.0 + ICT</i>
    `.trim();

    // Create inline keyboard with action buttons
    // Note: URL buttons removed - Telegram API rejects localhost URLs
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 View Analysis', callback_data: 'view_analysis' },
          { text: '📈 Live Chart', callback_data: 'view_chart' }
        ],
        [
          { text: '🛡️ Risk Check', callback_data: 'risk_check' },
          { text: '⚡ Quick Trade', callback_data: 'execute_trade' }
        ],
        [
          { text: '📱 Dashboard', callback_data: 'open_dashboard' },
          { text: '📋 Main Menu', callback_data: 'main_menu' }
        ]
      ]
    };

    const response = await fetch(`${BACKEND_URL}/api/telegram/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      console.error('Telegram API Error:', data.error);
      return false;
    }

    console.log(`✅ Signal sent to Telegram: ${signal.pair} ${signal.type}`);
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
};

export const sendTelegramAlert = async (title: string, message: string): Promise<boolean> => {
  try {
    const formattedMessage = `
🔔 <b>${title}</b>

${message}

⏰ ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━
<i>JARVIS AI System Alert</i>
    `.trim();

    // Add quick action buttons
    // Note: URL buttons removed - Telegram API rejects localhost URLs
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Dashboard', callback_data: 'open_dashboard' },
          { text: '📈 Charts', callback_data: 'view_chart' }
        ],
        [
          { text: '📋 Main Menu', callback_data: 'main_menu' }
        ]
      ]
    };

    const response = await fetch(`${BACKEND_URL}/api/telegram/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: formattedMessage,
        parse_mode: 'HTML',
        reply_markup: keyboard
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    return false;
  }
};

// Test function to verify Telegram bot is working
export const testTelegramBot = async (): Promise<boolean> => {
  try {
    console.log('📱 Testing Telegram Bot via Backend...');
    console.log(`   Backend URL: ${BACKEND_URL}/api/telegram/test`);
    
    console.log('📤 Sending test request to backend server...');
    
    const response = await fetch(`${BACKEND_URL}/api/telegram/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (data.success) {
      console.log('✅ JARVIS: Telegram test message sent successfully!');
      console.log('📱 Check your Telegram app for the test message!');
      return true;
    } else {
      console.error('❌ JARVIS: Backend returned error:');
      console.error('   Error:', data.error);
      
      if (data.help) {
        console.error('💡 Help:', data.help);
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ JARVIS: Failed to connect to backend server:');
    console.error('   Error:', error);
    console.error('');
    console.error('🚨 BACKEND SERVER NOT RUNNING');
    console.error('');
    console.error('✅ Start the backend server:');
    console.error('   1. Open new terminal in VS Code');
    console.error('   2. Run: node server.js');
    console.error('   3. Server will start on port 3001');
    console.error('   4. Then test again');
    console.error('');
    console.error('💡 The backend proxies Telegram API calls');
    console.error('   Your browser → localhost:3001 → Telegram API');
    console.error('');
    console.error('📱 Once server is running, all alerts will work!');
    return false;
  }
};
