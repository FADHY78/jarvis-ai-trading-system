
import React from 'react';
import { BarChart2, Calendar, Target, TrendingUp, Zap, Clock, ShieldAlert, Award } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="glass p-10 rounded-3xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <BarChart2 size={180} />
         </div>
         <h2 className="font-orbitron text-lg text-cyan-400 mb-10 flex items-center gap-4 tracking-widest uppercase">
           <BarChart2 className="text-cyan-500 animate-pulse" /> Global System Performance Audit
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
               <div className="flex items-center gap-3 mb-3">
                 <Zap size={14} className="text-cyan-400" />
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Profit Factor</p>
               </div>
               <h3 className="font-orbitron text-3xl font-bold text-white">2.34</h3>
            </div>
            <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
               <div className="flex items-center gap-3 mb-3">
                 <Award size={14} className="text-green-400" />
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Efficiency Win Rate</p>
               </div>
               <h3 className="font-orbitron text-3xl font-bold text-green-400">68.5%</h3>
            </div>
            <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
               <div className="flex items-center gap-3 mb-3">
                 <TrendingUp size={14} className="text-blue-400" />
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Sharpe Ratio</p>
               </div>
               <h3 className="font-orbitron text-3xl font-bold text-blue-400">1.85</h3>
            </div>
            <div className="p-6 glass rounded-2xl border-white/5 bg-white/[0.02]">
               <div className="flex items-center gap-3 mb-3">
                 <ShieldAlert size={14} className="text-red-400" />
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Drawdown Limit</p>
               </div>
               <h3 className="font-orbitron text-3xl font-bold text-red-400">8.2%</h3>
            </div>
         </div>
         
         <div className="h-80 glass rounded-2xl border-white/5 p-8 flex flex-col relative bg-white/[0.01]">
            <div className="flex-1 flex items-end gap-2">
               {[20, 35, 25, 45, 60, 55, 75, 80, 70, 85, 95, 88, 72, 80, 92].map((v, i) => (
                 <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/10 to-cyan-500/40 rounded-t-lg transition-all hover:to-cyan-400" style={{ height: `${v}%` }}></div>
               ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] font-mono text-gray-600 uppercase">
              <span>Trade Sequencing: Node 1-15</span>
              <span className="text-cyan-500/50">Cumulative Probability Matrix V8.0</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 glass p-8 rounded-3xl">
            <h3 className="font-orbitron text-[11px] text-gray-400 mb-8 flex items-center gap-3 uppercase tracking-[0.3em]">
              <Calendar size={18} className="text-cyan-500" /> Temporal Performance Heatmap
            </h3>
            <div className="grid grid-cols-7 gap-2">
               {Array.from({ length: 35 }).map((_, i) => {
                 const intensity = Math.random();
                 const color = intensity > 0.4 ? 'bg-green-500' : 'bg-red-500';
                 return (
                   <div key={i} className={`h-10 rounded-lg ${color} border border-white/5 transition-all hover:scale-105 cursor-pointer relative group`} style={{ opacity: 0.1 + intensity * 0.9 }}>
                     <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-lg"></div>
                   </div>
                 );
               })}
            </div>
            <div className="mt-6 flex justify-between items-center px-2">
              <div className="flex gap-4 items-center">
                <span className="text-[9px] font-mono text-gray-600 uppercase">Negative Bias</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500/20 rounded-sm"></div>
                  <div className="w-3 h-3 bg-red-500/50 rounded-sm"></div>
                  <div className="w-3 h-3 bg-red-500/90 rounded-sm"></div>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-green-500/20 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500/50 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500/90 rounded-sm"></div>
                </div>
                <span className="text-[9px] font-mono text-gray-600 uppercase">Institutional Growth</span>
              </div>
            </div>
         </div>

         <div className="glass p-8 rounded-3xl flex flex-col">
            <h3 className="font-orbitron text-[11px] text-gray-400 mb-8 flex items-center gap-3 uppercase tracking-[0.3em]">
              <Target size={18} className="text-cyan-500" /> Sector Allocation
            </h3>
            <div className="space-y-8 flex-1">
               {[
                 { market: 'Synthetics (Deriv)', pct: 45, color: 'bg-cyan-500 shadow-[0_0_15px_rgba(0,212,255,0.3)]' },
                 { market: 'Forex Majors', pct: 30, color: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
                 { market: 'Commodities (Gold)', pct: 15, color: 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' },
                 { market: 'Crypto Assets', pct: 10, color: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
               ].map((m, idx) => (
                 <div key={idx} className="space-y-3">
                   <div className="flex justify-between text-[10px] font-mono font-bold">
                     <span className="text-gray-400">{m.market.toUpperCase()}</span>
                     <span className="text-white">{m.pct}%</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                     <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.pct}%` }}></div>
                   </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5">
               <div className="flex items-center gap-3 mb-2">
                 <Clock size={14} className="text-cyan-400" />
                 <span className="text-[10px] font-orbitron text-cyan-400 tracking-widest uppercase">System Frequency</span>
               </div>
               <p className="text-[10px] font-rajdhani text-gray-500">Node analysis reveals high efficiency in London/New York overlap. Volatility 75 remains primary yield source.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
