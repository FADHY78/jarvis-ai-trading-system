
import React, { useMemo } from 'react';
import { Wallet, PieChart, ArrowUpRight, TrendingUp, History, Shield, Activity, Target } from 'lucide-react';
import { Position } from '../types';

interface PortfolioProps {
  positions: Position[];
}

const Portfolio: React.FC<PortfolioProps> = ({ positions }) => {
  const tradeHistory = [
    { id: 'h1', pair: 'R_100', type: 'LONG', profit: 450.20, status: 'CLOSED', time: '2h ago' },
    { id: 'h2', pair: 'EURUSD', type: 'SHORT', profit: -120.00, status: 'CLOSED', time: '5h ago' },
    { id: 'h3', pair: 'BOOM500', type: 'LONG', profit: 890.50, status: 'CLOSED', time: '1d ago' },
  ];

  const totalPnl = useMemo(() => positions.reduce((acc, p) => acc + p.pnl, 0), [positions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 rounded-3xl bg-gradient-to-br from-cyan-950/20 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
          <h2 className="font-orbitron text-cyan-400 text-lg mb-8 flex items-center gap-3">
             <Wallet className="text-cyan-500 animate-pulse" /> COMMAND DECK: EQUITY MODULE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
             <div className="space-y-1">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Initial Capital</p>
               <p className="font-orbitron font-bold text-xl">$10,000.00</p>
             </div>
             <div className="space-y-1 border-l border-white/5 pl-8">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Equity</p>
               <p className="font-orbitron font-bold text-xl text-cyan-400">$12,458.50</p>
             </div>
             <div className="space-y-1 border-l border-white/5 pl-8">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Floating P&L</p>
               <p className={`font-orbitron font-bold text-xl ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                 {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
               </p>
             </div>
             <div className="space-y-1 border-l border-white/5 pl-8">
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Growth Factor</p>
               <p className="font-orbitron font-bold text-xl text-green-400">+24.59%</p>
             </div>
          </div>
          
          <div className="h-64 glass rounded-2xl border-white/5 p-6 flex flex-col justify-end relative bg-white/[0.02]">
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <TrendingUp size={120} className="text-cyan-500" />
             </div>
             <div className="flex items-end gap-1 h-full mb-4">
               {[40, 45, 38, 52, 60, 58, 70, 65, 80, 75, 90, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/50 transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
               ))}
             </div>
             <div className="flex justify-between text-[8px] font-mono text-gray-600 uppercase tracking-widest px-2">
               <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
             </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border-cyan-500/20 relative">
          <h2 className="font-orbitron text-cyan-400 text-sm mb-8 flex items-center gap-3 uppercase tracking-widest">
             <Shield className="text-cyan-500" /> Risk Architecture
          </h2>
          <div className="space-y-8">
             {[
               { label: 'System Exposure', val: '3.5%', progress: 35, color: 'bg-cyan-500' },
               { label: 'Max Recovery Depth', val: '8.2%', progress: 20, color: 'bg-green-500' },
               { label: 'Confidence Coefficient', val: '1.85', progress: 65, color: 'bg-blue-500' },
               { label: 'Institutional Factor', val: '2.34', progress: 80, color: 'bg-purple-500' },
             ].map((m, idx) => (
               <div key={idx} className="space-y-3">
                 <div className="flex justify-between text-[9px] font-mono font-bold">
                   <span className="text-gray-500 tracking-tighter">{m.label.toUpperCase()}</span>
                   <span className="text-cyan-400">{m.val}</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <div className={`h-full ${m.color} shadow-[0_0_10px_rgba(0,212,255,0.2)]`} style={{ width: `${m.progress}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-10 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={14} className="text-cyan-400" />
              <span className="text-[10px] font-orbitron text-cyan-400 tracking-widest uppercase">Node Health</span>
            </div>
            <p className="text-[10px] font-rajdhani text-gray-400 leading-relaxed italic">"Optimal trading conditions detected. Risk parameters remain within safe institutional limits, sir."</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl overflow-hidden border-white/5">
           <div className="p-5 bg-white/5 flex items-center justify-between border-b border-white/5">
             <h2 className="font-orbitron text-[11px] text-cyan-400 uppercase tracking-widest flex items-center gap-3">
               <Target size={16} /> Current Market Allocations
             </h2>
           </div>
           <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs font-rajdhani">
                <thead className="text-gray-600 uppercase text-[9px] tracking-widest font-bold">
                  <tr>
                    <th className="pb-4">Asset Node</th>
                    <th className="pb-4">Execution</th>
                    <th className="pb-4 text-right">Net P&L</th>
                    <th className="pb-4 text-center">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {positions.map(p => (
                    <tr key={p.id} className="group hover:bg-cyan-500/5 transition-all">
                      <td className="py-4 font-bold text-white group-hover:text-cyan-400 transition-colors">{p.pair}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${p.type === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className={`py-4 text-right font-mono font-bold ${p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${p.pnl.toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                        <button className="text-[9px] font-orbitron text-gray-500 hover:text-red-400 uppercase tracking-tighter">Liquidate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden border-white/5">
           <div className="p-5 bg-white/5 flex items-center justify-between border-b border-white/5">
             <h2 className="font-orbitron text-[11px] text-gray-400 uppercase tracking-widest flex items-center gap-3">
               <History size={16} /> Institutional Log History
             </h2>
           </div>
           <div className="p-6 space-y-4">
              {tradeHistory.map(h => (
                <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${h.profit >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm font-rajdhani">{h.pair} <span className="text-[10px] font-mono text-gray-500 ml-2">{h.type}</span></h4>
                      <p className="text-[9px] font-mono text-gray-600 uppercase">{h.time} • Node Closed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold text-sm ${h.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {h.profit >= 0 ? '+' : ''}${h.profit.toFixed(2)}
                    </p>
                    <p className="text-[9px] font-orbitron text-cyan-500/50 uppercase tracking-tighter">Audited</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 text-[10px] font-orbitron text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.3em]">
                Access Full Archive Database
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
