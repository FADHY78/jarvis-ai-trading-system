
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Mic, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import JarvisVocalInterface from './components/JarvisVocalInterface';
import Toast from './components/Toast';
import { PriceData, Position } from './types';
import { initialPriceData, generatePriceUpdate } from './services/mockDataService';
import { derivService, DerivAccount, DerivTick } from './services/derivService';
import { testTelegramBot } from './services/telegramService';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveCharts = lazy(() => import('./pages/LiveCharts'));
const MarketScanner = lazy(() => import('./pages/MarketScanner'));
const AISignals = lazy(() => import('./pages/AISignals'));
const AIAnalysis = lazy(() => import('./pages/AIAnalysis'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const JarvisChat = lazy(() => import('./pages/JarvisChat'));
const DerivAccounts = lazy(() => import('./pages/DerivAccounts'));
const Profile = lazy(() => import('./pages/Profile'));
const JarvisControlCenter = lazy(() => import('./pages/JarvisControlCenter'));
const MarketLens = lazy(() => import('./pages/MarketLens'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="flex flex-col items-center gap-4">
      <Loader2 size={48} className="text-cyan-400 animate-spin" />
      <p className="font-orbitron text-sm text-cyan-400 uppercase tracking-widest animate-pulse">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, PriceData>>(initialPriceData);
  const [positions, setPositions] = useState<Position[]>([
    { id: '1', pair: 'EURUSD', type: 'LONG', entry: 1.0850, current: 1.0892, pnl: 156.40, pnlPercent: 0.38, status: 'PROFIT' },
    { id: '2', pair: 'GOLD', type: 'SHORT', entry: 2045.0, current: 2038.2, pnl: 68.00, pnlPercent: 0.33, status: 'PROFIT' },
  ]);
  const [derivAccounts, setDerivAccounts] = useState<DerivAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<DerivAccount | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isVocalInterfaceOpen, setIsVocalInterfaceOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Debug: Log whenever derivAccounts changes
  useEffect(() => {
    console.log('🔄 JARVIS: derivAccounts state updated:', derivAccounts.length, 'accounts');
    derivAccounts.forEach(acc => {
      console.log(`   - ${acc.loginid} (${acc.account_type}): ${acc.balance} ${acc.currency}`);
    });
  }, [derivAccounts]);

  // Telegram bot auto-test disabled - test manually in Settings
  // (Auto-test was annoying when Telegram is blocked)
  useEffect(() => {
    console.log('ℹ️ JARVIS: Telegram alerts ready');
    console.log('   Test manually in Settings page');
    console.log('   ⚠️ Note: VPN may be required if Telegram is blocked in your region');
  }, []);

  useEffect(() => {
    const initializeDeriv = async () => {
      await derivService.connect();
      
      // Setup Account List - Fetch all accounts (real + demo)
      derivService.getAccountList((data) => {
        console.log('🎯 JARVIS: getAccountList callback invoked!', data);
        
        if (data.authorize?.account_list && data.authorize.account_list.length > 0) {
          const accounts = data.authorize.account_list.map((acc: any) => ({
            loginid: acc.loginid,
            balance: parseFloat(acc.balance || '0'),
            currency: acc.currency,
            account_type: acc.is_virtual ? 'demo' : 'real',
            is_virtual: acc.is_virtual === 1
          }));
          
          console.log('📊 JARVIS: Retrieved', accounts.length, 'Deriv accounts');
          accounts.forEach((acc: DerivAccount) => {
            console.log(`   ${acc.is_virtual ? '🎮 Demo' : '💰 Real'}: ${acc.loginid} - ${acc.balance.toLocaleString()} ${acc.currency}`);
          });
          
          setDerivAccounts(accounts);
          
          // Set active account (prefer real account if available, otherwise first account)
          const realAccount = accounts.find((a: DerivAccount) => !a.is_virtual);
          setActiveAccount(realAccount || accounts[0]);
        } else {
          console.log('ℹ️ JARVIS: No accounts available - add valid Deriv token to .env.local');
          setDerivAccounts([]);
          setActiveAccount(null);
        }
      });

      // Setup Balance Stream - Update balance for active account
      derivService.subscribeToBalance((data) => {
        if (data.balance) {
          const newBalance = parseFloat(data.balance.balance);
          const loginid = data.balance.loginid;
          
          // Update active account balance
          setActiveAccount(prev => {
            if (prev && prev.loginid === loginid) {
              return { ...prev, balance: newBalance };
            }
            return prev;
          });
          
          // Update in accounts list
          setDerivAccounts(prev => 
            prev.map(acc => 
              acc.loginid === loginid ? { ...acc, balance: newBalance } : acc
            )
          );
        }
      });

      // Unified symbols mapping for scanner and signals
      const symbolMap: Record<string, string> = {
        'frxEURUSD': 'EURUSD',
        'frxGBPUSD': 'GBPUSD',
        'frxUSDJPY': 'USDJPY',
        'frxXAUUSD': 'GOLD',
        'cryBTCUSD': 'BTCUSD',
        'R_100': 'R_100',
        'R_75': 'R_75',
        'R_50': 'R_50',
        'R_25': 'R_25',
        'R_10': 'R_10',
        'BOOM500': 'BOOM500',
        'BOOM1000': 'BOOM1000',
        'CRASH500': 'CRASH500',
        'CRASH1000': 'CRASH1000',
        '1HZ100V': 'NAS100'
      };

      console.log('📡 JARVIS: Subscribing to realtime market data for', Object.keys(symbolMap).length, 'symbols');

      Object.keys(symbolMap).forEach(derivSym => {
        derivService.subscribeToTick(derivSym, (tick: DerivTick) => {
          const uiKey = symbolMap[derivSym];
          setPrices(prev => {
            const current = prev[uiKey] || { 
              symbol: uiKey, 
              price: tick.quote, 
              history: Array(150).fill(tick.quote), // Prefill to avoid "SYNCHRONIZING"
              volatility: 0,
              change: 0,
              changePercent: 0
            };
            
            // INCREASED HISTORY BUFFER: 200 points to support V7 logic
            const newHistory = [...(current.history || []).slice(-199), tick.quote];
            const firstPrice = newHistory[0] || tick.quote;
            const change = tick.quote - firstPrice;
            const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;
            
            return {
              ...prev,
              [uiKey]: {
                ...current,
                price: tick.quote,
                change,
                changePercent,
                history: newHistory,
                lastSpike: Math.abs(tick.quote - (prev[uiKey]?.price || tick.quote)) > (prev[uiKey]?.price || 0) * 0.001 ? Date.now() : prev[uiKey]?.lastSpike
              },
              [derivSym]: {
                ...current,
                symbol: derivSym,
                price: tick.quote,
                change,
                changePercent,
                history: newHistory
              }
            };
          });
        });
      });
    };

    initializeDeriv();

    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        if (next['NAS100']) {
          next['NAS100'] = generatePriceUpdate(next['NAS100']);
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-[#050714] bg-grid text-white">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <Header 
            activeAccount={activeAccount} 
            accounts={derivAccounts} 
            onAccountSwitch={setActiveAccount} 
            onInitiateVoice={() => setIsVocalInterfaceOpen(true)}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <div className="flex-1 overflow-y-auto p-3 lg:p-6 custom-scrollbar">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard prices={prices} positions={positions} balance={activeAccount?.balance} />} />
                <Route path="/deriv" element={<DerivAccounts accounts={derivAccounts} activeAccount={activeAccount} onSwitch={setActiveAccount} prices={prices} />} />
                <Route path="/charts" element={<LiveCharts prices={prices} />} />
                <Route path="/scanner" element={<MarketScanner prices={prices} />} />
                <Route path="/signals" element={<AISignals prices={prices} />} />
                <Route path="/analysis" element={<AIAnalysis prices={prices} />} />
                <Route path="/lens" element={<MarketLens />} />
                <Route path="/portfolio" element={<Portfolio positions={positions} />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile activeAccount={activeAccount} accounts={derivAccounts} onAccountSwitch={setActiveAccount} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/jarvis" element={<JarvisChat />} />
                <Route path="/control" element={<JarvisControlCenter prices={prices} onInitiateVoice={() => setIsVocalInterfaceOpen(true)} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </div>

          <footer className="h-6 lg:h-8 glass border-t border-cyan-500/20 px-2 lg:px-4 flex items-center justify-between text-[8px] lg:text-[10px] font-mono text-cyan-400/70 overflow-x-hidden">
            <div className="flex gap-2 lg:gap-4 items-center">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500 animate-pulse"></span> 
                <span className="hidden sm:inline">DERIV UPLINK: PERSISTENT</span>
                <span className="sm:hidden">DERIV</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-cyan-500"></span> 
                <span className="hidden sm:inline">JARVIS CORE: ONLINE</span>
                <span className="sm:hidden">JARVIS</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500 animate-pulse"></span> 
                <span className="hidden sm:inline">REALTIME DATA: ACTIVE</span>
                <span className="sm:hidden">LIVE</span>
              </span>
            </div>
            <div className="flex gap-2 lg:gap-4 text-cyan-300 items-center">
              <span className="hidden md:flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setIsVocalInterfaceOpen(true)}>
                <Mic size={10} className="lg:w-3 lg:h-3" /> 
                <span className="hidden lg:inline">INITIATE VOICE COMMAND</span>
                <span className="lg:hidden">VOICE</span>
              </span>
              <span className="hidden sm:inline">UPLINK: ACTIVE</span>
            </div>
          </footer>
        </main>

        <JarvisVocalInterface 
          isOpen={isVocalInterfaceOpen} 
          onClose={() => setIsVocalInterfaceOpen(false)} 
          activeAccountBalance={activeAccount?.balance}
        />

        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
            duration={6000}
          />
        )}

        {showDisclaimer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="glass max-w-lg w-full p-8 rounded-2xl border-cyan-500 animate-in zoom-in duration-300 text-center">
              <h2 className="text-2xl font-orbitron text-cyan-400 mb-4 border-b border-cyan-500/30 pb-2 uppercase">JARVIS System Online</h2>
              <p className="text-sm text-gray-300 leading-relaxed font-rajdhani">
                Persistent Deriv WebSocket uplink established. Live tick stream synchronized for all core assets. AI scanner and signal engines are now receiving high-fidelity market data.
              </p>
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="mt-8 w-full py-3 bg-cyan-500 text-black font-bold font-orbitron rounded-lg hover:bg-cyan-400 transition-all neon-glow uppercase tracking-widest"
              >
                Enter Command Deck
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
