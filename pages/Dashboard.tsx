
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Zap, Award, Brain, Newspaper, Globe, ExternalLink, Smile, Meh, Frown } from 'lucide-react';
import { PriceData, Position } from '../types';
import TradingViewChart from '../components/TradingViewChart';
import { fetchLiveTradingNews, NewsHeadline } from '../services/newsService';

interface DashboardProps {
  prices: Record<string, PriceData>;
  positions: Position[];
  balance?: number;
}

const StatsCard: React.FC<{ label: string, value: string, subValue: string, trend: 'up' | 'down', icon: React.ReactNode }> = ({ label, value, subValue, trend, icon }) => (
  <div className="glass p-4 lg:p-5 rounded-xl lg:rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
    <div className="flex justify-between items-start mb-3 lg:mb-4">
      <div className="p-1.5 lg:p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] lg:text-xs font-mono ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={12} className="lg:w-[14px] lg:h-[14px]" /> : <ArrowDownRight size={12} className="lg:w-[14px] lg:h-[14px]" />}
        {subValue}
      </div>
    </div>
    <p className="text-gray-400 text-[10px] lg:text-xs font-rajdhani uppercase tracking-wider mb-1">{label}</p>
    <h3 className="text-xl lg:text-2xl font-orbitron font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{value}</h3>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </div>
);

