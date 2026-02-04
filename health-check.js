#!/usr/bin/env node

/**
 * JARVIS System Health Check
 * Verifies all services are configured correctly
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('🔍 JARVIS SYSTEM HEALTH CHECK');
console.log('================================\n');

let hasErrors = false;

// Check Node.js version
console.log('1️⃣  Node.js Version');
const nodeVersion = process.version;
console.log(`   ✅ ${nodeVersion}\n`);

// Check environment variables
console.log('2️⃣  Environment Variables');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const DERIV_TOKEN = process.env.DERIV_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN.length > 20) {
  console.log(`   ✅ Telegram Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
} else {
  console.log('   ❌ Telegram Bot Token: Missing or invalid');
  hasErrors = true;
}

if (TELEGRAM_CHAT_ID) {
  console.log(`   ✅ Telegram Chat ID: ${TELEGRAM_CHAT_ID}`);
} else {
  console.log('   ❌ Telegram Chat ID: Missing');
  hasErrors = true;
}

if (DERIV_TOKEN && DERIV_TOKEN.length === 15) {
  console.log(`   ✅ Deriv Token: ${DERIV_TOKEN.substring(0, 5)}... (15 chars)`);
} else if (DERIV_TOKEN && DERIV_TOKEN.length > 0) {
  console.log(`   ⚠️  Deriv Token: Invalid length (${DERIV_TOKEN.length} chars, need 15)`);
  console.log('   💡 Get valid token: https://app.deriv.com/account/api-token');
} else {
  console.log('   ⚠️  Deriv Token: Not configured (demo mode)');
}

if (GEMINI_API_KEY && GEMINI_API_KEY.length > 20) {
  console.log(`   ✅ Gemini API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);
} else {
  console.log('   ⚠️  Gemini API Key: Not configured');
}

console.log('');

// Check required dependencies
console.log('3️⃣  Dependencies');
const requiredPackages = [
  'express',
  'cors',
  'node-fetch',
  'dotenv',
  'react',
  'vite'
];

for (const pkg of requiredPackages) {
  try {
    await import(pkg);
    console.log(`   ✅ ${pkg}`);
  } catch (error) {
    console.log(`   ❌ ${pkg} - Not installed`);
    hasErrors = true;
  }
}

console.log('');

// Check port availability
console.log('4️⃣  Port Availability');
const checkPort = async (port) => {
  return new Promise((resolve) => {
    import('net').then(({ default: net }) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  });
};

const frontendPortAvailable = await checkPort(5173);
const backendPortAvailable = await checkPort(3001);

if (frontendPortAvailable) {
  console.log('   ✅ Frontend Port 5173: Available');
} else {
  console.log('   ⚠️  Frontend Port 5173: In use (stop other instance)');
}

if (backendPortAvailable) {
  console.log('   ✅ Backend Port 3001: Available');
} else {
  console.log('   ⚠️  Backend Port 3001: In use (stop other instance)');
}

console.log('');

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (hasErrors) {
  console.log('❌ SYSTEM CHECK FAILED');
  console.log('');
  console.log('⚠️  Fix the errors above before starting JARVIS');
  console.log('');
  console.log('📝 Common fixes:');
  console.log('   1. Check .env.local file exists');
  console.log('   2. Run: npm install');
  console.log('   3. Get Telegram token from @BotFather');
  console.log('   4. Get Deriv token from app.deriv.com/account/api-token');
  process.exit(1);
} else {
  console.log('✅ SYSTEM CHECK PASSED');
  console.log('');
  console.log('🚀 Ready to start JARVIS!');
  console.log('');
  console.log('💡 Start commands:');
  console.log('   npm start       - Start all services');
  console.log('   npm run dev     - Frontend only');
  console.log('   npm run backend - Backend only');
  console.log('');
  console.log('⚠️  IMPORTANT: Enable VPN for Telegram!');
  console.log('   Telegram API is blocked on your network');
  console.log('   Install ProtonVPN, Windscribe, or similar');
  process.exit(0);
}
