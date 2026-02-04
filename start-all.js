import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 JARVIS AI TRADING SYSTEM V12.0');
console.log('================================\n');

// Check if port is available
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Check backend port
const backendPortAvailable = await checkPort(3001);
if (!backendPortAvailable) {
  console.log('⚠️  Port 3001 is already in use!');
  console.log('   Backend server may already be running.');
  console.log('   Starting Frontend only...\n');
  
  // Start only frontend using exec (works better on Windows)
  const frontend = exec('npx vite', { cwd: __dirname });
  
  frontend.stdout.on('data', (data) => process.stdout.write(data));
  frontend.stderr.on('data', (data) => process.stderr.write(data));
  
  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err);
  });

  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down Frontend...');
    frontend.kill();
    process.exit(0);
  });
} else {
  // Start backend server
  console.log('📡 Starting Backend Server...');
  const backend = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  backend.on('error', (err) => {
    console.error('❌ Backend error:', err);
  });

  // Wait 2 seconds for backend to initialize
  setTimeout(() => {
    // Start frontend dev server using exec (more reliable on Windows)
    console.log('\n🎨 Starting Frontend...\n');
    const frontend = exec('npx vite', { cwd: __dirname });
    
    frontend.stdout.on('data', (data) => process.stdout.write(data));
    frontend.stderr.on('data', (data) => process.stderr.write(data));
    
    frontend.on('error', (err) => {
      console.error('❌ Frontend error:', err);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down JARVIS...');
      frontend.kill();
      backend.kill();
      process.exit(0);
    });
  }, 2000);

  console.log('\n✅ JARVIS is starting...');
  console.log('💡 Press Ctrl+C to stop all services\n');
}
