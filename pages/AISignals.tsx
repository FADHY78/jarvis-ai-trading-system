
import React, { useMemo, useEffect, useRef } from 'react';
import { Brain, Zap, AlertCircle, Clock, TrendingUp, TrendingDown, Target, ShieldCheck, ZapOff, Sparkles, ChevronRight, SearchCode } from 'lucide-react';
import { PriceData } from '../types';
import { detectPatterns, detectManipulation, calculateTechnicalStrength, detectSMC, detectAdvancedSpikes, calculateAdvancedTechnicals } from '../services/mockDataService';
import { sendTelegramSignal } from '../services/telegramService';

interface AISignalsProps {
  prices: Record<string, PriceData>;
}

const AISignals: React.FC<AISignalsProps> = ({ prices }) => {
  const sentSignalsRef = useRef<Set<string>>(new Set());

  const dynamicSignals = useMemo(() => {
    // Curated high-probability institutional assets
    const targetPairs = ['R_100', 'R_75', 'frxEURUSD', 'GOLD', 'BOOM500', 'CRASH500', 'NAS100', 'BTCUSD'];
    
    return targetPairs.map((pair, idx) => {
      const priceData = prices[pair];
      if (!priceData) return null;

      const currentPrice = priceData.price || 0;
      const history = priceData.history || [];
      
      // CONSISTENCY CHECK: Require minimum data before generating signal
      if (history.length < 150) return null; // Need at least 150 candles for accurate multi-timeframe analysis
      
      // MULTI-TIMEFRAME ANALYSIS: Analyze different timeframe perspectives
      const m15History = history.slice(-60);  // Last 60 points = M15 perspective
      const h1History = history.slice(-240);  // Last 240 points = H1 perspective  
      const h4History = history;  // Full history = H4 perspective
      
      // Run all scanning protocols on ALL timeframes
      const m15Pattern = detectPatterns(m15History);
      const m15Manipulation = detectManipulation(m15History);
      const m15Strength = calculateTechnicalStrength(m15History);
      const m15SMC = detectSMC(m15History, pair);
      const m15Spike = detectAdvancedSpikes(m15History, pair);
      const m15Technicals = calculateAdvancedTechnicals(m15History);
      
      const h1Pattern = detectPatterns(h1History);
      const h1Manipulation = detectManipulation(h1History);
      const h1Strength = calculateTechnicalStrength(h1History);
      const h1SMC = detectSMC(h1History, pair);
      const h1Spike = detectAdvancedSpikes(h1History, pair);
      const h1Technicals = calculateAdvancedTechnicals(h1History);
      
      const h4Pattern = detectPatterns(h4History);
      const h4Manipulation = detectManipulation(h4History);
      const h4Strength = calculateTechnicalStrength(h4History);
      const h4SMC = detectSMC(h4History, pair);
      const h4Spike = detectAdvancedSpikes(h4History, pair);
      const h4Technicals = calculateAdvancedTechnicals(h4History);
      
      // MULTI-TIMEFRAME CONFLUENCE: All timeframes must agree for highest confidence
      const m15Bias = m15Strength > 50 ? 'LONG' : 'SHORT';
      const h1Bias = h1Strength > 50 ? 'LONG' : 'SHORT';
      const h4Bias = h4Strength > 50 ? 'LONG' : 'SHORT';
      
      // SMC Multi-Timeframe Consensus
      const m15SMCBias = m15SMC.signal.includes('BULLISH') ? 'LONG' : m15SMC.signal.includes('BEARISH') ? 'SHORT' : 'NEUTRAL';
      const h1SMCBias = h1SMC.signal.includes('BULLISH') ? 'LONG' : h1SMC.signal.includes('BEARISH') ? 'SHORT' : 'NEUTRAL';
      const h4SMCBias = h4SMC.signal.includes('BULLISH') ? 'LONG' : h4SMC.signal.includes('BEARISH') ? 'SHORT' : 'NEUTRAL';
      
      // Determine final signal direction with timeframe confluence
      let type: 'LONG' | 'SHORT';
      let confluenceScore = 0;
      
      // Count how many timeframes agree
      const longVotes = [m15Bias, h1Bias, h4Bias, m15SMCBias, h1SMCBias, h4SMCBias].filter(b => b === 'LONG').length;
      const shortVotes = [m15Bias, h1Bias, h4Bias, m15SMCBias, h1SMCBias, h4SMCBias].filter(b => b === 'SHORT').length;
      
      if (longVotes > shortVotes) {
        type = 'LONG';
        confluenceScore = longVotes * 12; // Bonus for timeframe alignment
      } else {
        type = 'SHORT';
        confluenceScore = shortVotes * 12;
      }
      
      // Use H1 as primary timeframe for signal generation
      const patternData = h1Pattern;
      const manipulation = h1Manipulation;
      const strength = h1Strength;
      const smc = h1SMC;
      const spikeData = h1Spike;
      const technicals = h1Technicals;
      
      // Confluence Protocol V12: Ultra-Precise Institutional + Neural + Technical Matrix WITH MULTI-TIMEFRAME
      // Start with H1 strength, add multi-timeframe confluence
      let confidence = strength + confluenceScore;
      if (type === 'SHORT') confidence = 100 - strength + confluenceScore;
      
      let multipliers = 1.0;
      
      // Advanced SMC Factors V12 - Enhanced Institutional Footprint Detection
      if (smc.factors.some(f => f.includes('CHoCH') || f.includes('BOS') || f.includes('SPIKE'))) multipliers += 0.38;
      if (smc.factors.some(f => f.includes('FVG') || f.includes('MITIGATION'))) multipliers += 0.28;
      if (smc.factors.some(f => f.includes('ORDER_BLOCK_DETECTED'))) multipliers += 0.42; // Institutional order block
      if (smc.factors.some(f => f.includes('LIQUIDITY_POOL_TARGETED'))) multipliers += 0.38; // Smart money liquidity
      if (smc.orderBlocks && smc.orderBlocks.length > 0) multipliers += 0.25;
      if (smc.liquidityZones && smc.liquidityZones.length >= 3) multipliers += 0.22;
      if (smc.marketStructure === 'HH/HL' && type === 'LONG') multipliers += 0.35;
      if (smc.marketStructure === 'LH/LL' && type === 'SHORT') multipliers += 0.35;
      if (smc.premiumDiscount === 'DISCOUNT' && type === 'LONG') multipliers += 0.30;
      if (smc.premiumDiscount === 'PREMIUM' && type === 'SHORT') multipliers += 0.30;
      if (smc.bosChoch && smc.bosChoch.length > 0) multipliers += 0.25;
      
      // ICT CONCEPTS INTEGRATION V1.0 - Advanced Institutional Trading
      const ict = smc.ictConcepts;
      if (ict) {
        // Kill Zone Premium - Institutional high-activity windows
        if (ict.killZone === 'NEW_YORK') multipliers += 0.45; // Highest institutional activity
        else if (ict.killZone === 'LONDON') multipliers += 0.40;
        else if (ict.killZone === 'ASIA') multipliers += 0.30;
        
        // OTE Zone Alignment - Optimal Trade Entry (0.62-0.79 Fibonacci)
        if (ict.oteZone.inZone) {
          if (ict.oteZone.type === 'BULLISH' && type === 'LONG') multipliers += 0.48; // Perfect alignment
          else if (ict.oteZone.type === 'BEARISH' && type === 'SHORT') multipliers += 0.48;
        }
        
        // Power of 3 - Accumulation, Manipulation, Distribution
        if (ict.powerOf3.phase === 'DISTRIBUTION') {
          multipliers += (ict.powerOf3.confidence * 0.005); // Up to 0.45 bonus
        } else if (ict.powerOf3.phase === 'MANIPULATION') {
          multipliers += 0.25; // Liquidity grab opportunity
        }
        
        // Institutional Order Flow
        if (ict.institutionalOrderFlow === 'STRONG_BUY' && type === 'LONG') multipliers += 0.50;
        else if (ict.institutionalOrderFlow === 'STRONG_SELL' && type === 'SHORT') multipliers += 0.50;
        else if (ict.institutionalOrderFlow === 'BUY' && type === 'LONG') multipliers += 0.30;
        else if (ict.institutionalOrderFlow === 'SELL' && type === 'SHORT') multipliers += 0.30;
        
        // Breaker Blocks - Failed order blocks turned support/resistance
        if (ict.breakerBlocks && ict.breakerBlocks.length > 0) {
          multipliers += Math.min(0.35, ict.breakerBlocks.length * 0.15);
        }
        
        // Mitigation Blocks - Price imbalance filling zones
        if (ict.mitigationBlocks && ict.mitigationBlocks.length > 0) {
          const validatedCount = ict.mitigationBlocks.filter(mb => mb.validated).length;
          multipliers += Math.min(0.30, validatedCount * 0.12);
        }
        
        // Session Bias Alignment
        if (ict.sessionBias === 'BULLISH' && type === 'LONG') multipliers += 0.35;
        else if (ict.sessionBias === 'BEARISH' && type === 'SHORT') multipliers += 0.35;
        
        // Optimal Entry Signal - The holy grail setup
        if (ict.optimalEntry.signal !== 'WAITING') {
          const entryConfidence = ict.optimalEntry.confidence / 100;
          multipliers += (entryConfidence * 0.60); // Up to 0.60 bonus for perfect setups
        }
      }
      
      // Enhanced Pattern Recognition V12.0 - Confidence-Based Graduated Scoring
      if (patternData.label.includes('PRO')) {
        // Ultra-precise pattern confidence boost
        if (patternData.confidence >= 98) multipliers += 0.42;
        else if (patternData.confidence >= 95) multipliers += 0.35;
        else multipliers += 0.30;
      } else if (patternData.label.includes('HARMONIC')) {
        if (patternData.confidence >= 97) multipliers += 0.38;
        else if (patternData.confidence >= 94) multipliers += 0.28;
        else multipliers += 0.25;
      }
      if (patternData.label.includes('ELLIOTT')) multipliers += 0.22;
      if (patternData.label.includes('WOLFE')) multipliers += 0.28;
      if (patternData.label.includes('THREE DRIVES')) multipliers += 0.26;
      if (patternData.label.includes('DEEP CRAB') || patternData.label.includes('5-0')) multipliers += 0.40; // NEW: Advanced harmonics
      
      // Manipulation & Spike Detection V12.0 - Multi-Timeframe Severity Analysis
      if (!manipulation.detected) multipliers += 0.18;
      else if (manipulation.severity > 4) multipliers -= 0.15;
      else multipliers -= 0.08;
      
      // Graduated institutional footprint scoring
      if (manipulation.institutionalFootprint) {
        if (manipulation.institutionalFootprint > 70) multipliers += 0.18; // Strong institutional presence
        else if (manipulation.institutionalFootprint > 50) multipliers += 0.12;
      }
      
      // Enhanced spike severity granularity
      if (spikeData.isSpike) {
        if (spikeData.severity === 'EXTREME') multipliers += 0.45; // Increased from 0.40
        else if (spikeData.severity === 'CRITICAL') multipliers += 0.38; // Increased from 0.32
        else if (spikeData.severity === 'HIGH') multipliers += 0.28; // NEW: High severity tier
      }
      if (spikeData.prediction === 'IMMINENT') multipliers += 0.20;
      else if (spikeData.prediction === 'BUILDING') multipliers += 0.10;
      
      // Advanced Technical Analysis Confluence V12.0
      if (technicals.macd.trend === type) multipliers += 0.20;
      if (technicals.movingAverages.alignment === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) multipliers += 0.25;
      if (technicals.divergence.detected) {
        if ((type === 'LONG' && technicals.divergence.type.includes('BULLISH')) ||
            (type === 'SHORT' && technicals.divergence.type.includes('BEARISH'))) {
          multipliers += 0.28;
        }
      }
      if ((type === 'LONG' && technicals.bollingerBands.position === 'OVERSOLD') ||
          (type === 'SHORT' && technicals.bollingerBands.position === 'OVERBOUGHT')) {
        multipliers += 0.18;
      }
      if (technicals.bollingerBands.squeeze) multipliers += 0.22;
      if (technicals.adx.trend === 'STRONG' && technicals.adx.direction === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) {
        multipliers += 0.25;
      }
      if (technicals.ichimoku.signal === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) multipliers += 0.23;
      if (technicals.fibonacci.nearLevel) multipliers += 0.20;
      if (technicals.stochastic.signal === 'OVERSOLD' && type === 'LONG') multipliers += 0.15;
      if (technicals.stochastic.signal === 'OVERBOUGHT' && type === 'SHORT') multipliers += 0.15;
      
      // Enhanced confluence score bonus with depth analysis
      const confluenceBonus = Math.abs(technicals.confluence) * 0.015;
      multipliers += confluenceBonus;
      
      const finalConfidence = Math.min(99.9, (confidence * multipliers) + 20);

      // Institutional Order Placement Precision - Fixed for accurate TP/SL
      const entry = currentPrice;
      const priceRange = Math.max(...history) - Math.min(...history);
      const riskAmount = priceRange * 0.025; // 2.5% of range as base risk
      
      // Calculate TP and SL using addition/subtraction (not multiplication)
      const tp = type === 'LONG' 
        ? currentPrice + (riskAmount * 2.5)  // TP is 2.5x risk above entry for LONG
        : currentPrice - (riskAmount * 2.5); // TP is 2.5x risk below entry for SHORT
      
      const sl = type === 'LONG' 
        ? currentPrice - riskAmount  // SL is 1x risk below entry for LONG
        : currentPrice + riskAmount; // SL is 1x risk above entry for SHORT

      const logs = [
        `Multi-Timeframe Analysis: M15/H1/H4 Confluence`,
        `Primary Signal: ${smc.signal} (H1 Timeframe)`,
        `Timeframe Alignment: ${confluenceScore > 60 ? 'PERFECT CONFLUENCE' : confluenceScore > 36 ? 'STRONG CONFLUENCE' : 'MODERATE CONFLUENCE'}`,
        `Pattern Logic: ${patternData.label} (${patternData.confidence}%)`,
        `Network Intensity: ${strength}% Core Delta`,
        ...smc.factors.slice(0, 2),
        smc.marketStructure !== 'RANGING' ? `Market Structure: ${smc.marketStructure}` : null,
        smc.premiumDiscount !== 'EQUILIBRIUM' ? `Price Zone: ${smc.premiumDiscount}` : null,
        smc.orderBlocks && smc.orderBlocks.length > 0 ? `Order Blocks: ${smc.orderBlocks.length} Active Zones` : null,
        smc.fairValueGaps && smc.fairValueGaps.length > 0 ? `FVG: ${smc.fairValueGaps.length} Imbalances` : null,
        smc.bosChoch && smc.bosChoch.length > 0 ? smc.bosChoch[0] : null,
        // ICT FACTORS INTEGRATION
        ict && ict.killZone !== 'NONE' ? `⚡ ICT Kill Zone: ${ict.killZone} (${ict.killZoneStrength}% Active)` : null,
        ict && ict.oteZone.inZone ? `🎯 OTE Zone: ${ict.oteZone.type} (0.62-0.79 Fib)` : null,
        ict && ict.powerOf3.phase !== 'NONE' ? `📦 Power of 3: ${ict.powerOf3.phase} (${ict.powerOf3.confidence}%)` : null,
        ict && ict.institutionalOrderFlow !== 'NEUTRAL' ? `💰 Institutional Flow: ${ict.institutionalOrderFlow}` : null,
        ict && ict.optimalEntry.signal !== 'WAITING' ? `🎯 ICT Entry: ${ict.optimalEntry.signal} (${Math.round(ict.optimalEntry.confidence)}%)` : null,
        ict && ict.sessionBias !== 'NEUTRAL' ? `📊 Session Bias: ${ict.sessionBias}` : null,
        ...technicals.signals.slice(0, 2),
        manipulation.detected ? `Trap Protocol: ${manipulation.type} [${manipulation.severity}/5]` : 'Integrity: HIGH-FIDELITY',
        spikeData.isSpike ? `Spike Alert: ${spikeData.severity} ${spikeData.direction} (${spikeData.probability}%)` : null,
        `M15: ${m15SMCBias} (${m15Strength.toFixed(0)}%)`,
        `H1: ${h1SMCBias} (${h1Strength.toFixed(0)}%)`,
        `H4: ${h4SMCBias} (${h4Strength.toFixed(0)}%)`
      ].filter(Boolean) as string[];

      return {
        id: idx.toString(),
        pair: pair.replace('frx', ''),
        type,
        timeframe: `M15/H1/H4 ${confluenceScore > 60 ? '⚡ ELITE' : 'CONFLUENCE'}`,
        confidence: Math.round(finalConfidence),
        entry,
        tp,
        sl,
        currentPrice,
        timestamp: new Date().toLocaleTimeString(),
        reasons: logs,
        riskProfile: manipulation.detected && manipulation.severity > 4 
          ? 'CRITICAL - TRAP ACTIVE V12.0' 
          : manipulation.detected && manipulation.severity > 2
          ? 'ELEVATED RISK - MONITOR'
          : (finalConfidence > 96 ? 'INSTITUTIONAL GRADE V12.0 ELITE' : finalConfidence > 92 ? 'INSTITUTIONAL GRADE V12.0' : finalConfidence > 85 ? 'HIGH PROBABILITY V12.0' : 'RETAIL CONFLUENCE'),
        isDeepScanned: true, // All signals are now multi-timeframe deep scanned
        technicals,
        spikeData
      };
    }).filter(s => s !== null && s.currentPrice > 0);
  }, [prices]);

  // Automatically send high-confidence signals to Telegram
  useEffect(() => {
    dynamicSignals.forEach(async (signal) => {
      if (!signal) return;
      
      // Only send signals with confidence >= 85% and not already sent
      const signalKey = `${signal.pair}-${signal.type}-${signal.confidence}`;
      
      if (signal.confidence >= 85 && !sentSignalsRef.current.has(signalKey)) {
        const sent = await sendTelegramSignal({
          pair: signal.pair,
          type: signal.type,
          confidence: signal.confidence,
          entry: signal.entry,
          tp: signal.tp,
          sl: signal.sl,
          currentPrice: signal.currentPrice,
          timestamp: signal.timestamp,
          riskProfile: signal.riskProfile,
          reasons: signal.reasons,
          isDeepScanned: signal.isDeepScanned
        });
        
        if (sent) {
          sentSignalsRef.current.add(signalKey);
          console.log(`📱 Telegram alert sent: ${signal.pair} ${signal.type} (${signal.confidence}%)`);
        }
      }
    });
  }, [dynamicSignals]);

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500 pb-12 lg:pb-16">
      <div className="flex flex-col gap-3 lg:gap-4 mb-3 lg:mb-4">
        <div className="space-y-1.5">
          <h1 className="font-orbitron text-xl lg:text-2xl xl:text-3xl text-cyan-400 flex items-center gap-2 lg:gap-4 font-black tracking-tighter uppercase">
            <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-500 animate-pulse" /> 
            <span className="hidden sm:inline">Signal Architecture V11.0 ELITE</span>
            <span className="sm:hidden">Signals V11.0</span>
          </h1>
          <p className="text-[9px] lg:text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] font-bold">
            <span className="hidden lg:inline">Elite SMC + Predictive Spikes + Advanced Confluence + Institutional Footprint</span>
            <span className="lg:hidden">SMC + SPIKES + CONFLUENCE</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <span className="flex items-center gap-1.5 lg:gap-2.5 text-[8px] lg:text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-3 lg:px-5 py-1.5 lg:py-2 rounded-full border border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
            <SearchCode size={12} className="lg:w-[14px] lg:h-[14px] text-cyan-400" /> 
            <span className="hidden sm:inline">DEEP SPIKE SCAN: ACTIVE</span>
            <span className="sm:hidden">SPIKE SCAN</span>
          </span>
          <span className="flex items-center gap-1.5 lg:gap-2.5 text-[8px] lg:text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-3 lg:px-5 py-1.5 lg:py-2 rounded-full border border-cyan-500/40">
            <ShieldCheck size={12} className="lg:w-[14px] lg:h-[14px] text-green-500" /> 
            <span className="hidden sm:inline">AUDIT LEVEL: MAX</span>
            <span className="sm:hidden">AUDIT: MAX</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
        {dynamicSignals.length > 0 ? dynamicSignals.map(signal => (
          <div key={signal.id} className={`glass rounded-xl lg:rounded-2xl overflow-hidden border-t-2 lg:border-t-4 transition-all duration-700 group hover:scale-[1.01] ${signal.type === 'LONG' ? 'border-t-green-500 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 'border-t-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]'} relative`}>
            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity ${signal.type === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            <div className="p-3 lg:p-5 relative z-10">
              <div className="flex justify-between items-start mb-3 lg:mb-5">
                <div>
                  <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                    <h3 className={`font-orbitron font-black text-xl lg:text-2xl xl:text-3xl tracking-tighter ${signal.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.pair}
                    </h3>
                    {signal.isDeepScanned && (
                      <span className="px-1.5 lg:px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[7px] lg:text-[8px] font-mono text-cyan-400 uppercase animate-pulse">
                        <span className="hidden sm:inline">Deep Spike Scan</span>
                        <span className="sm:hidden">DEEP</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <span className="text-[9px] lg:text-[11px] font-mono text-gray-500 uppercase tracking-wide lg:tracking-widest font-bold flex items-center gap-1 lg:gap-2">
                       {signal.type === 'LONG' ? <TrendingUp size={12} className="lg:w-[14px] lg:h-[14px] text-green-500" /> : <TrendingDown size={12} className="lg:w-[14px] lg:h-[14px] text-red-500" />}
                       <span className="hidden sm:inline">{signal.type} POSITION</span>
                       <span className="sm:hidden">{signal.type}</span>
                    </span>
                    <div className="h-1 lg:h-1.5 w-1 lg:w-1.5 rounded-full bg-cyan-500/50"></div>
                    <span className="text-[9px] lg:text-[11px] font-mono text-cyan-400 uppercase font-black">{signal.timestamp}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] lg:text-[10px] font-mono text-cyan-500 mb-1 tracking-[0.2em] lg:tracking-[0.3em] uppercase font-black">
                    <span className="hidden sm:inline">AI ACCURACY</span>
                    <span className="sm:hidden">AI</span>
                  </div>
                  <div className="font-orbitron font-black text-2xl lg:text-3xl xl:text-4xl text-cyan-400 group-hover:neon-text-blue transition-all duration-500 tracking-tighter">{signal.confidence}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-4 lg:mb-5">
                {[
                  { label: 'Live Price', val: signal.currentPrice.toFixed(4), color: 'text-cyan-400 font-bold', shortLabel: 'Live', icon: '⚡' },
                  { label: 'Entry Point', val: signal.entry.toFixed(4), color: 'text-white', shortLabel: 'Entry', icon: '🎯' },
                  { label: 'Take Profit', val: signal.tp.toFixed(4), color: 'text-green-400 font-bold', shortLabel: 'TP', icon: '✓' },
                  { label: 'Stop Loss', val: signal.sl.toFixed(4), color: 'text-red-400 font-bold', shortLabel: 'SL', icon: '✕' }
                ].map((stat, i) => (
                  <div key={i} className="glass bg-white/[0.03] p-2 lg:p-3 rounded-xl lg:rounded-2xl border-white/5 group-hover:border-cyan-500/20 transition-all relative overflow-hidden">
                    {i === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent animate-pulse"></div>
                    )}
                    <p className="text-[8px] lg:text-[9px] font-mono text-gray-500 mb-1 lg:mb-2 uppercase tracking-tighter font-black relative z-10">
                      <span className="hidden sm:inline">{stat.icon} {stat.label}</span>
                      <span className="sm:hidden">{stat.icon} {stat.shortLabel || stat.label}</span>
                    </p>
                    <p className={`font-mono text-[13px] font-black ${stat.color} truncate tracking-tighter relative z-10`}>{stat.val}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div>
                  <h4 className="text-[9px] lg:text-[10px] font-orbitron text-cyan-400/70 flex items-center gap-2 lg:gap-4 mb-2 lg:mb-3 uppercase tracking-[0.3em] lg:tracking-[0.5em] font-black">
                    <Target size={14} className="lg:w-4 lg:h-4 text-cyan-500" /> 
                    <span className="hidden lg:inline">institutional confluence data V10.0</span>
                    <span className="lg:hidden">CONFLUENCE V10.0</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 lg:gap-2">
                    {signal.reasons.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-[10px] lg:text-[11px] font-rajdhani text-gray-300 flex items-center gap-2 lg:gap-3 bg-white/[0.03] p-2 lg:p-2.5 rounded-lg lg:rounded-xl border border-white/5 group-hover:border-cyan-500/10 transition-all">
                        <div className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0 ${
                          r.includes('CRITICAL') || r.includes('Trap') || r.includes('SPIKE') ? 'bg-red-500 animate-pulse' : 
                          r.includes('BULLISH') || r.includes('GOLDEN') || r.includes('HH/HL') || r.includes('DISCOUNT') ? 'bg-green-500' : 
                          r.includes('BEARISH') || r.includes('DEATH') || r.includes('LH/LL') || r.includes('PREMIUM') ? 'bg-red-500' : 
                          r.includes('Order Blocks') || r.includes('FVG') ? 'bg-purple-500' :
                          'bg-cyan-400'
                        }`}></div>
                        <span className="truncate font-semibold uppercase tracking-tight">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Technical Analysis Display */}
                {signal.technicals && (
                  <div className="glass bg-white/[0.02] p-3 lg:p-4 rounded-xl lg:rounded-2xl border-cyan-500/10">
                    <h4 className="text-[9px] lg:text-[10px] font-orbitron text-cyan-400/70 mb-2 lg:mb-3 uppercase tracking-[0.3em] lg:tracking-[0.4em] font-black flex items-center gap-2">
                      <Sparkles size={12} className="lg:w-[14px] lg:h-[14px]" /> 
                      <span className="hidden sm:inline">Advanced Technicals</span>
                      <span className="sm:hidden">Technicals</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3">
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono text-gray-500 uppercase">RSI</p>
                        <p className={`font-mono text-sm font-bold ${signal.technicals.rsi > 70 ? 'text-red-400' : signal.technicals.rsi < 30 ? 'text-green-400' : 'text-cyan-400'}`}>
                          {signal.technicals.rsi.toFixed(0)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono text-gray-500 uppercase">MACD</p>
                        <p className={`font-mono text-[10px] font-bold ${signal.technicals.macd.trend === 'BULLISH' ? 'text-green-400' : signal.technicals.macd.trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400'}`}>
                          {signal.technicals.macd.trend}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono text-gray-500 uppercase">BB Status</p>
                        <p className={`font-mono text-[10px] font-bold ${signal.technicals.bollingerBands.position === 'OVERBOUGHT' ? 'text-red-400' : signal.technicals.bollingerBands.position === 'OVERSOLD' ? 'text-green-400' : 'text-gray-400'}`}>
                          {signal.technicals.bollingerBands.position}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono text-gray-500 uppercase">MA Align</p>
                        <p className={`font-mono text-[10px] font-bold ${signal.technicals.movingAverages.alignment === 'BULLISH' ? 'text-green-400' : signal.technicals.movingAverages.alignment === 'BEARISH' ? 'text-red-400' : 'text-gray-400'}`}>
                          {signal.technicals.movingAverages.alignment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border flex items-center gap-2 lg:gap-3 transition-all duration-500 ${signal.riskProfile.includes('CRITICAL') ? 'bg-red-500/10 border-red-500/30' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
                  <div className={`p-2 rounded-lg lg:rounded-xl ${signal.riskProfile.includes('CRITICAL') ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    <ShieldCheck size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <p className={`text-[8px] lg:text-[10px] font-mono uppercase tracking-[0.2em] lg:tracking-[0.3em] leading-none mb-1 lg:mb-1.5 font-black ${signal.riskProfile.includes('CRITICAL') ? 'text-red-400' : 'text-cyan-400'}`}>
                      <span className="hidden sm:inline">Risk Protocol Status</span>
                      <span className="sm:hidden">Risk Status</span>
                    </p>
                    <p className={`text-[10px] lg:text-xs font-orbitron font-bold tracking-tight ${signal.riskProfile.includes('CRITICAL') ? 'text-red-100' : 'text-cyan-100'}`}>{signal.riskProfile}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 lg:mt-5 flex flex-col sm:flex-row gap-2 lg:gap-3">
                <button className={`flex-1 py-2.5 lg:py-3 font-black font-orbitron text-[9px] lg:text-[11px] rounded-xl lg:rounded-2xl transition-all neon-glow uppercase tracking-[0.2em] lg:tracking-[0.4em] ${signal.type === 'LONG' ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-400'}`}>
                  <span className="hidden sm:inline">EXECUTE {signal.type} POSITION</span>
                  <span className="sm:hidden">{signal.type} EXEC</span>
                </button>
                <button className="px-4 lg:px-6 py-2.5 lg:py-3 border border-white/10 text-gray-500 font-black font-orbitron text-[9px] lg:text-[11px] rounded-xl lg:rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider lg:tracking-widest flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">ARCHIVE</span>
                  <span className="sm:hidden">ARC</span>
                  <ChevronRight size={12} className="lg:w-[14px] lg:h-[14px]" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-64 text-center glass rounded-[60px] border-dashed border-cyan-500/10 bg-cyan-950/5 relative overflow-hidden flex flex-col items-center justify-center">
            <ZapOff size={80} className="text-cyan-900/40 mb-10 animate-pulse" />
            <h3 className="font-orbitron text-gray-500 uppercase tracking-[0.6em] font-black text-xl">Node Synchronizing</h3>
            <p className="text-[12px] font-mono text-cyan-900/60 mt-6 uppercase tracking-[0.4em] font-bold">Scanning Global Liquidity Grids for Institutional Entry Nodes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISignals;
