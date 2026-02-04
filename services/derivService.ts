
const DERIV_WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Get token from environment (configured in vite.config.ts)
const TOKEN = process.env.DERIV_TOKEN || '';

// Validate token format - Deriv tokens are exactly 15 characters
const isValidToken = TOKEN && TOKEN.length === 15;

if (isValidToken) {
  console.log('✅ JARVIS: Deriv token loaded from environment');
} else if (TOKEN && TOKEN.length > 0) {
  console.warn('⚠️ JARVIS: Invalid Deriv token format - must be exactly 15 characters. Get a valid token from https://app.deriv.com/account/api-token');
  console.warn('ℹ️ JARVIS: Running in demo mode');
} else {
  console.log('ℹ️ JARVIS: No token found - running in demo mode');
  console.log('💡 Get your token from: https://app.deriv.com/account/api-token');
}

export interface DerivAccount {
  loginid: string;
  balance: number;
  currency: string;
  account_type: 'real' | 'demo';
  is_virtual: boolean;
}

export interface DerivSymbol {
  display_name: string;
  symbol: string;
  market_display_name: string;
  submarket_display_name: string;
  exchange_is_open: boolean;
}

export interface DerivTick {
  symbol: string;
  quote: number;
  epoch: number;
}

class DerivService {
  private socket: WebSocket | null = null;
  private callbacks: Map<string, (data: any) => void> = new Map();
  private tickCallbacks: Map<string, (tick: DerivTick) => void> = new Map();
  private subscribedSymbols: Set<string> = new Set(); // Track subscribed symbols
  private connectionPromise: Promise<boolean> | null = null;
  private pingInterval: any = null;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private isAuthorized = false;
  private authorizationPromise: Promise<boolean> | null = null;

  connect(): Promise<boolean> {
    if (this.connectionPromise && this.isConnecting) return this.connectionPromise;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Close existing socket if any
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }

        this.socket = new WebSocket(DERIV_WS_URL);

        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            console.error('JARVIS: Deriv connection timeout');
            this.socket.close();
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ JARVIS: Deriv Uplink Established');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.authorize();
          this.startPing();
          resolve(true);
        };

        this.socket.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            
            // Handle authorization response
            if (data.msg_type === 'authorize') {
              if (data.error) {
                console.error('❌ JARVIS: Authorization failed');
                console.error('   Error:', data.error.message);
                console.log('💡 Get a valid token from: https://app.deriv.com/account/api-token');
                console.log('   Required scopes: Read, Trade, Trading information, Payments');
                console.log('ℹ️ JARVIS: Continuing in demo mode with $10,000 virtual balance');
                this.isAuthorized = false;
              } else {
                console.log('✅ JARVIS: Authenticated with Deriv account:', data.authorize.loginid);
                console.log('   Balance:', data.authorize.balance, data.authorize.currency);
                
                // Log all accounts if available
                if (data.authorize.account_list && data.authorize.account_list.length > 0) {
                  console.log('📊 JARVIS: Found', data.authorize.account_list.length, 'accounts:');
                  data.authorize.account_list.forEach((acc: any) => {
                    const accountType = acc.is_virtual ? '🎮 Demo' : '💰 Real';
                    console.log(`   ${accountType}: ${acc.loginid} - ${parseFloat(acc.balance || '0').toLocaleString()} ${acc.currency}`);
                  });
                }
                
                this.isAuthorized = true;
                
                // Call authorize callback if set - this passes account_list to the app
                if (this.callbacks.has('authorize')) {
                  this.callbacks.get('authorize')!(data);
                }
              }
              return;
            }
            
            // Handle errors - suppress auth errors and duplicate subscription warnings
            if (data.error) {
              // Suppress common non-critical errors
              const suppressedErrors = [
                'AuthorizationRequired',
                'an error occurred',
                'You are already subscribed',
                'market is presently closed',
                'MarketIsClosed'
              ];
              
              const shouldSuppress = suppressedErrors.some(msg => 
                data.error.code === msg || data.error.message?.toLowerCase().includes(msg.toLowerCase())
              );
              
              if (!shouldSuppress) {
                console.error('JARVIS Deriv API Error:', data.error.message);
              }
              return;
            }
            
            // Route by message type
            if (data.msg_type && this.callbacks.has(data.msg_type)) {
              this.callbacks.get(data.msg_type)!(data);
            }

            // Specific handling for ticks
            if (data.msg_type === 'tick' && data.tick) {
              const tick: DerivTick = {
                symbol: data.tick.symbol,
                quote: data.tick.quote,
                epoch: data.tick.epoch
              };
              if (this.tickCallbacks.has(tick.symbol)) {
                this.tickCallbacks.get(tick.symbol)!(tick);
              }
            }
          } catch (e) {
            console.error('JARVIS Data Parsing Error:', e);
          }
        };

        this.socket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('❌ Deriv WebSocket Error:', error);
          this.isConnecting = false;
          this.stopPing();
        };

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🔌 Deriv Uplink Closed. Code:', event.code, 'Reason:', event.reason);
          this.connectionPromise = null;
          this.socket = null;
          this.isConnecting = false;
          this.stopPing();
          
          // Clear subscribed symbols on disconnect
          this.subscribedSymbols.clear();
          
          // Attempt reconnection with exponential backoff
          if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            const delay = RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(() => this.connect(), delay);
          } else {
            console.error('❌ Max reconnection attempts reached. Please refresh the page.');
          }
        };
      } catch (err) {
        this.isConnecting = false;
        this.connectionPromise = null;
        console.error('❌ Failed to create WebSocket:', err);
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ ping: 1 });
    }, 30000); // Send ping every 30 seconds to keep connection alive
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private authorize() {
    if (isValidToken) {
      console.log('🔐 JARVIS: Attempting authorization...');
      this.send({ authorize: TOKEN });
    } else {
      console.log('ℹ️ JARVIS: No valid token - using demo mode');
      this.isAuthorized = false;
    }
  }

  private waitForAuthorization(): Promise<boolean> {
    if (this.authorizationPromise) return this.authorizationPromise;
    
    this.authorizationPromise = new Promise((resolve) => {
      if (this.isAuthorized) {
        resolve(true);
        return;
      }
      
      if (!TOKEN || TOKEN.length === 0) {
        resolve(false);
        return;
      }
      
      // Wait for authorization with timeout
      const checkInterval = setInterval(() => {
        if (this.isAuthorized) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve(true);
        }
      }, 100);
      
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!this.isAuthorized) {
          console.log('ℹ️ JARVIS: Using demo mode - connect your Deriv account for live trading');
        }
        resolve(false);
      }, 5000);
    });
    
    return this.authorizationPromise;
  }

  send(payload: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('JARVIS: Cannot send - WebSocket not connected');
      // Attempt to reconnect
      this.connect().then(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify(payload));
        }
      });
      return;
    }
    try {
      this.socket.send(JSON.stringify(payload));
    } catch (error) {
      console.error('JARVIS: Failed to send message:', error);
    }
  }

  subscribeToBalance(callback: (data: any) => void) {
    this.waitForAuthorization().then((authorized) => {
      if (!authorized) {
        console.log('⚠️ JARVIS: Cannot subscribe to balance - not authorized');
        return;
      }
      this.callbacks.set('balance', callback);
      this.send({ balance: 1, subscribe: 1 });
    });
  }

  subscribeToTick(symbol: string, callback: (tick: DerivTick) => void) {
    // Check if already subscribed
    if (this.subscribedSymbols.has(symbol)) {
      // Just update the callback, don't resubscribe
      this.tickCallbacks.set(symbol, callback);
      return;
    }
    
    this.tickCallbacks.set(symbol, callback);
    this.subscribedSymbols.add(symbol);
    this.send({ ticks: symbol, subscribe: 1 });
  }

  unsubscribeFromTick(symbol: string) {
    this.tickCallbacks.delete(symbol);
    this.subscribedSymbols.delete(symbol);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({ forget: symbol });
    }
  }

  getAccountList(callback: (data: any) => void) {
    // Set callback first
    this.callbacks.set('authorize', callback);
    
    this.waitForAuthorization().then((authorized) => {
      if (!authorized) {
        console.log('⚠️ JARVIS: Not authorized - please add valid Deriv token to .env.local');
        console.log('💡 Get your token from: https://app.deriv.com/account/api-token');
        console.log('   Required scopes: Read, Trade, Trading information, Payments');
        
        // Return empty account list when not authorized
        callback({
          authorize: {
            account_list: [],
            balance: 0,
            currency: 'USD',
            loginid: ''
          }
        });
        return;
      }
      
      // If authorized, the callback will be triggered by the authorization response
      // which already contains account_list
      console.log('✅ JARVIS: Using live account data from Deriv API');
    });
  }

  getAllAccounts(callback: (accounts: DerivAccount[]) => void) {
    this.waitForAuthorization().then((authorized) => {
      if (!authorized) {
        console.log('⚠️ JARVIS: Not authorized - cannot fetch accounts');
        console.log('💡 Add your Deriv token to .env.local to see your accounts');
        // Return empty array when not authorized
        callback([]);
        return;
      }

      // Set up a callback to collect account data
      const accountCallback = (data: any) => {
        if (data.authorize?.account_list) {
          const accounts: DerivAccount[] = data.authorize.account_list.map((acc: any) => ({
            loginid: acc.loginid,
            balance: parseFloat(acc.balance || '0'),
            currency: acc.currency,
            account_type: acc.is_virtual ? 'demo' : 'real',
            is_virtual: acc.is_virtual === 1
          }));
          
          console.log('📊 JARVIS: Retrieved', accounts.length, 'Deriv accounts');
          accounts.forEach(acc => {
            console.log(`   ${acc.is_virtual ? '🎮 Demo' : '💰 Real'}: ${acc.loginid} - ${acc.balance} ${acc.currency}`);
          });
          
          callback(accounts);
        }
      };

      this.callbacks.set('authorize', accountCallback);
    });
  }

  getActiveSymbols(callback: (data: any) => void) {
    this.callbacks.set('active_symbols', callback);
    this.send({ active_symbols: "brief", product_type: "basic" });
  }
}

export const derivService = new DerivService();
