
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Plus, RefreshCw, Layers, Search, Globe, Filter, Activity, Cpu, ExternalLink } from 'lucide-react';
import { derivService, DerivAccount, DerivSymbol } from '../services/derivService';
import { PriceData } from '../types';

interface DerivAccountsProps {
  accounts: DerivAccount[];
  activeAccount: DerivAccount | null;
  onSwitch: (acc: DerivAccount) => void;
  prices: Record<string, PriceData>;
}

const DerivAccounts: React.FC<DerivAccountsProps> = ({ accounts, activeAccount, onSwitch, prices }) => {
  const navigate = useNavigate();
  const [symbols, setSymbols] = useState<DerivSymbol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarket, setActiveMarket] = useState<string>('all');
  const [loadingSymbols, setLoadingSymbols] = useState(true);

  useEffect(() => {
    const fetchSymbols = async () => {
      await derivService.connect();
      derivService.getActiveSymbols((data) => {
        if (data.active_symbols) {
          setSymbols(data.active_symbols);
          setLoadingSymbols(false);
        }
      });
    };
    fetchSymbols();
  }, []);

  const markets = ['all', ...Array.from(new Set(symbols.map(s => s.market_display_name)))];

  const filteredSymbols = symbols.filter(s => {
    const matchesSearch = s.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMarket = activeMarket === 'all' || s.market_display_name === activeMarket;
    return matchesSearch && matchesMarket;
  });

  const handleLaunchAnalyst = (symbol: string) => {
    // Basic heuristic to format for TradingView (prefix with DERIV: if it looks like a synthetic)
    const formatted = symbol.includes('frx') ? `FX:${symbol.replace('frx', '')}` : `DERIV:${symbol}`;
    navigate(`/charts?symbol=${formatted}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-2xl text-cyan-400 flex items-center gap-3 tracking-tighter">
            <Layers className="text-cyan-500 animate-pulse" /> DERIV COMMAND CENTER
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Authorized node access: 1089</p>
        </div>
        <button className="px-6 py-2.5 bg-cyan-500 text-black font-bold font-orbitron text-xs rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
          <Plus size={16} /> PROVISION NEW ACCOUNT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div 
            key={acc.loginid} 
            className={`glass p-6 rounded-2xl relative overflow-hidden group transition-all duration-500 border-t-4 ${
              acc.is_virtual ? 'border-t-yellow-500' : 'border-t-cyan-500'
            } ${activeAccount?.loginid === acc.loginid ? 'ring-2 ring-cyan-400 shadow-[0_0_40px_rgba(0,212,255,0.1)] scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Cpu size={120} className="text-white" />
            </div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${acc.is_virtual ? 'text-yellow-500' : 'text-cyan-400'}`}>
                  {acc.account_type} PROXIMITY
                </p>
                <h3 className="text-2xl font-orbitron font-bold text-white tracking-tight">{acc.loginid}</h3>
              </div>
              <div className={`p-2 rounded-xl border ${acc.is_virtual ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500'}`}>
                <Shield size={20} />
              </div>
            </div>
            <div className="space-y-1 mb-8 relative z-10">
              <p className="text-[9px] font-mono text-gray-500 tracking-widest">LIQUIDITY RESERVE</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-orbitron font-bold text-white">
                  {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-mono text-cyan-400/70">{acc.currency}</span>
              </div>
            </div>
            <div className="flex gap-3 relative z-10">
              <button 
                onClick={() => onSwitch(acc)}
                disabled={activeAccount?.loginid === acc.loginid}
                className={`flex-1 py-3 rounded-xl font-orbitron text-[10px] tracking-widest transition-all border ${
                  activeAccount?.loginid === acc.loginid 
                  ? 'bg-cyan-500 border-cyan-500 text-black cursor-default shadow-[0_0_15px_rgba(0,212,255,0.4)]' 
                  : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500'
                }`}
              >
                {activeAccount?.loginid === acc.loginid ? 'SYSTEM ACTIVE' : 'INITIALIZE LINK'}
              </button>
              <button className="p-3 border border-white/10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden border-cyan-500/10 bg-black/20">
        <div className="p-6 border-b border-cyan-500/10 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/5">
          <div>
            <h2 className="font-orbitron text-sm text-cyan-400 flex items-center gap-3">
              <Globe size={18} className="animate-spin-slow" /> DERIV GLOBAL ASSET REGISTRY
            </h2>
            <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">Synchronizing all available broker symbols...</p>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Search symbol registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-rajdhani focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="flex items-center glass rounded-xl border-white/5 p-1 overflow-x-auto custom-scrollbar no-scrollbar">
              {markets.map(m => (
                <button
                  key={m}
                  onClick={() => setActiveMarket(m)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-orbitron uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeMarket === m ? 'bg-cyan-500 text-black' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loadingSymbols ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="h-28 glass rounded-2xl animate-pulse bg-white/5"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredSymbols.map(s => {
                // Fix: Explicitly cast Object.values(prices) to PriceData[] to resolve 'unknown' property access error on 'p' in .find()
                const livePrice = prices[s.symbol] || (Object.values(prices) as PriceData[]).find(p => p.symbol === s.symbol);
                
                return (
                  <div key={s.symbol} className="glass p-4 rounded-2xl border border-white/5 hover:border-cyan-500/40 group transition-all duration-300 cursor-pointer hover:bg-cyan-500/[0.02]">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-2 h-2 rounded-full ${s.exchange_is_open ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">{s.symbol}</span>
                    </div>
                    <h4 className="text-[12px] font-bold text-white group-hover:text-cyan-400 truncate mb-1 font-rajdhani tracking-wide">
                      {s.display_name}
                    </h4>
                    
                    <div className="mb-2 h-6">
                       {livePrice ? (
                         <div className="flex items-baseline gap-1.5">
                            <span className="text-[14px] font-mono font-bold text-white tracking-tighter">
                              {livePrice.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </span>
                            <span className={`text-[9px] font-mono ${livePrice.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {livePrice.changePercent >= 0 ? '+' : ''}{livePrice.changePercent.toFixed(2)}%
                            </span>
                         </div>
                       ) : (
                         <div className="text-[10px] text-gray-600 italic">CONNECTING...</div>
                       )}
                    </div>

                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter truncate opacity-60">
                      {s.submarket_display_name}
                    </p>
                    
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLaunchAnalyst(s.symbol); }}
                        className="text-[8px] text-cyan-500 font-orbitron tracking-widest flex items-center gap-1 hover:text-white"
                      >
                        LAUNCH ANALYST <ExternalLink size={8} />
                      </button>
                      <Activity size={10} className="text-cyan-500 animate-pulse" />
                    </div>
                  </div>
                );
              })}
              {filteredSymbols.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Search size={40} className="mx-auto text-gray-700" />
                  <p className="font-orbitron text-sm text-gray-500 uppercase tracking-widest">No matching assets found in registry</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DerivAccounts;
