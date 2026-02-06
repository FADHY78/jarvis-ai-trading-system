import React, { useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle, Activity, Zap, Shield, Eye, BarChart3, Sparkles, ChevronDown, ChevronUp, Layers, TrendingUpDown, Search, Clock, Radar } from 'lucide-react';
import { PriceData, resolvePriceData } from '../types';
import { detectPatterns, detectManipulation, calculateTechnicalStrength, detectSMC, detectAdvancedSpikes } from '../services/mockDataService';

interface AIAnalysisProps {
  prices: Record<string, PriceData>;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ prices }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = React.useState<'ALL' | 'BULLISH' | 'BEARISH' | 'HIGH_CONF'>('ALL');

  const analysisData = useMemo(() => {
    const targetPairs = ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY', 'frxXAUUSD', 'cryBTCUSD', 'R_100', 'R_75', 'R_50', 'BOOM500', 'BOOM1000', 'CRASH500', 'CRASH1000', '1HZ100V'];
    
    return targetPairs.map((pair, idx) => {
      const priceData = resolvePriceData(pair, prices);
      if (!priceData) return null;

      const currentPrice = priceData.price || 0;
      const history = priceData.history || [];
      
      if (history.length < 30) return null;
      
      // ENHANCED MULTI-TIMEFRAME SCANNING
      const m15History = history.slice(-60);  // M15 perspective
      const h1History = history.slice(-240);  // H1 perspective
      const h4History = history;  // H4 perspective
      
      // Multi-timeframe analysis
      const m15Pattern = detectPatterns(m15History);
      const h1Pattern = detectPatterns(h1History);
      const h4Pattern = detectPatterns(h4History);
      
      const m15SMC = detectSMC(m15History, pair);
      const h1SMC = detectSMC(h1History, pair);
      const h4SMC = detectSMC(h4History, pair);
      
      // Use H1 as primary but track all timeframes
      const patternData = h1Pattern;
      const manipulation = detectManipulation(h1History);
      const strength = calculateTechnicalStrength(h1History);
      const smc = h1SMC;
      const spikeData = detectAdvancedSpikes(h1History, pair);
      
      // Volume and Order Flow Analysis
      const recentVolume = h1History.slice(-20).reduce((acc, val, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(val - h1History[i - 1]);
      }, 0) / 20;
      
      const avgVolume = h1History.slice(-100, -20).reduce((acc, val, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(val - h1History.slice(-100, -20)[i - 1]);
      }, 0) / 80;
      
      const volumeStrength = (recentVolume / avgVolume) * 100;
      
      // Order Flow (buying vs selling pressure)
      const buyingPressure = h1History.slice(-20).filter((v, i) => i > 0 && v > h1History[i - 1]).length;
      const sellingPressure = 20 - buyingPressure;
      const orderFlow = buyingPressure > sellingPressure ? 'BULLISH' : 'BEARISH';
      const orderFlowStrength = Math.abs(buyingPressure - sellingPressure) * 5;
      
      // Calculate overall confidence with V12.0 logic + Volume + Timeframe Confluence
      let overallConfidence = strength;
      
      // Multi-Timeframe Confluence
      const m15Bias = m15SMC.signal.includes('BULLISH') ? 'BULLISH' : m15SMC.signal.includes('BEARISH') ? 'BEARISH' : 'NEUTRAL';
      const h1Bias = h1SMC.signal.includes('BULLISH') ? 'BULLISH' : h1SMC.signal.includes('BEARISH') ? 'BEARISH' : 'NEUTRAL';
      const h4Bias = h4SMC.signal.includes('BULLISH') ? 'BULLISH' : h4SMC.signal.includes('BEARISH') ? 'BEARISH' : 'NEUTRAL';
      
      let timeframeAlignment = 0;
      if (m15Bias === h1Bias && h1Bias === h4Bias && m15Bias !== 'NEUTRAL') timeframeAlignment = 18; // Perfect alignment
      else if ((m15Bias === h1Bias || h1Bias === h4Bias) && h1Bias !== 'NEUTRAL') timeframeAlignment = 10; // Partial alignment
      
      overallConfidence += timeframeAlignment;
      
      // Volume Strength Bonus
      if (volumeStrength > 150) overallConfidence += 10; // High volume
      else if (volumeStrength > 120) overallConfidence += 6;
      
      // Order Flow Alignment
      const bias = strength > 50 ? 'BULLISH' : 'BEARISH';
      if (orderFlow === bias) overallConfidence += orderFlowStrength / 2;
      
      // Pattern scoring
      if (patternData.label.includes('PRO')) {
        if (patternData.confidence >= 98) overallConfidence += 15;
        else if (patternData.confidence >= 95) overallConfidence += 12;
        else overallConfidence += 10;
      } else if (patternData.label.includes('HARMONIC')) {
        if (patternData.confidence >= 97) overallConfidence += 12;
        else overallConfidence += 8;
      }
      
      // SMC scoring
      if (smc.signal.includes('BULLISH') || smc.signal.includes('BEARISH')) overallConfidence += 15;
      if (smc.factors.some(f => f.includes('ORDER_BLOCK_DETECTED'))) overallConfidence += 10;
      if (smc.factors.some(f => f.includes('LIQUIDITY_POOL_TARGETED'))) overallConfidence += 8;
      
      // Manipulation/Risk adjustment
      if (!manipulation.detected) overallConfidence += 5;
      else overallConfidence -= manipulation.severity * 2;
      
      // Spike detection bonus
      if (spikeData.isSpike && spikeData.severity === 'EXTREME') overallConfidence += 8;
      else if (spikeData.prediction === 'IMMINENT') overallConfidence += 5;
      
      overallConfidence = Math.max(0, Math.min(99, overallConfidence));
      
      return {
        id: idx.toString(),
        pair: pair.replace('frx', '').replace('cry', ''),
        currentPrice,
        bias,
        overallConfidence: Math.round(overallConfidence),
        pattern: patternData,
        manipulation,
        strength,
        smc,
        spikeData,
        timestamp: new Date().toLocaleTimeString(),
        // Enhanced scanning data
        volumeStrength: Math.round(volumeStrength),
        orderFlow,
        orderFlowStrength: Math.round(orderFlowStrength),
        timeframeAlignment: timeframeAlignment > 15 ? 'PERFECT' : timeframeAlignment > 8 ? 'STRONG' : 'WEAK',
        multiTimeframe: {
          m15: { bias: m15Bias, pattern: m15Pattern.label, smc: m15SMC.signal },
          h1: { bias: h1Bias, pattern: h1Pattern.label, smc: h1SMC.signal },
          h4: { bias: h4Bias, pattern: h4Pattern.label, smc: h4SMC.signal }
        }
      };
    }).filter(Boolean);
  }, [prices]);

  const filteredData = useMemo(() => {
    if (selectedFilter === 'ALL') return analysisData;
    if (selectedFilter === 'BULLISH') return analysisData.filter(d => d && d.bias === 'BULLISH');
    if (selectedFilter === 'BEARISH') return analysisData.filter(d => d && d.bias === 'BEARISH');
    if (selectedFilter === 'HIGH_CONF') return analysisData.filter(d => d && d.overallConfidence >= 80);
    return analysisData;
  }, [analysisData, selectedFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500 pb-12 lg:pb-16">
      {/* Header */}
      <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-orbitron text-2xl lg:text-3xl xl:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 flex items-center gap-3 lg:gap-4 font-black tracking-tighter">
              <div className="relative">
                <Brain className="w-7 h-7 lg:w-9 lg:h-9 text-cyan-500 animate-pulse" />
                <div className="absolute inset-0 w-7 h-7 lg:w-9 lg:h-9 text-cyan-500 animate-ping opacity-20"></div>
              </div>
              <span>AI MARKET ANALYSIS V12.0</span>
            </h1>
            <p className="text-[10px] lg:text-xs font-mono text-cyan-300/70 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
              <Sparkles size={12} className="text-purple-400" />
              Multi-Dimensional Intelligence • Pattern + SMC + Manipulation + Spike Detection
            </p>
          </div>

          {/* Stats Overview */}
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="glass bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30">
              <div className="text-[9px] font-mono text-green-400 uppercase tracking-wider">Active</div>
              <div className="font-orbitron font-black text-xl text-green-400">{filteredData.length}</div>
            </div>
            <div className="glass bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/30">
              <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">Avg Conf</div>
              <div className="font-orbitron font-black text-xl text-cyan-400">
                {Math.round(filteredData.reduce((acc, d) => acc + (d?.overallConfidence || 0), 0) / Math.max(1, filteredData.length))}%
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {[
            { id: 'ALL', label: 'All Assets', icon: Layers },
            { id: 'BULLISH', label: 'Bullish', icon: TrendingUp },
            { id: 'BEARISH', label: 'Bearish', icon: TrendingDown },
            { id: 'HIGH_CONF', label: 'High Confidence', icon: Target }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-300 ${
                selectedFilter === filter.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-cyan-300'
              }`}
            >
              <filter.icon size={12} />
              <span className="hidden sm:inline">{filter.label}</span>
              <span className="sm:hidden">{filter.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 gap-3 lg:gap-4">
        {filteredData.map(analysis => analysis && (
          <div 
            key={analysis.id} 
            className="glass rounded-xl lg:rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]"
          >
            {/* Card Header - Always Visible */}
            <div 
              className="p-4 lg:p-6 cursor-pointer hover:bg-white/[0.02] transition-all relative overflow-hidden"
              onClick={() => toggleExpand(analysis.id)}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    {/* Pair Icon */}
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300 ${
                      analysis.bias === 'BULLISH' 
                        ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-500/50' 
                        : 'bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-500/50'
                    }`}>
                      {analysis.bias === 'BULLISH' ? (
                        <TrendingUp size={24} className="text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      ) : (
                        <TrendingDown size={24} className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    
                    <div>
                      <h3 className="font-orbitron font-black text-xl lg:text-2xl text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                        {analysis.pair}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] lg:text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                          analysis.bias === 'BULLISH' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {analysis.bias}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-cyan-500/50"></div>
                        <Clock size={10} className="text-gray-500" />
                        <span className="text-[9px] lg:text-[10px] font-mono text-gray-500">{analysis.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:gap-4">
                    {/* Overall Confidence Badge */}
                    <div className="text-right">
                      <div className="text-[8px] lg:text-[9px] font-mono text-cyan-500/70 uppercase tracking-widest mb-1">
                        Confidence
                      </div>
                      <div className={`font-orbitron font-black text-3xl lg:text-4xl ${
                        analysis.overallConfidence >= 85 ? 'text-green-400' :
                        analysis.overallConfidence >= 70 ? 'text-cyan-400' :
                        analysis.overallConfidence >= 50 ? 'text-yellow-400' : 'text-orange-400'
                      } drop-shadow-[0_0_12px_currentColor]`}>
                        {analysis.overallConfidence}%
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className={`flex items-center gap-2 transition-all duration-300`}>
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider hidden group-hover:inline">
                        {expandedId === analysis.id ? 'Hide Details' : 'Click for Analysis'}
                      </span>
                      <div className={`transition-transform duration-300 ${expandedId === analysis.id ? 'rotate-180' : ''}`}>
                        <ChevronDown size={24} className="text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
                  <div className="glass bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-3 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all group/stat">
                    <p className="text-[8px] lg:text-[9px] font-mono text-cyan-500/70 uppercase mb-1 tracking-wider">Current Price</p>
                    <p className="text-xs lg:text-sm font-orbitron font-bold text-white group-hover/stat:text-cyan-400 transition-colors">
                      ${analysis.currentPrice.toFixed(analysis.currentPrice < 10 ? 4 : 2)}
                    </p>
                  </div>
                  
                  <div className="glass bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-3 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all group/stat">
                    <p className="text-[8px] lg:text-[9px] font-mono text-purple-500/70 uppercase mb-1 tracking-wider">Pattern</p>
                    <p className="text-xs lg:text-sm font-orbitron font-bold text-purple-400 group-hover/stat:text-purple-300 transition-colors">
                      {analysis.pattern.confidence}%
                    </p>
                  </div>
                  
                  <div className="glass bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all group/stat">
                    <p className="text-[8px] lg:text-[9px] font-mono text-green-500/70 uppercase mb-1 tracking-wider">Strength</p>
                    <p className="text-xs lg:text-sm font-orbitron font-bold text-green-400 group-hover/stat:text-green-300 transition-colors">
                      {analysis.strength}%
                    </p>
                  </div>
                  
                  <div className={`glass bg-gradient-to-br p-3 rounded-lg border transition-all group/stat ${
                    analysis.manipulation.detected 
                      ? 'from-red-500/10 to-orange-500/5 border-red-500/20 hover:border-red-500/40' 
                      : 'from-green-500/10 to-emerald-500/5 border-green-500/20 hover:border-green-500/40'
                  }`}>
                    <p className={`text-[8px] lg:text-[9px] font-mono uppercase mb-1 tracking-wider ${
                      analysis.manipulation.detected ? 'text-red-500/70' : 'text-green-500/70'
                    }`}>Risk Level</p>
                    <p className={`text-xs lg:text-sm font-orbitron font-bold transition-colors ${
                      analysis.manipulation.detected 
                        ? 'text-red-400 group-hover/stat:text-red-300' 
                        : 'text-green-400 group-hover/stat:text-green-300'
                    }`}>
                      {analysis.manipulation.detected ? 'HIGH' : 'LOW'}
                    </p>
                  </div>
                </div>

                {/* Mini Indicators Bar */}
                {expandedId !== analysis.id && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {analysis.smc.signal !== 'NEUTRAL' && (
                      <span className="text-[8px] font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        SMC: {analysis.smc.signal}
                      </span>
                    )}
                    {analysis.spikeData?.isSpike && (
                      <span className="text-[8px] font-mono px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        SPIKE: {analysis.spikeData.severity}
                      </span>
                    )}
                    {analysis.smc.factors.some(f => f.includes('ORDER_BLOCK_DETECTED')) && (
                      <span className="text-[8px] font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        ORDER BLOCK
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === analysis.id && (
              <div className="border-t border-white/10 bg-black/20 p-4 lg:p-6 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                
                {/* Enhanced Scanning Intelligence */}
                <div className="glass bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4 lg:p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                  <h4 className="text-xs lg:text-sm font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-widest font-black flex items-center gap-2 mb-4">
                    <Radar size={16} className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    Advanced Scanning Intelligence
                  </h4>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Volume</span>
                      <span className={`text-sm font-bold font-orbitron ${
                        analysis.volumeStrength > 150 ? 'text-green-400' : 
                        analysis.volumeStrength > 100 ? 'text-cyan-400' : 'text-gray-400'
                      }`}>{analysis.volumeStrength}%</span>
                      <span className="text-[8px] text-gray-500 block mt-0.5">
                        {analysis.volumeStrength > 150 ? 'HIGH' : analysis.volumeStrength > 100 ? 'NORMAL' : 'LOW'}
                      </span>
                    </div>
                    
                    <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Order Flow</span>
                      <span className={`text-sm font-bold font-orbitron ${
                        analysis.orderFlow === 'BULLISH' ? 'text-green-400' : 'text-red-400'
                      }`}>{analysis.orderFlow}</span>
                      <span className="text-[8px] text-gray-500 block mt-0.5">
                        {analysis.orderFlowStrength}% strength
                      </span>
                    </div>
                    
                    <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Timeframe</span>
                      <span className={`text-sm font-bold font-orbitron ${
                        analysis.timeframeAlignment === 'PERFECT' ? 'text-green-400' : 
                        analysis.timeframeAlignment === 'STRONG' ? 'text-cyan-400' : 'text-yellow-400'
                      }`}>{analysis.timeframeAlignment}</span>
                      <span className="text-[8px] text-gray-500 block mt-0.5">
                        M15/H1/H4 Align
                      </span>
                    </div>
                    
                    <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Bias</span>
                      <span className={`text-sm font-bold font-orbitron ${
                        analysis.bias === 'BULLISH' ? 'text-green-400' : 'text-red-400'
                      }`}>{analysis.bias}</span>
                      <span className="text-[8px] text-gray-500 block mt-0.5">
                        {analysis.strength}% conviction
                      </span>
                    </div>
                  </div>
                  
                  {/* Multi-Timeframe Breakdown */}
                  <div className="mt-4 p-3 glass bg-black/20 rounded-lg border border-cyan-500/20">
                    <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-2">Multi-Timeframe Analysis</span>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                      {['m15', 'h1', 'h4'].map((tf) => (
                        <div key={tf} className="flex items-center justify-between p-2 rounded bg-white/5">
                          <span className="text-[10px] font-mono text-gray-400 uppercase">{tf.toUpperCase()}</span>
                          <span className={`text-[10px] font-bold ${
                            analysis.multiTimeframe[tf].bias === 'BULLISH' ? 'text-green-400' : 
                            analysis.multiTimeframe[tf].bias === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {analysis.multiTimeframe[tf].bias}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Pattern Analysis */}
                <div className="glass bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4 lg:p-5 rounded-xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs lg:text-sm font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest font-black flex items-center gap-2">
                      <Target size={16} className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                      Pattern Detection V12.0
                    </h4>
                    <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <span className="text-xs font-mono font-black text-purple-300">{analysis.pattern.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="glass bg-black/20 p-3 rounded-lg border border-purple-500/20">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[9px] font-mono text-purple-400/70 uppercase tracking-wider block mb-1">Detected Pattern</span>
                          <span className="text-sm font-bold text-purple-300 font-orbitron">{analysis.pattern.label}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-purple-400/70 uppercase tracking-wider block mb-1">Confidence</span>
                          <span className="text-sm font-bold text-purple-400 font-orbitron">{analysis.pattern.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                        <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Pattern Strength</span>
                        <span className="text-sm font-bold text-cyan-400 font-orbitron">{analysis.pattern.confidence}%</span>
                      </div>
                      <div className="glass bg-black/20 p-3 rounded-lg border border-pink-500/20">
                        <span className="text-[9px] font-mono text-pink-400/70 uppercase tracking-wider block mb-1">Pattern Type</span>
                        <span className="text-sm font-bold text-pink-300 font-orbitron">{analysis.pattern.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMC Analysis */}
                <div className="glass bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4 lg:p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_50px_rgba(6,182,212,0.25)] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs lg:text-sm font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-widest font-black flex items-center gap-2">
                      <BarChart3 size={16} className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                      Smart Money Concepts
                    </h4>
                    <div className={`px-3 py-1 rounded-full border ${
                      analysis.smc.signal.includes('BULLISH') 
                        ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                        : analysis.smc.signal.includes('BEARISH')
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                    }`}>
                      <span className="text-xs font-mono font-black">{analysis.smc.signal}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Market Structure</span>
                      <span className="text-sm font-bold text-cyan-300 font-orbitron">{analysis.smc.marketStructure}</span>
                    </div>
                    <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/20">
                      <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-1">Premium/Discount</span>
                      <span className={`text-sm font-bold font-orbitron ${
                        analysis.smc.premiumDiscount === 'PREMIUM' ? 'text-red-400' : 
                        analysis.smc.premiumDiscount === 'DISCOUNT' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {analysis.smc.premiumDiscount}
                      </span>
                    </div>
                  </div>

                  {(analysis.smc.orderBlocks?.length > 0 || analysis.smc.fairValueGaps?.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {analysis.smc.orderBlocks && analysis.smc.orderBlocks.length > 0 && (
                        <div className="glass bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                          <span className="text-[9px] font-mono text-purple-400/70 uppercase tracking-wider block mb-1">Order Blocks</span>
                          <span className="text-sm font-bold text-purple-400 font-orbitron">{analysis.smc.orderBlocks.length} Active</span>
                        </div>
                      )}
                      {analysis.smc.fairValueGaps && analysis.smc.fairValueGaps.length > 0 && (
                        <div className="glass bg-pink-500/10 p-3 rounded-lg border border-pink-500/20">
                          <span className="text-[9px] font-mono text-pink-400/70 uppercase tracking-wider block mb-1">FVG Detected</span>
                          <span className="text-sm font-bold text-pink-400 font-orbitron">{analysis.smc.fairValueGaps.length} Gaps</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="glass bg-black/20 p-3 rounded-lg border border-cyan-500/10">
                    <p className="text-[9px] font-mono text-cyan-500/70 uppercase mb-2 tracking-wider">Key Factors</p>
                    <div className="space-y-1.5">
                      {analysis.smc.factors.slice(0, 5).map((factor, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                          <span className="text-[10px] text-gray-300 leading-relaxed">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ICT Concepts Section */}
                {analysis.smc.ictConcepts && (
                  <div className="glass bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-4 lg:p-5 rounded-xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:shadow-[0_0_50px_rgba(99,102,241,0.25)] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs lg:text-sm font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 uppercase tracking-widest font-black flex items-center gap-2">
                        <Clock size={16} className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        ICT Concepts (Inner Circle Trader)
                      </h4>
                      <div className={`px-3 py-1 rounded-full border ${
                        analysis.smc.ictConcepts.sessionBias === 'BULLISH' 
                          ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                          : analysis.smc.ictConcepts.sessionBias === 'BEARISH'
                          ? 'bg-red-500/20 border-red-500/30 text-red-400'
                          : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                      }`}>
                        <span className="text-xs font-mono font-black">{analysis.smc.ictConcepts.sessionBias}</span>
                      </div>
                    </div>
                    
                    {/* Kill Zone & OTE */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                      {analysis.smc.ictConcepts.killZone !== 'NONE' && (
                        <div className="glass bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-3 rounded-lg border border-yellow-500/30">
                          <span className="text-[9px] font-mono text-yellow-400/70 uppercase tracking-wider block mb-1">Kill Zone</span>
                          <span className="text-sm font-bold text-yellow-400 font-orbitron">{analysis.smc.ictConcepts.killZone}</span>
                          <span className="text-[8px] text-yellow-500/70 block mt-0.5">{analysis.smc.ictConcepts.killZoneStrength}% Active</span>
                        </div>
                      )}
                      
                      {analysis.smc.ictConcepts.oteZone.inZone && (
                        <div className={`glass p-3 rounded-lg border ${
                          analysis.smc.ictConcepts.oteZone.type === 'BULLISH' 
                            ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' 
                            : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30'
                        }`}>
                          <span className={`text-[9px] font-mono uppercase tracking-wider block mb-1 ${
                            analysis.smc.ictConcepts.oteZone.type === 'BULLISH' ? 'text-green-400/70' : 'text-red-400/70'
                          }`}>OTE Zone</span>
                          <span className={`text-sm font-bold font-orbitron ${
                            analysis.smc.ictConcepts.oteZone.type === 'BULLISH' ? 'text-green-400' : 'text-red-400'
                          }`}>{analysis.smc.ictConcepts.oteZone.type}</span>
                          <span className={`text-[8px] block mt-0.5 ${
                            analysis.smc.ictConcepts.oteZone.type === 'BULLISH' ? 'text-green-500/70' : 'text-red-500/70'
                          }`}>0.62-0.79 Fib</span>
                        </div>
                      )}
                      
                      {analysis.smc.ictConcepts.powerOf3.phase !== 'NONE' && (
                        <div className="glass bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3 rounded-lg border border-purple-500/30">
                          <span className="text-[9px] font-mono text-purple-400/70 uppercase tracking-wider block mb-1">Power of 3</span>
                          <span className="text-sm font-bold text-purple-400 font-orbitron">{analysis.smc.ictConcepts.powerOf3.phase}</span>
                          <span className="text-[8px] text-purple-500/70 block mt-0.5">{analysis.smc.ictConcepts.powerOf3.confidence}% Conf</span>
                        </div>
                      )}
                      
                      <div className={`glass p-3 rounded-lg border ${
                        analysis.smc.ictConcepts.institutionalOrderFlow === 'STRONG_BUY' || analysis.smc.ictConcepts.institutionalOrderFlow === 'BUY'
                          ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
                          : analysis.smc.ictConcepts.institutionalOrderFlow === 'STRONG_SELL' || analysis.smc.ictConcepts.institutionalOrderFlow === 'SELL'
                          ? 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30'
                          : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/30'
                      }`}>
                        <span className={`text-[9px] font-mono uppercase tracking-wider block mb-1 ${
                          analysis.smc.ictConcepts.institutionalOrderFlow.includes('BUY') ? 'text-green-400/70' 
                          : analysis.smc.ictConcepts.institutionalOrderFlow.includes('SELL') ? 'text-red-400/70' 
                          : 'text-gray-400/70'
                        }`}>Order Flow</span>
                        <span className={`text-sm font-bold font-orbitron ${
                          analysis.smc.ictConcepts.institutionalOrderFlow === 'STRONG_BUY' ? 'text-green-400' 
                          : analysis.smc.ictConcepts.institutionalOrderFlow === 'BUY' ? 'text-green-300'
                          : analysis.smc.ictConcepts.institutionalOrderFlow === 'STRONG_SELL' ? 'text-red-400'
                          : analysis.smc.ictConcepts.institutionalOrderFlow === 'SELL' ? 'text-red-300'
                          : 'text-gray-400'
                        }`}>{analysis.smc.ictConcepts.institutionalOrderFlow.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Breaker Blocks & Mitigation */}
                    {(analysis.smc.ictConcepts.breakerBlocks.length > 0 || analysis.smc.ictConcepts.mitigationBlocks.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {analysis.smc.ictConcepts.breakerBlocks.length > 0 && (
                          <div className="glass bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                            <span className="text-[9px] font-mono text-orange-400/70 uppercase tracking-wider block mb-1">Breaker Blocks</span>
                            <span className="text-sm font-bold text-orange-400 font-orbitron">{analysis.smc.ictConcepts.breakerBlocks.length} Active</span>
                          </div>
                        )}
                        {analysis.smc.ictConcepts.mitigationBlocks.length > 0 && (
                          <div className="glass bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <span className="text-[9px] font-mono text-blue-400/70 uppercase tracking-wider block mb-1">Mitigation Blocks</span>
                            <span className="text-sm font-bold text-blue-400 font-orbitron">{analysis.smc.ictConcepts.mitigationBlocks.length} Zones</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optimal Entry Signal */}
                    {analysis.smc.ictConcepts.optimalEntry.signal !== 'WAITING' && (
                      <div className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/40 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-green-400/70 uppercase tracking-wider block mb-1">Optimal Entry</span>
                            <span className="text-base font-bold text-green-400 font-orbitron">{analysis.smc.ictConcepts.optimalEntry.signal}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-green-400/70 uppercase tracking-wider block mb-1">Confidence</span>
                            <span className="text-2xl font-black text-green-400 font-orbitron">{Math.round(analysis.smc.ictConcepts.optimalEntry.confidence)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* ICT Factors */}
                    {analysis.smc.ictConcepts.ictFactors.length > 0 && (
                      <div className="glass bg-black/20 p-3 rounded-lg border border-indigo-500/10">
                        <p className="text-[9px] font-mono text-indigo-500/70 uppercase mb-2 tracking-wider">ICT Factors</p>
                        <div className="space-y-1.5">
                          {analysis.smc.ictConcepts.ictFactors.slice(0, 6).map((factor, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                              <span className="text-[10px] text-gray-300 leading-relaxed">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Spike Detection */}
                {analysis.spikeData?.isSpike && (
                  <div className="glass bg-gradient-to-br from-orange-500/10 to-red-500/5 p-4 lg:p-5 rounded-xl border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs lg:text-sm font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 uppercase tracking-widest font-black flex items-center gap-2">
                        <Zap size={16} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] animate-pulse" />
                        Spike Detection V12.0
                      </h4>
                      <div className={`px-3 py-1 rounded-full border ${
                        analysis.spikeData.severity === 'EXTREME' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                        analysis.spikeData.severity === 'CRITICAL' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' :
                        'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                      }`}>
                        <span className="text-xs font-mono font-black">{analysis.spikeData.severity}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass bg-black/20 p-3 rounded-lg border border-orange-500/20">
                        <span className="text-[9px] font-mono text-orange-400/70 uppercase tracking-wider block mb-1">Direction</span>
                        <span className="text-sm font-bold text-orange-400 font-orbitron">{analysis.spikeData.direction}</span>
                      </div>
                      <div className="glass bg-black/20 p-3 rounded-lg border border-orange-500/20">
                        <span className="text-[9px] font-mono text-orange-400/70 uppercase tracking-wider block mb-1">Probability</span>
                        <span className="text-sm font-bold text-orange-300 font-orbitron">{analysis.spikeData.probability.toFixed(1)}%</span>
                      </div>
                      <div className="glass bg-black/20 p-3 rounded-lg border border-orange-500/20">
                        <span className="text-[9px] font-mono text-orange-400/70 uppercase tracking-wider block mb-1">Prediction</span>
                        <span className="text-sm font-bold text-orange-400 font-orbitron">{analysis.spikeData.prediction}</span>
                      </div>
                    </div>
                    
                    {analysis.spikeData.indicators.length > 0 && (
                      <div className="glass bg-black/20 p-3 rounded-lg border border-orange-500/10 mt-3">
                        <p className="text-[9px] font-mono text-orange-500/70 uppercase mb-2 tracking-wider">Detected Indicators</p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.spikeData.indicators.slice(0, 4).map((indicator, i) => (
                            <span key={i} className="text-[9px] font-mono px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manipulation Analysis */}
                <div className={`glass bg-gradient-to-br p-4 lg:p-5 rounded-xl border shadow-[0_0_30px_rgba(239,68,68,0.15)] ${
                  analysis.manipulation.detected 
                    ? 'from-red-500/10 to-orange-500/5 border-red-500/30' 
                    : 'from-green-500/10 to-emerald-500/5 border-green-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-xs lg:text-sm font-orbitron uppercase tracking-widest font-black flex items-center gap-2 ${
                      analysis.manipulation.detected ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400'
                    }`}>
                      <AlertTriangle size={16} className={`${analysis.manipulation.detected ? 'text-red-500 animate-pulse' : 'text-green-500'} drop-shadow-[0_0_8px_currentColor]`} />
                      Manipulation Detection
                    </h4>
                    <div className={`px-3 py-1 rounded-full border ${
                      analysis.manipulation.detected 
                        ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                        : 'bg-green-500/20 border-green-500/30 text-green-400'
                    }`}>
                      <span className="text-xs font-mono font-black">{analysis.manipulation.detected ? 'DETECTED' : 'CLEAN'}</span>
                    </div>
                  </div>
                  
                  {analysis.manipulation.detected ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass bg-black/20 p-3 rounded-lg border border-red-500/20">
                          <span className="text-[9px] font-mono text-red-400/70 uppercase tracking-wider block mb-1">Type</span>
                          <span className="text-sm font-bold text-red-300 font-orbitron">{analysis.manipulation.type}</span>
                        </div>
                        <div className="glass bg-black/20 p-3 rounded-lg border border-red-500/20">
                          <span className="text-[9px] font-mono text-red-400/70 uppercase tracking-wider block mb-1">Severity</span>
                          <span className="text-sm font-bold text-red-400 font-orbitron">{analysis.manipulation.severity}/5</span>
                        </div>
                      </div>
                      
                      {analysis.manipulation.institutionalFootprint && (
                        <div className="glass bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                          <span className="text-[9px] font-mono text-purple-400/70 uppercase tracking-wider block mb-1">Institutional Footprint</span>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-purple-400 font-orbitron">{analysis.manipulation.institutionalFootprint}%</span>
                            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${analysis.manipulation.institutionalFootprint}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass bg-black/20 p-4 rounded-lg border border-green-500/10 text-center">
                      <Shield size={24} className="text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-400 font-semibold">No manipulation detected</p>
                      <p className="text-xs text-gray-500 mt-1">Clean market conditions</p>
                    </div>
                  )}
                </div>

                {/* Technical Strength */}
                <div className="glass bg-gradient-to-br from-cyan-500/10 to-green-500/5 p-4 lg:p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                  <h4 className="text-xs lg:text-sm font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 uppercase tracking-widest font-black flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    Technical Strength Analysis
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="glass bg-black/20 p-4 rounded-lg border border-cyan-500/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider">Overall Strength</span>
                        <span className="text-2xl font-bold text-cyan-400 font-orbitron">{analysis.strength}%</span>
                      </div>
                      <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            analysis.strength > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                            analysis.strength > 40 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 
                            'bg-gradient-to-r from-red-500 to-orange-500'
                          }`}
                          style={{ width: `${analysis.strength}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-bold ${
                          analysis.strength > 70 ? 'text-green-400' : 
                          analysis.strength > 60 ? 'text-cyan-400' : 
                          analysis.strength > 40 ? 'text-yellow-400' : 
                          analysis.strength > 30 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {analysis.strength > 70 ? 'STRONG BULLISH' : 
                           analysis.strength > 60 ? 'BULLISH' : 
                           analysis.strength > 40 ? 'NEUTRAL' : 
                           analysis.strength > 30 ? 'BEARISH' : 'STRONG BEARISH'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAnalysis;
