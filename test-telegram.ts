// Test Telegram Signal - Run this to send example signal
import { sendTelegramSignal } from './services/telegramService';

const testSignal = {
  pair: 'BTCUSD',
  type: 'LONG' as const,
  confidence: 96,
  entry: 45250.5000,
  tp: 46800.0000,
  sl: 44500.0000,
  currentPrice: 45250.5000,
  timestamp: new Date().toLocaleTimeString(),
  riskProfile: 'INSTITUTIONAL GRADE V11.0 ELITE',
  reasons: [
    'Institutional Protocol: BULLISH CHoCH CONFIRMED',
    'Pattern Logic: BUTTERFLY HARMONIC PRO (94%)',
    'Network Intensity: 87% Core Delta'
  ],
  isDeepScanned: true
};

sendTelegramSignal(testSignal).then(success => {
  if (success) {
    console.log('✅ Test signal sent successfully to Telegram!');
  } else {
    console.log('❌ Failed to send test signal');
  }
});
