
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, Maximize2, MousePointer2, Type, Square, TrendingUp, ChevronDown } from 'lucide-react';
import TradingViewChart from '../components/TradingViewChart';
import { PriceData } from '../types';

interface LiveChartsProps {
  prices: Record<string, PriceData>;
}

const LiveCharts: React.FC<LiveChartsProps> = ({ prices }) => {
  const [searchParams] = useSearchParams();
  const [layout, setLayout] = useState<'single' | 'grid'>('single');
  const [activeSymbol, setActiveSymbol] = useState('FX:EURUSD');

  useEffect(() => {
    const symbolParam = searchParams.get('symbol');
    if (symbolParam) {
      // Basic heuristic to format for TradingView (prefix with DERIV: if it looks like a synthetic)
      const formatted = symbolParam.includes('frx') ? `FX:${symbolParam.replace('frx', '')}` : `DERIV:${symbolParam}`;
      setActiveSymbol(formatted);
    }
  }, [searchParams]);

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="glass rounded-xl p-3 flex items-center justify-between border-cyan-500/20">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="bg-white/5 border border-cyan-500/20 rounded-lg px-4 py-1.5 text-sm font-rajdhani flex items-center gap-3 hover:border-cyan-500/50 transition-all">
              <span className="text-cyan-400 font-bold">{activeSymbol}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 glass rounded-lg border-cyan-500/20 hidden group-hover:block z-50 overflow-hidden">
               {Object.keys(prices).map(s => (
                 <button 
                  key={s} 
                  onClick={() => setActiveSymbol(s.includes('frx') ? `FX:${s.replace('frx','')}` : `DERIV:${s}`)}
                  className="w-full text-left px-4 py-2 text-xs font-rajdhani hover:bg-cyan-500 hover:text-black transition-colors"
                >
                   {s}
                 </button>
               ))}
            </div>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex gap-1">
             {[
               { icon: <MousePointer2 size={16} />, label: 'Cursor' },
               { icon: <TrendingUp size={16} />, label: 'Trend' },
               { icon: <Type size={16} />, label: 'Text' },
               { icon: <Square size={16} />, label: 'Area' },
             ].map((tool, idx) => (
               <button key={idx} className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-all" title={tool.label}>
                 {tool.icon}
               </button>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setLayout('single')}
            className={`p-2 rounded-lg transition-all ${layout === 'single' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
          >
             <Maximize2 size={18} />
           </button>
           <button 
            onClick={() => setLayout('grid')}
            className={`p-2 rounded-lg transition-all ${layout === 'grid' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
          >
             <LayoutGrid size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {layout === 'single' ? (
          <TradingViewChart symbol={activeSymbol} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <TradingViewChart symbol="FX:EURUSD" />
            <TradingViewChart symbol="FX:GBPUSD" />
            <TradingViewChart symbol="DERIV:R_100" />
            <TradingViewChart symbol="BITSTAMP:BTCUSD" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCharts;
