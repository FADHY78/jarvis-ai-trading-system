
import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Eye, Send, CheckCircle, XCircle } from 'lucide-react';
import { testTelegramBot } from '../services/telegramService';

const Settings: React.FC = () => {
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTelegramTest = async () => {
    setTelegramTesting(true);
    setTelegramStatus('idle');
    
    const success = await testTelegramBot();
    
    setTelegramStatus(success ? 'success' : 'error');
    setTelegramTesting(false);
    
    // Reset status after 5 seconds
    setTimeout(() => setTelegramStatus('idle'), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-cyan-500" />
          <h1 className="font-orbitron text-xl text-cyan-400">SYSTEM CONFIGURATION</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-2xl space-y-8">
             <div>
                <h3 className="font-orbitron text-sm text-cyan-400 mb-6 flex items-center gap-3">
                  <Shield size={18} /> RISK PARAMETERS
                </h3>
                <div className="space-y-6">
                   {[
                     { label: 'Risk Per Trade', val: '2%' },
                     { label: 'Max Daily Risk', val: '6%' },
                     { label: 'Min RR Ratio', val: '1:1.5' },
                   ].map((p, idx) => (
                     <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-rajdhani">
                          <span className="text-gray-400">{p.label}</span>
                          <span className="text-cyan-400 font-bold">{p.val}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                           <div className="h-full bg-cyan-500 w-[40%]"></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/10">
                {[
                  'Enable auto position sizing',
                  'Use trailing stops',
                  'Allow trading during news',
                  'Auto-close at daily loss limit'
                ].map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-5 h-5 rounded border border-cyan-500/50 flex items-center justify-center group-hover:border-cyan-400 transition-all">
                       <div className="w-2.5 h-2.5 bg-cyan-500 rounded-sm opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    <span className="text-xs font-rajdhani text-gray-300">{opt}</span>
                  </label>
                ))}
             </div>
          </div>

          <div className="glass p-8 rounded-2xl space-y-8">
             <div>
                <h3 className="font-orbitron text-sm text-cyan-400 mb-6 flex items-center gap-3">
                  <Sliders size={18} /> TRADING PREFERENCES
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <p className="text-[10px] font-mono text-gray-500">MARKET ACCESS</p>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-rajdhani focus:outline-none focus:border-cyan-500">
                         <option>ALL MARKETS</option>
                         <option>FOREX ONLY</option>
                         <option>CRYPTO ONLY</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-mono text-gray-500">DEFAULT TIMEFRAME</p>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-rajdhani focus:outline-none focus:border-cyan-500">
                         <option>H4 (RECOMMENDED)</option>
                         <option>H1</option>
                         <option>M15</option>
                      </select>
                   </div>
                </div>
             </div>

             <div>
                <h3 className="font-orbitron text-sm text-cyan-400 mb-6 flex items-center gap-3">
                  <Bell size={18} /> NOTIFICATIONS
                </h3>
                <div className="flex flex-wrap gap-3 mb-4">
                   {['Browser Push', 'Sound Alerts', 'Email Digest'].map(n => (
                     <button key={n} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-rajdhani text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition-all">
                        {n}
                     </button>
                   ))}
                </div>
                
                {/* Telegram Bot Section */}
                <div className="glass bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4 rounded-xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-orbitron text-xs text-cyan-400 mb-1 flex items-center gap-2">
                        <Send size={14} /> TELEGRAM BOT
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400">Real-time signal alerts</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[9px] font-mono ${
                      telegramStatus === 'success' ? 'bg-green-500/20 text-green-400' :
                      telegramStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {telegramStatus === 'success' ? '✓ CONNECTED' :
                       telegramStatus === 'error' ? '✗ FAILED' :
                       'READY'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleTelegramTest}
                    disabled={telegramTesting}
                    className={`w-full py-2 rounded-lg font-orbitron text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                      telegramTesting 
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400/50 cursor-wait' 
                        : telegramStatus === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                        : telegramStatus === 'error'
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                        : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {telegramTesting ? (
                      <>
                        <div className="animate-spin w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                        TESTING...
                      </>
                    ) : telegramStatus === 'success' ? (
                      <>
                        <CheckCircle size={14} />
                        TEST SUCCESSFUL
                      </>
                    ) : telegramStatus === 'error' ? (
                      <>
                        <XCircle size={14} />
                        TEST FAILED - RETRY
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        TEST TELEGRAM BOT
                      </>
                    )}
                  </button>
                  
                  {telegramStatus === 'success' && (
                    <div className="text-[9px] font-mono text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                      ✓ Check your Telegram for test message!
                    </div>
                  )}
                  
                  {telegramStatus === 'error' && (
                    <div className="text-[9px] font-mono text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                      ✗ Check bot token and chat ID in .env.local
                    </div>
                  )}
                </div>
             </div>

             <div className="pt-4 border-t border-white/10">
                <h3 className="font-orbitron text-sm text-cyan-400 mb-6 flex items-center gap-3">
                  <Eye size={18} /> DISPLAY SETTINGS
                </h3>
                <button className="w-full py-3 bg-white/5 border border-cyan-500/20 rounded-xl font-orbitron text-[10px] text-cyan-400 tracking-widest hover:bg-cyan-500/10 transition-all">
                   CUSTOMIZE INTERFACE THEME
                </button>
             </div>
          </div>
       </div>

       <div className="flex justify-end gap-4 mt-8">
          <button className="px-8 py-3 border border-white/10 text-gray-500 rounded-xl font-orbitron text-xs hover:text-white transition-all">
             RESET DEFAULT
          </button>
          <button className="px-12 py-3 bg-cyan-500 text-black rounded-xl font-orbitron text-xs font-bold neon-glow hover:bg-cyan-400 transition-all">
             SAVE CONFIGURATION
          </button>
       </div>
    </div>
  );
};

export default Settings;