const SentimentIndicator: React.FC<{ sentiment: 'positive' | 'neutral' | 'negative' }> = ({ sentiment }) => {
  if (sentiment === 'positive') return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[8px] font-mono text-green-400 uppercase font-bold">
      <Smile size={10} /> POSITIVE
    </div>
  );
  if (sentiment === 'negative') return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[8px] font-mono text-red-400 uppercase font-bold">
      <Frown size={10} /> NEGATIVE
    </div>
  );
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-gray-400 uppercase font-bold">
      <Meh size={10} /> NEUTRAL
    </div>
  );
};

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsHeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getNews = async () => {
      const data = await fetchLiveTradingNews();
      setNews(data);
      setLoading(false);
    };
    getNews();
    const interval = setInterval(getNews, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-full border-cyan-500/10">
      <div className="p-4 border-b border-cyan-500/10 flex items-center justify-between bg-white/5">
        <h2 className="font-orbitron text-xs text-cyan-400 flex items-center gap-2">
          <Newspaper size={14} /> GLOBAL TRADING NEWS
        </h2>
        <Globe size={14} className="text-cyan-500 animate-spin-slow" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          news.map((item, idx) => (
            <div key={idx} className="group cursor-pointer border-b border-white/5 pb-4 last:border-0 hover:bg-white/5 p-2 rounded-xl transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-cyan-500 uppercase">{item.source} • {item.time}</span>
                  <SentimentIndicator sentiment={item.sentiment} />
                </div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400 transition-colors">
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <ExternalLink size={10} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors mb-1 leading-tight">{item.title}</h4>
              <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">{item.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ prices, positions, balance }) => {
  const currentTotalPnl = positions.reduce((acc, curr) => acc + (curr?.pnl || 0), 0);

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatsCard 
          label="Live Account Equity" 
          value={balance !== undefined ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "NO DATA"} 
          subValue={balance !== undefined ? "LIVE" : "CONNECT"} 
          trend="up" 
          icon={<Wallet size={18} className="lg:w-5 lg:h-5" />} 
        />
        <StatsCard 
          label="Today's P&L" 
          value={`$${currentTotalPnl.toFixed(2)}`} 
          subValue="+2.68%" 
          trend="up" 
          icon={<TrendingUp size={18} className="lg:w-5 lg:h-5" />} 
        />
        <StatsCard 
          label="Active Trades" 
          value={`${positions.length} POS`} 
          subValue="2 PENDING" 
          trend="up" 
          icon={<Zap size={18} className="lg:w-5 lg:h-5" />} 
        />
        <StatsCard 
          label="AI Win Prediction" 
          value="72.4%" 
          subValue="+4.1%" 
          trend="up" 
          icon={<Award size={18} className="lg:w-5 lg:h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          <div className="h-[300px] lg:h-[500px] flex flex-col glass rounded-xl lg:rounded-2xl overflow-hidden">
            <div className="p-3 lg:p-4 border-b border-cyan-500/10 flex items-center justify-between">
              <h2 className="font-orbitron text-[10px] lg:text-sm text-cyan-400 flex items-center gap-2">
                <TrendingUp size={14} className="lg:w-4 lg:h-4" /> 
                <span className="hidden sm:inline">LIVE MARKET FEED - EUR/USD</span>
                <span className="sm:hidden">MARKET FEED</span>
              </h2>
            </div>
            <div className="flex-1 p-2 lg:p-4">
              <TradingViewChart symbol="FX:EURUSD" />
            </div>
          </div>

          <div className="glass rounded-xl lg:rounded-2xl overflow-hidden">
            <div className="p-3 lg:p-4 border-b border-cyan-500/10">
              <h2 className="font-orbitron text-[10px] lg:text-sm text-cyan-400">
                <span className="hidden sm:inline">MARKET POSITIONS</span>
                <span className="sm:hidden">POSITIONS</span>
              </h2>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {positions.map((pos) => (
                <div key={pos.id} className="p-4 space-y-2 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-sm">{pos.pair || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{pos.entry?.toFixed(4) || '-.----'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {pos.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className={`font-bold text-sm ${(pos.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(pos.pnl || 0) >= 0 ? '+' : ''}${(pos.pnl || 0).toFixed(2)} ({(pos.pnl || 0) >= 0 ? '+' : ''}{(pos.pnlPercent || 0).toFixed(2)}%)
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${pos.status === 'PROFIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {pos.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-rajdhani">
                <thead className="bg-white/5 uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 lg:px-6 py-3">Pair</th>
                    <th className="px-4 lg:px-6 py-3">Type</th>
                    <th className="px-4 lg:px-6 py-3">Entry</th>
                    <th className="px-4 lg:px-6 py-3 text-right">P&L</th>
                    <th className="px-4 lg:px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 lg:px-6 py-4 font-bold text-white group-hover:text-cyan-400">{pos.pair || 'N/A'}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${pos.type === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {pos.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{pos.entry?.toFixed(4) || '-.----'}</td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${(pos.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(pos.pnl || 0) >= 0 ? '+' : ''}{(pos.pnl || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${pos.status === 'PROFIT' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></span>
                          {pos.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="h-[400px]">
            <NewsFeed />
          </div>

          <div className="glass rounded-2xl p-6 border-l-4 border-l-cyan-500 relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Zap size={80} className="text-cyan-400" />
            </div>
            <h3 className="font-orbitron text-cyan-400 mb-4 flex items-center gap-2">
              <Brain size={18} /> JARVIS CORE ANALYSIS
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs font-rajdhani italic text-gray-300 leading-relaxed">
                "Sir, the latest headlines suggest increased volatility in the energy sector. Deriv synthetic markets are currently stable but I am monitoring for ripple effects."
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>SIGNAL CONFIDENCE</span>
                  <span className="text-cyan-400">89%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-[89%] neon-glow"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden border-cyan-500/10 mt-6 flex-1">
            <div className="p-4 border-b border-cyan-500/10 bg-white/5">
              <h3 className="font-orbitron text-xs text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} /> MARKET WATCH
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {(() => {
                  // Priority symbols to display
                  const prioritySymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'GOLD', 'BTCUSD', 'R_100', 'BOOM1000', 'CRASH1000'];
                  const allPrices = Object.values(prices) as PriceData[];
                  
                  // Get prices for priority symbols first, then fill with others
                  const displayPrices = prioritySymbols
                    .map(sym => allPrices.find(p => p.symbol === sym))
                    .filter(p => p && p.symbol && p.price !== undefined)
                    .concat(
                      allPrices.filter(p => 
                        p && p.symbol && p.price !== undefined && !prioritySymbols.includes(p.symbol)
                      )
                    )
                    .slice(0, 10);
                  
                  return displayPrices.map(p => (
                    <div key={p.symbol} className="group relative overflow-hidden rounded-lg border border-white/5 bg-gradient-to-r from-white/5 to-transparent hover:from-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
                      <div className="p-3 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm font-rajdhani text-white group-hover:text-cyan-400 transition-colors">{p.symbol}</span>
                            <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              (p.changePercent || 0) >= 0 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {(p.changePercent || 0) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {(p.changePercent || 0) >= 0 ? '+' : ''}{(p.changePercent || 0).toFixed(2)}%
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-500">
                            {p.symbol.includes('EUR') || p.symbol.includes('GBP') || p.symbol.includes('USD') || p.symbol.includes('JPY') ? 'FOREX' : 
                             p.symbol === 'GOLD' ? 'COMMODITY' :
                             p.symbol === 'BTCUSD' ? 'CRYPTO' :
                             'SYNTHETIC'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                            {p.price?.toFixed(p.symbol.includes('JPY') ? 2 : p.symbol === 'BTCUSD' ? 0 : 4) || '-.----'}
                          </div>
                          <div className="text-[9px] font-mono text-gray-500">
                            {(p.changePercent || 0) >= 0 ? '▲' : '▼'} {Math.abs(p.change || 0).toFixed(p.symbol === 'BTCUSD' ? 0 : 4)}
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
