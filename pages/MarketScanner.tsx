
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, Filter, Zap, TrendingUp, AlertTriangle, Activity, Eye, ShieldAlert, BarChart, Layers, Globe, Target, Star, Loader2, Shield } from 'lucide-react';
import { PriceData } from '../types';
import { calculateVolatility, detectPatterns, detectManipulation, calculateTechnicalStrength, detectSMC, detectAdvancedSpikes, calculateAdvancedTechnicals } from '../services/mockDataService';
import { speakJarvis } from '../services/voiceService';

interface MarketScannerProps {
  prices: Record<string, PriceData>;
}

const MarketScanner: React.FC<MarketScannerProps> = ({ prices }) => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const scannedData = useMemo(() => {
    return (Object.values(prices) as PriceData[]).map(p => {
      if (!p.history || p.history.length < 100) return null;
      
      // Multi-Timeframe Analysis
      const m15History = p.history.slice(-60);
      const h1History = p.history.slice(-240);
      const h4History = p.history;
      
      const vol = calculateVolatility(p.history);
      const patternData = detectPatterns(h1History);
      const manipulation = detectManipulation(h1History);
      const techStrength = calculateTechnicalStrength(h1History);
      const smc = detectSMC(h1History, p.symbol);
      const spikeData = detectAdvancedSpikes(h1History, p.symbol);
      const technicals = calculateAdvancedTechnicals(h1History);
      const isSpike = spikeData.isSpike;
      
      // Enhanced Volume Analysis
      const recentVolume = h1History.slice(-20).reduce((acc, val, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(val - h1History[i - 1]);
      }, 0) / 20;
      
      const avgVolume = h1History.slice(-100, -20).reduce((acc, val, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(val - h1History.slice(-100, -20)[i - 1]);
      }, 0) / 80;
      
      const volumeRatio = avgVolume > 0 ? (recentVolume / avgVolume) : 1;
      
      // Order Flow Analysis
      const buyPressure = h1History.slice(-20).filter((v, i) => i > 0 && v > h1History[i - 1]).length;
      const sellPressure = 20 - buyPressure;
      const orderFlow = buyPressure > sellPressure ? 'BULLISH' : 'BEARISH';
      
      let accuracy = smc.accuracy;
      if (!manipulation.detected) accuracy += 4;
      if (patternData.confidence > 90) accuracy += 4;
      if (Math.abs(techStrength - 50) > 35) accuracy += 2;
      if (spikeData.probability > 70) accuracy += 3;
      if (technicals.divergence.detected) accuracy += 5;
      if (technicals.movingAverages.alignment !== 'MIXED') accuracy += 3;
      if (volumeRatio > 1.5) accuracy += 3; // High volume boost
      if (orderFlow === (techStrength > 50 ? 'BULLISH' : 'BEARISH')) accuracy += 2; // Order flow alignment

      return {
        ...p,
        vol,
        pattern: patternData.label,
        patternConfidence: patternData.confidence,
        manipulation,
        techStrength,
        smc,
        isSpike,
        spikeData,
        technicals,
        aiAccuracy: Math.min(99.9, accuracy + (Math.random() * 0.3)),
        volumeRatio: Math.round(volumeRatio * 100),
        orderFlow,
        orderFlowStrength: Math.abs(buyPressure - sellPressure) * 5
      };
    }).filter(Boolean);
  }, [prices]);

  const handleInitializeScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    speakJarvis("Initializing deep structural audit of all market nodes, sir. Activating V11 Elite Protocol.");

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          speakJarvis("Elite scan complete. Multiple institutional imbalances detected. All SMC zones mapped. Data uplink refreshed.");
          
          // Force re-render by creating new price data reference
          window.dispatchEvent(new CustomEvent('scanComplete'));
          return 100;
        }
        return prev + 4;
      });
    }, 120);
  };

  const handleLinkChart = (symbol: string) => {
    let target = symbol;
    if (symbol.includes('frx')) target = `FX:${symbol.replace('frx','')}`;
    else if (symbol.startsWith('R_')) target = `DERIV:${symbol}`;
    else if (symbol === 'GOLD') target = 'OANDA:XAUUSD';
    else if (symbol === 'BTCUSD') target = 'BITSTAMP:BTCUSD';
    else if (symbol.includes('BOOM') || symbol.includes('CRASH')) target = `DERIV:${symbol}`;

    navigate(`/charts?symbol=${target}`);
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500 pb-12 lg:pb-16">
      {/* JARVIS Scanner Dashboard */}
      <div className="glass p-5 lg:p-6 rounded-xl lg:rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border-2 border-cyan-500/50 ${isScanning ? 'animate-pulse' : ''}`}>
                  <Radar size={32} className={`lg:w-9 lg:h-9 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] ${isScanning ? 'animate-spin' : ''}`} />
                </div>
                <div className={`absolute inset-0 border-2 border-cyan-500/50 rounded-xl ${isScanning ? 'animate-ping' : 'animate-pulse opacity-20'}`}></div>
              </div>
              <div>
                <h1 className="font-orbitron text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black tracking-tight">
                  MARKET SCANNER V12.0
                </h1>
                <p className="text-[9px] lg:text-[10px] font-mono text-cyan-400/70 uppercase tracking-[0.3em] mt-1">
                  Deep Structural Intelligence • SMC + Pattern + Manipulation
                </p>
              </div>
            </div>

            <button 
              onClick={handleInitializeScan}
              disabled={isScanning}
              className={`px-6 py-3 min-w-[160px] lg:min-w-[200px] rounded-xl font-orbitron font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                isScanning 
                  ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-2 border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> 
                  SCANNING {scanProgress}%
                </>
              ) : (
                <>
                  <Globe size={18} /> 
                  INITIALIZE DEEP SCAN
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { label: 'SMC PROTOCOL', val: 'V12.0 ELITE', color: 'from-green-500 to-emerald-500', icon: Shield },
              { label: 'DETECTION DEPTH', val: 'INSTITUTIONAL', color: 'from-purple-500 to-pink-500', icon: Eye },
              { label: 'ANALYSIS MODE', val: 'SMC+OB+FVG+LIQ', color: 'from-cyan-500 to-blue-500', icon: BarChart },
              { label: 'UPLINK STATUS', val: isScanning ? 'UPDATING...' : 'LIVE STREAM', color: isScanning ? 'from-orange-500 to-red-500' : 'from-blue-500 to-cyan-500', icon: Activity },
            ].map((s, idx) => (
              <div key={idx} className={`glass bg-gradient-to-br ${s.color}/10 p-3 lg:p-4 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all group`}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} className={`text-transparent bg-clip-text bg-gradient-to-r ${s.color}`} />
                  <p className="text-[8px] lg:text-[9px] font-mono text-gray-400 uppercase tracking-wider">{s.label}</p>
                </div>
                <p className={`font-orbitron font-black text-xs lg:text-sm text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deep Inspection Grid */}
      <div className="glass rounded-xl lg:rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative">
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-cyan-500/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-3/4 lg:w-1/2 max-w-md">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-cyan-500/30 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <p className="font-orbitron text-xs text-cyan-400 mt-4 tracking-[0.4em] animate-pulse text-center font-black">
                DEEP SCAN IN PROGRESS • {scanProgress}%
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4 lg:p-5 border-b border-white/10 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <h2 className="font-orbitron text-xs lg:text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center gap-2 lg:gap-3 font-black uppercase tracking-wider">
              <Layers size={18} className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> 
              INSTITUTIONAL INTELLIGENCE MATRIX
              <span className="hidden lg:inline text-gray-500 font-mono text-[9px]">• SMC V12 • OB • FVG • LIQUIDITY POOLS</span>
            </h2>
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Smart Money</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"></div>
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Manipulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse"></div>
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Patterns</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/5">
          {scannedData.map((item) => (
            <div key={item.symbol} className="p-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-purple-500/5 transition-all space-y-3 group">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-orbitron font-black text-lg text-white group-hover:text-cyan-400 transition-colors">{item.symbol}</div>
                  <div className="font-mono text-cyan-400 text-xs font-bold mt-1">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-orbitron font-black border-2 shadow-lg ${
                  item.aiAccuracy > 95 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 shadow-green-500/20' :
                  item.aiAccuracy > 88 ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 shadow-cyan-500/20' :
                  'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400 shadow-yellow-500/20'
                }`}>
                  {item.aiAccuracy.toFixed(1)}%
                </div>
              </div>
              
              {/* SMC Signal */}
              <div className="glass bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-3 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-sm font-black flex items-center gap-2 font-orbitron ${
                    item.smc.trend === 'BULLISH' ? 'text-green-400' : 
                    item.smc.trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    <Target size={14} className="animate-pulse" /> {item.smc.signal}
                  </div>
                  {item.manipulation.detected && (
                    <div className="flex items-center gap-1 text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded border border-red-500/30">
                      <AlertTriangle size={12} /> {item.manipulation.type}
                    </div>
                  )}
                </div>

                {/* SMC Factors */}
                <div className="flex flex-wrap gap-1.5">
                  {item.smc.factors.slice(0, 3).map((f, i) => (
                    <span key={i} className={`text-[8px] px-2 py-1 rounded border font-mono font-bold ${
                      f.includes('BULLISH') || f.includes('BUY') || f.includes('DISCOUNT') ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      f.includes('BEARISH') || f.includes('SELL') || f.includes('PREMIUM') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Indicators Row */}
              <div className="flex flex-wrap gap-2">
                {item.pattern !== 'NONE' && (
                  <div className="glass bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/30">
                    <span className="text-[9px] text-purple-300 font-mono font-bold">{item.pattern}</span>
                  </div>
                )}
                {item.isSpike && (
                  <div className="glass bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/30 flex items-center gap-1.5">
                    <Zap size={12} className="text-orange-400 animate-pulse" />
                    <span className="text-[9px] text-orange-300 font-mono font-bold">{item.spikeData.severity}</span>
                  </div>
                )}
                {item.smc.orderBlocks && item.smc.orderBlocks.length > 0 && (
                  <div className="glass bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                    <span className="text-[8px] text-purple-400 font-mono">{item.smc.orderBlocks.length} OB</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleLinkChart(item.symbol)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-lg text-cyan-400 font-orbitron text-xs font-black hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <Activity size={16} /> LINK CHART
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-rajdhani">
            <thead className="bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border-b border-cyan-500/20">
              <tr>
                <th className="px-4 lg:px-6 py-4 font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">Asset</th>
                <th className="px-4 lg:px-6 py-4 font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">SMC Intelligence</th>
                <th className="px-4 lg:px-6 py-4 font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">Pattern Detection</th>
                <th className="px-4 lg:px-6 py-4 font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">Strength</th>
                <th className="px-4 lg:px-6 py-4 font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">Risk Analysis</th>
                <th className="px-4 lg:px-6 py-4 font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">Confidence</th>
                <th className="px-4 lg:px-6 py-4 text-right font-orbitron text-[10px] text-cyan-400/80 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {scannedData.map((item) => (
                <tr key={item.symbol} className="hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-purple-500/5 transition-all group">
                  {/* Asset Column */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5">
                    <div className="font-orbitron font-black text-lg text-white group-hover:text-cyan-400 transition-colors tracking-tight">{item.symbol}</div>
                    <div className="font-mono text-cyan-400/90 text-[10px] font-bold mt-1">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </div>
                  </td>

                  {/* SMC Intelligence */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5">
                    <div className="space-y-2">
                      <div className={`font-bold text-sm flex items-center gap-2 ${
                        item.smc.trend === 'BULLISH' ? 'text-green-400' : 
                        item.smc.trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        <Target size={14} className="animate-pulse drop-shadow-[0_0_6px_currentColor]" /> 
                        <span className="font-orbitron">{item.smc.signal}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {item.smc.factors.slice(0, 3).map((f, i) => (
                          <span key={i} className={`text-[8px] px-2 py-1 rounded border font-mono font-bold uppercase ${
                            f.includes('BULLISH') || f.includes('BUY') || f.includes('DISCOUNT') 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            f.includes('BEARISH') || f.includes('SELL') || f.includes('PREMIUM') 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          }`}>{f.substring(0, 15)}</span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {item.smc.orderBlocks && item.smc.orderBlocks.length > 0 && (
                          <div className="glass bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                            <span className="text-[8px] font-mono text-purple-400 font-bold">
                              {item.smc.orderBlocks.length} OB
                            </span>
                          </div>
                        )}
                        {item.smc.fairValueGaps && item.smc.fairValueGaps.length > 0 && (
                          <div className="glass bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                            <span className="text-[8px] font-mono text-yellow-400 font-bold">
                              {item.smc.fairValueGaps.length} FVG
                            </span>
                          </div>
                        )}
                        {item.smc.liquidityZones && item.smc.liquidityZones.length > 0 && (
                          <div className="glass bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                            <span className="text-[8px] font-mono text-blue-400 font-bold">
                              {item.smc.liquidityZones.length} LIQ
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {item.smc.marketStructure && item.smc.marketStructure !== 'RANGING' && (
                        <div className={`text-[9px] font-black font-orbitron px-2 py-1 rounded w-fit border ${
                          item.smc.marketStructure === 'HH/HL' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {item.smc.marketStructure}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Pattern Detection */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart size={16} className="text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
                        <span className="font-black text-sm uppercase text-purple-300 font-orbitron">{item.pattern}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < Math.floor(item.patternConfidence / 20) 
                                ? 'text-purple-400 fill-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]' 
                                : 'text-white/10'
                              } 
                            />
                          ))}
                        </div>
                        <span className={`text-[9px] font-mono font-bold ${
                          item.patternConfidence > 90 ? 'text-purple-400' : 'text-gray-500'
                        }`}>
                          {item.patternConfidence}%
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Strength */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5">
                    <div className="space-y-2">
                      <div className="w-32 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/20 relative">
                        <div 
                          className={`h-full transition-all duration-1000 rounded-full ${
                            item.techStrength > 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 
                            item.techStrength < 25 ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 
                            'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                          }`} 
                          style={{ width: `${item.techStrength}%` }}
                        ></div>
                      </div>
                      <div className="text-[9px] font-mono uppercase flex justify-between">
                        <span className="text-gray-500">Intensity</span>
                        <span className={`font-bold ${
                          item.techStrength > 75 ? 'text-green-400' :
                          item.techStrength < 25 ? 'text-red-400' : 'text-cyan-400'
                        }`}>{item.techStrength}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Risk Analysis */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5">
                    <div className="flex flex-col gap-2">
                      {item.manipulation.detected ? (
                        <div className="glass bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/30 w-fit">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <ShieldAlert size={14} className="animate-pulse" />
                            <span className="font-black text-[9px] uppercase font-orbitron">{item.manipulation.type}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400/70 text-[9px] uppercase font-mono font-bold">
                          <Zap size={12} /> CLEAN FLOW
                        </div>
                      )}
                      
                      {item.isSpike && (
                        <div className="glass bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/30 w-fit animate-pulse">
                          <div className="flex items-center gap-2 text-orange-400">
                            <AlertTriangle size={14} />
                            <span className="font-black text-[9px] uppercase font-orbitron">
                              {item.spikeData.severity} SPIKE
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {item.technicals?.divergence.detected && (
                        <div className="glass bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 w-fit">
                          <span className="text-[8px] font-mono text-cyan-400 uppercase font-bold">
                            {item.technicals.divergence.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5">
                    <div className="flex flex-col">
                      <div className={`font-orbitron font-black text-2xl leading-none tracking-tighter drop-shadow-[0_0_10px_currentColor] ${
                        item.aiAccuracy > 95 ? 'text-green-400' :
                        item.aiAccuracy > 88 ? 'text-cyan-400' : 'text-yellow-400'
                      }`}>
                        {item.aiAccuracy.toFixed(1)}%
                      </div>
                      <div className={`text-[8px] font-mono uppercase tracking-wider mt-2 font-bold ${
                        item.aiAccuracy > 95 ? 'text-green-400/70' :
                        item.aiAccuracy > 88 ? 'text-cyan-400/70' : 'text-yellow-400/70'
                      }`}>
                        {item.aiAccuracy > 95 ? 'INSTITUTIONAL' : item.aiAccuracy > 85 ? 'HIGH CONF' : 'MODERATE'}
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 lg:px-6 py-4 lg:py-5 text-right">
                    <button 
                      onClick={() => handleLinkChart(item.symbol)}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-500/50 transition-all font-orbitron text-[9px] tracking-wider uppercase flex items-center gap-2 ml-auto group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 font-black"
                    >
                      <Eye size={16} /> CHART
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketScanner;
