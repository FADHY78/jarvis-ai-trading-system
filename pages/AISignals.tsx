
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Brain, Zap, AlertCircle, Clock, TrendingUp, TrendingDown, Target, ShieldCheck, ZapOff, Sparkles, ChevronRight, SearchCode, Radar, Activity, Layers, BarChart3, Shield, Eye, Globe } from 'lucide-react';
import { PriceData } from '../types';
import { detectPatterns, detectManipulation, calculateTechnicalStrength, detectSMC, detectAdvancedSpikes, calculateAdvancedTechnicals, calculateVolatility, analyzeElliottWaves, detectICT } from '../services/mockDataService';
import { sendTelegramSignal } from '../services/telegramService';

interface AISignalsProps {
  prices: Record<string, PriceData>;
}

// V12.0 ULTRA-ACCURATE SIGNAL GENERATION ENGINE
// Combines ALL tools: Scanner + AI Analysis + SMC + ICT + Patterns + Volume + Spike Detection

const AISignals: React.FC<AISignalsProps> = ({ prices }) => {
  const sentSignalsRef = useRef<Set<string>>(new Set());
  const [signalFilter, setSignalFilter] = useState<'ALL' | 'ELITE' | 'HIGH'>('ALL');

  const dynamicSignals = useMemo(() => {
    // Curated high-probability institutional assets - Enhanced asset selection
    const targetPairs = ['R_100', 'R_75', 'R_50', 'frxEURUSD', 'frxGBPUSD', 'GOLD', 'BOOM500', 'BOOM1000', 'CRASH500', 'CRASH1000', 'NAS100', 'BTCUSD'];
    
    return targetPairs.map((pair, idx) => {
      const priceData = prices[pair];
      if (!priceData) return null;

      const currentPrice = priceData.price || 0;
      const history = priceData.history || [];
      
      // ENHANCED CONSISTENCY CHECK: Require more data for ultra-accurate analysis
      if (history.length < 180) return null; // Need at least 180 candles for comprehensive multi-timeframe analysis
      
      // ════════════════════════════════════════════════════════════════════
      // MULTI-TIMEFRAME ANALYSIS V12.0 - 4 Timeframe Perspective
      // ════════════════════════════════════════════════════════════════════
      const m5History = history.slice(-30);   // Last 30 points = M5 perspective (ultra-short)
      const m15History = history.slice(-60);  // Last 60 points = M15 perspective
      const h1History = history.slice(-240);  // Last 240 points = H1 perspective  
      const h4History = history;              // Full history = H4 perspective
      
      // Run comprehensive scanning protocols on ALL timeframes
      // M5 Analysis - Entry Timing
      const m5Strength = calculateTechnicalStrength(m5History);
      const m5Spike = detectAdvancedSpikes(m5History, pair);
      const m5Vol = calculateVolatility(m5History);
      
      // M15 Analysis - Short-term confirmation
      const m15Pattern = detectPatterns(m15History);
      const m15Manipulation = detectManipulation(m15History);
      const m15Strength = calculateTechnicalStrength(m15History);
      const m15SMC = detectSMC(m15History, pair);
      const m15Spike = detectAdvancedSpikes(m15History, pair);
      const m15Technicals = calculateAdvancedTechnicals(m15History);
      
      // H1 Analysis - Primary signal generation
      const h1Pattern = detectPatterns(h1History);
      const h1Manipulation = detectManipulation(h1History);
      const h1Strength = calculateTechnicalStrength(h1History);
      const h1SMC = detectSMC(h1History, pair);
      const h1Spike = detectAdvancedSpikes(h1History, pair);
      const h1Technicals = calculateAdvancedTechnicals(h1History);
      const h1Waves = analyzeElliottWaves(h1History);
      
      // H4 Analysis - Higher timeframe trend direction
      const h4Pattern = detectPatterns(h4History);
      const h4Manipulation = detectManipulation(h4History);
      const h4Strength = calculateTechnicalStrength(h4History);
      const h4SMC = detectSMC(h4History, pair);
      const h4Spike = detectAdvancedSpikes(h4History, pair);
      const h4Technicals = calculateAdvancedTechnicals(h4History);
      const h4Waves = analyzeElliottWaves(h4History);
      
      // ════════════════════════════════════════════════════════════════════
      // ULTRA-PRECISE BIAS DETERMINATION WITH WEIGHTED VOTING
      // ════════════════════════════════════════════════════════════════════
      
      // Technical Strength Bias (RSI-based)
      const m5Bias = m5Strength > 55 ? 'LONG' : m5Strength < 45 ? 'SHORT' : 'NEUTRAL';
      const m15Bias = m15Strength > 55 ? 'LONG' : m15Strength < 45 ? 'SHORT' : 'NEUTRAL';
      const h1Bias = h1Strength > 55 ? 'LONG' : h1Strength < 45 ? 'SHORT' : 'NEUTRAL';
      const h4Bias = h4Strength > 55 ? 'LONG' : h4Strength < 45 ? 'SHORT' : 'NEUTRAL';
      
      // SMC Multi-Timeframe Consensus
      const m15SMCBias = m15SMC.signal.includes('BULLISH') ? 'LONG' : m15SMC.signal.includes('BEARISH') ? 'SHORT' : 'NEUTRAL';
      const h1SMCBias = h1SMC.signal.includes('BULLISH') ? 'LONG' : h1SMC.signal.includes('BEARISH') ? 'SHORT' : 'NEUTRAL';
      const h4SMCBias = h4SMC.signal.includes('BULLISH') ? 'LONG' : h4SMC.signal.includes('BEARISH') ? 'SHORT' : 'NEUTRAL';
      
      // Market Structure Bias
      const h1StructureBias = h1SMC.marketStructure === 'HH/HL' ? 'LONG' : h1SMC.marketStructure === 'LH/LL' ? 'SHORT' : 'NEUTRAL';
      const h4StructureBias = h4SMC.marketStructure === 'HH/HL' ? 'LONG' : h4SMC.marketStructure === 'LH/LL' ? 'SHORT' : 'NEUTRAL';
      
      // MACD Bias
      const h1MACDBias = h1Technicals.macd.trend === 'BULLISH' ? 'LONG' : h1Technicals.macd.trend === 'BEARISH' ? 'SHORT' : 'NEUTRAL';
      const h4MACDBias = h4Technicals.macd.trend === 'BULLISH' ? 'LONG' : h4Technicals.macd.trend === 'BEARISH' ? 'SHORT' : 'NEUTRAL';
      
      // Moving Average Alignment Bias
      const h1MABias = h1Technicals.movingAverages.alignment === 'BULLISH' ? 'LONG' : h1Technicals.movingAverages.alignment === 'BEARISH' ? 'SHORT' : 'NEUTRAL';
      const h4MABias = h4Technicals.movingAverages.alignment === 'BULLISH' ? 'LONG' : h4Technicals.movingAverages.alignment === 'BEARISH' ? 'SHORT' : 'NEUTRAL';
      
      // ICT Concepts Bias
      const ict = h1SMC.ictConcepts;
      const ictSessionBias = ict?.sessionBias === 'BULLISH' ? 'LONG' : ict?.sessionBias === 'BEARISH' ? 'SHORT' : 'NEUTRAL';
      const ictOrderFlowBias = (ict?.institutionalOrderFlow === 'STRONG_BUY' || ict?.institutionalOrderFlow === 'BUY') ? 'LONG' :
                               (ict?.institutionalOrderFlow === 'STRONG_SELL' || ict?.institutionalOrderFlow === 'SELL') ? 'SHORT' : 'NEUTRAL';
      
      // Volume & Order Flow Analysis
      const recentVolume = h1History.slice(-20).reduce((acc, val, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(val - h1History.slice(-20)[i - 1]);
      }, 0) / 20;
      const avgVolume = h1History.slice(-100, -20).reduce((acc, val, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(val - h1History.slice(-100, -20)[i - 1]);
      }, 0) / 80;
      const volumeRatio = avgVolume > 0 ? (recentVolume / avgVolume) : 1;
      const highVolume = volumeRatio > 1.3;
      
      // Order Flow
      const buyPressure = h1History.slice(-30).filter((v, i) => i > 0 && v > h1History.slice(-30)[i - 1]).length;
      const sellPressure = 30 - buyPressure;
      const orderFlowBias = buyPressure > sellPressure + 5 ? 'LONG' : sellPressure > buyPressure + 5 ? 'SHORT' : 'NEUTRAL';
      
      // ════════════════════════════════════════════════════════════════════
      // WEIGHTED VOTING SYSTEM - Higher timeframes carry more weight
      // ════════════════════════════════════════════════════════════════════
      
      // Weighted votes: H4 = 3x, H1 = 2x, M15 = 1.5x, M5 = 1x
      const allVotes = [
        { bias: m5Bias, weight: 1 },
        { bias: m15Bias, weight: 1.5 },
        { bias: h1Bias, weight: 2 },
        { bias: h4Bias, weight: 3 },
        { bias: m15SMCBias, weight: 1.5 },
        { bias: h1SMCBias, weight: 2.5 },
        { bias: h4SMCBias, weight: 3.5 },
        { bias: h1StructureBias, weight: 2.5 },
        { bias: h4StructureBias, weight: 3.5 },
        { bias: h1MACDBias, weight: 2 },
        { bias: h4MACDBias, weight: 3 },
        { bias: h1MABias, weight: 2 },
        { bias: h4MABias, weight: 3 },
        { bias: ictSessionBias, weight: 2 },
        { bias: ictOrderFlowBias, weight: 2.5 },
        { bias: orderFlowBias, weight: 1.5 }
      ];
      
      const longWeight = allVotes.filter(v => v.bias === 'LONG').reduce((acc, v) => acc + v.weight, 0);
      const shortWeight = allVotes.filter(v => v.bias === 'SHORT').reduce((acc, v) => acc + v.weight, 0);
      const totalWeight = allVotes.reduce((acc, v) => acc + v.weight, 0);
      
      // Determine final signal direction with weighted confluence
      let type: 'LONG' | 'SHORT';
      let confluenceScore = 0;
      let biasStrength = 0;
      
      if (longWeight > shortWeight) {
        type = 'LONG';
        biasStrength = (longWeight / totalWeight) * 100;
        confluenceScore = biasStrength * 0.8; // Up to 80 from confluence
      } else {
        type = 'SHORT';
        biasStrength = (shortWeight / totalWeight) * 100;
        confluenceScore = biasStrength * 0.8;
      }
      
      // CRITICAL: Skip signal if bias is too weak (less than 55% agreement)
      if (biasStrength < 55) return null;
      
      // Use H1 as primary timeframe for signal generation (but validated by all TFs)
      const patternData = h1Pattern;
      const manipulation = h1Manipulation;
      const strength = h1Strength;
      const smc = h1SMC;
      const spikeData = h1Spike;
      const technicals = h1Technicals;
      const waves = h1Waves;
      
      // ════════════════════════════════════════════════════════════════════
      // CONFIDENCE CALCULATION V12.0 - ULTRA-PRECISE SCORING
      // ════════════════════════════════════════════════════════════════════
      
      // Base confidence from weighted confluence
      let confidence = Math.min(60, confluenceScore); // Max 60 from confluence
      
      let multipliers = 1.0;
      
      // ════════════════════════════════════════════════════════════════════
      // SMC INSTITUTIONAL FACTORS V12.0 - Enhanced Detection
      // ════════════════════════════════════════════════════════════════════
      
      // Order Block Detection (High-value institutional zones)
      if (smc.factors.some(f => f.includes('ORDER_BLOCK_DETECTED'))) {
        multipliers += 0.45; // Institutional order block - highest value
        if (smc.orderBlocks && smc.orderBlocks.length > 0) {
          // Check if price is AT the order block
          const nearOB = smc.orderBlocks.some(ob => 
            Math.abs(currentPrice - ob.price) / currentPrice < 0.003
          );
          if (nearOB) multipliers += 0.25; // Extra boost for price at OB
        }
      }
      if (smc.orderBlocks && smc.orderBlocks.length > 0) multipliers += 0.20;
      
      // BOS/CHoCH - Market Structure Shifts
      if (smc.factors.some(f => f.includes('CHoCH') || f.includes('BOS'))) multipliers += 0.35;
      if (smc.bosChoch && smc.bosChoch.length > 0) {
        if (smc.bosChoch.some(b => b.includes('CONFIRMED'))) multipliers += 0.20;
      }
      
      // Fair Value Gaps (Imbalance Zones)
      if (smc.factors.some(f => f.includes('FVG'))) multipliers += 0.28;
      if (smc.fairValueGaps && smc.fairValueGaps.length > 0) {
        // Check for FVG fill alignment
        const alignedFVG = smc.fairValueGaps.some(fvg => 
          (type === 'LONG' && fvg.type === 'BULLISH') ||
          (type === 'SHORT' && fvg.type === 'BEARISH')
        );
        if (alignedFVG) multipliers += 0.18;
      }
      
      // Liquidity Zone Analysis
      if (smc.factors.some(f => f.includes('LIQUIDITY_POOL_TARGETED'))) multipliers += 0.40;
      if (smc.liquidityZones && smc.liquidityZones.length >= 3) multipliers += 0.22;
      if (smc.factors.some(f => f.includes('SSL') || f.includes('BSL'))) {
        if (smc.factors.some(f => f.includes('SWEPT'))) multipliers += 0.35; // Liquidity grab complete
      }
      
      // Market Structure Alignment
      if (smc.marketStructure === 'HH/HL' && type === 'LONG') multipliers += 0.38;
      if (smc.marketStructure === 'LH/LL' && type === 'SHORT') multipliers += 0.38;
      
      // Premium/Discount Zones
      if (smc.premiumDiscount === 'DISCOUNT' && type === 'LONG') multipliers += 0.32;
      if (smc.premiumDiscount === 'PREMIUM' && type === 'SHORT') multipliers += 0.32;
      
      // ════════════════════════════════════════════════════════════════════
      // ICT CONCEPTS INTEGRATION V12.0 - Advanced Institutional Trading
      // ════════════════════════════════════════════════════════════════════
      
      if (ict) {
        // Kill Zone Premium - Institutional high-activity windows
        if (ict.killZone === 'NEW_YORK') {
          multipliers += 0.50; // Highest institutional activity
        } else if (ict.killZone === 'LONDON') {
          multipliers += 0.45;
        } else if (ict.killZone === 'ASIA') {
          multipliers += 0.30;
        }
        
        // OTE Zone Alignment - Optimal Trade Entry (0.62-0.79 Fibonacci)
        if (ict.oteZone.inZone) {
          if (ict.oteZone.type === 'BULLISH' && type === 'LONG') {
            multipliers += 0.55; // Perfect OTE alignment
          } else if (ict.oteZone.type === 'BEARISH' && type === 'SHORT') {
            multipliers += 0.55;
          }
        }
        
        // Power of 3 - Accumulation, Manipulation, Distribution
        if (ict.powerOf3.phase === 'DISTRIBUTION') {
          multipliers += (ict.powerOf3.confidence * 0.006); // Up to 0.55 bonus
        } else if (ict.powerOf3.phase === 'MANIPULATION') {
          multipliers += 0.30; // Liquidity grab opportunity - be cautious
        } else if (ict.powerOf3.phase === 'ACCUMULATION') {
          multipliers += 0.20; // Early stage - lower confidence
        }
        
        // Institutional Order Flow - Critical alignment
        if (ict.institutionalOrderFlow === 'STRONG_BUY' && type === 'LONG') {
          multipliers += 0.55;
        } else if (ict.institutionalOrderFlow === 'STRONG_SELL' && type === 'SHORT') {
          multipliers += 0.55;
        } else if (ict.institutionalOrderFlow === 'BUY' && type === 'LONG') {
          multipliers += 0.35;
        } else if (ict.institutionalOrderFlow === 'SELL' && type === 'SHORT') {
          multipliers += 0.35;
        }
        
        // Breaker Blocks - Failed order blocks turned support/resistance
        if (ict.breakerBlocks && ict.breakerBlocks.length > 0) {
          const alignedBreakers = ict.breakerBlocks.filter(bb =>
            (bb.type === 'BULLISH' && type === 'LONG') ||
            (bb.type === 'BEARISH' && type === 'SHORT')
          );
          multipliers += Math.min(0.40, alignedBreakers.length * 0.18);
        }
        
        // Mitigation Blocks - Price imbalance filling zones
        if (ict.mitigationBlocks && ict.mitigationBlocks.length > 0) {
          const validatedCount = ict.mitigationBlocks.filter(mb => mb.validated).length;
          multipliers += Math.min(0.35, validatedCount * 0.14);
        }
        
        // Session Bias Alignment
        if (ict.sessionBias === 'BULLISH' && type === 'LONG') multipliers += 0.38;
        else if (ict.sessionBias === 'BEARISH' && type === 'SHORT') multipliers += 0.38;
        
        // Optimal Entry Signal - The holy grail setup
        if (ict.optimalEntry.signal !== 'WAITING') {
          const entryConfidence = ict.optimalEntry.confidence / 100;
          multipliers += (entryConfidence * 0.65); // Up to 0.65 bonus for perfect setups
        }
      }
      
      // ════════════════════════════════════════════════════════════════════
      // PATTERN RECOGNITION V12.0 - Multi-Level Scoring with Wave Analysis
      // ════════════════════════════════════════════════════════════════════
      
      // Harmonic Pattern Detection with depth scoring
      if (patternData.label.includes('PRO')) {
        if (patternData.confidence >= 98) multipliers += 0.48;
        else if (patternData.confidence >= 95) multipliers += 0.40;
        else if (patternData.confidence >= 92) multipliers += 0.35;
        else multipliers += 0.30;
      }
      if (patternData.label.includes('HARMONIC')) {
        if (patternData.confidence >= 97) multipliers += 0.42;
        else if (patternData.confidence >= 94) multipliers += 0.32;
        else multipliers += 0.25;
      }
      
      // Advanced pattern types
      if (patternData.label.includes('DEEP CRAB') || patternData.label.includes('5-0')) multipliers += 0.45;
      if (patternData.label.includes('WOLFE')) multipliers += 0.35;
      if (patternData.label.includes('THREE DRIVES')) multipliers += 0.32;
      if (patternData.label.includes('HEAD & SHOULDERS')) multipliers += 0.30;
      if (patternData.label.includes('INVERSE HEAD')) multipliers += 0.30;
      
      // Elliott Wave Analysis Integration
      if (waves.waveCount.includes('IMPULSE')) {
        multipliers += 0.35;
        if (waves.projection.confidence > 70) multipliers += 0.20;
      }
      if (waves.fibonacciRelationships.length >= 2) multipliers += 0.25;
      if (waves.alternation && waves.equality) multipliers += 0.20;
      if (waves.wavePersonality.some(p => p.includes('WAVE 3'))) multipliers += 0.18;
      
      // ════════════════════════════════════════════════════════════════════
      // SPIKE & MOMENTUM DETECTION V12.0 - Predictive Analysis
      // ════════════════════════════════════════════════════════════════════
      
      // Spike Detection with severity grading
      if (spikeData.isSpike) {
        const spikeAligned = (spikeData.direction === 'UP' && type === 'LONG') ||
                            (spikeData.direction === 'DOWN' && type === 'SHORT');
        if (spikeAligned) {
          if (spikeData.severity === 'EXTREME') multipliers += 0.55;
          else if (spikeData.severity === 'CRITICAL') multipliers += 0.45;
          else if (spikeData.severity === 'HIGH') multipliers += 0.35;
          else if (spikeData.severity === 'MEDIUM') multipliers += 0.22;
        } else {
          // Spike against our direction - reduce confidence
          multipliers -= 0.15;
        }
      }
      
      // Spike Prediction - Early warning
      if (spikeData.prediction === 'IMMINENT') {
        multipliers += 0.28;
      } else if (spikeData.prediction === 'BUILDING') {
        multipliers += 0.15;
      }
      
      // ════════════════════════════════════════════════════════════════════
      // ADVANCED TECHNICAL ANALYSIS V12.0 - Multi-Indicator Confluence
      // ════════════════════════════════════════════════════════════════════
      
      // MACD Alignment
      if (technicals.macd.trend === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) {
        multipliers += 0.25;
        if (technicals.signals.some(s => s.includes('MACD') && s.includes('CROSS'))) {
          multipliers += 0.15; // Fresh crossover
        }
      }
      
      // Moving Average Alignment
      if (technicals.movingAverages.alignment === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) {
        multipliers += 0.30;
      }
      
      // Divergence Detection - High-value reversal signals
      if (technicals.divergence.detected) {
        const bullishDiv = technicals.divergence.type.includes('BULLISH');
        const bearishDiv = technicals.divergence.type.includes('BEARISH');
        if ((type === 'LONG' && bullishDiv) || (type === 'SHORT' && bearishDiv)) {
          multipliers += 0.35;
        }
      }
      
      // Bollinger Bands Position
      if ((type === 'LONG' && technicals.bollingerBands.position === 'OVERSOLD') ||
          (type === 'SHORT' && technicals.bollingerBands.position === 'OVERBOUGHT')) {
        multipliers += 0.22;
      }
      if (technicals.bollingerBands.squeeze) multipliers += 0.25; // Volatility expansion incoming
      
      // ADX Trend Strength
      if (technicals.adx.trend === 'STRONG') {
        if (technicals.adx.direction === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) {
          multipliers += 0.30;
        }
      }
      
      // Ichimoku Cloud
      if (technicals.ichimoku.signal === (type === 'LONG' ? 'BULLISH' : 'BEARISH')) {
        multipliers += 0.28;
        if (technicals.ichimoku.cloud === (type === 'LONG' ? 'ABOVE' : 'BELOW')) {
          multipliers += 0.15;
        }
      }
      
      // Fibonacci Level Proximity
      if (technicals.fibonacci.nearLevel) multipliers += 0.22;
      
      // Stochastic Oscillator
      if ((technicals.stochastic.signal === 'OVERSOLD' && type === 'LONG') ||
          (technicals.stochastic.signal === 'OVERBOUGHT' && type === 'SHORT')) {
        multipliers += 0.18;
      }
      
      // Overall technical confluence
      const techConfluence = Math.abs(technicals.confluence);
      multipliers += techConfluence * 0.012;
      
      // ════════════════════════════════════════════════════════════════════
      // VOLUME & ORDER FLOW V12.0 - Institutional Activity Detection
      // ════════════════════════════════════════════════════════════════════
      
      // Volume Analysis
      if (highVolume) {
        multipliers += 0.20;
        if (volumeRatio > 2.0) multipliers += 0.15; // Very high volume
      }
      
      // Order Flow Alignment
      if (orderFlowBias === type) multipliers += 0.18;
      
      // Manipulation Detection - Risk Management
      if (!manipulation.detected) {
        multipliers += 0.20; // Clean market conditions
      } else {
        // Graduated severity penalty
        if (manipulation.severity >= 5) multipliers -= 0.25;
        else if (manipulation.severity >= 4) multipliers -= 0.18;
        else if (manipulation.severity >= 3) multipliers -= 0.12;
        else multipliers -= 0.05;
      }
      
      // Institutional Footprint Detection
      if (manipulation.institutionalFootprint) {
        if (manipulation.institutionalFootprint > 70) multipliers += 0.22;
        else if (manipulation.institutionalFootprint > 50) multipliers += 0.14;
      }
      
      // ════════════════════════════════════════════════════════════════════
      // HIGHER TIMEFRAME CONFIRMATION V12.0
      // ════════════════════════════════════════════════════════════════════
      
      // H4 Trend Agreement Bonus
      if ((h4SMC.trend === 'BULLISH' && type === 'LONG') ||
          (h4SMC.trend === 'BEARISH' && type === 'SHORT')) {
        multipliers += 0.35; // Major bonus for H4 alignment
      }
      
      // H4 Pattern Confirmation
      if (h4Pattern.confidence > 90 && h4Pattern.label !== 'STRUCTURAL BIAS') {
        multipliers += 0.25;
      }
      
      // Perfect Multi-Timeframe Alignment Bonus
      const perfectAlignment = 
        h4SMCBias === type && 
        h1SMCBias === type && 
        m15SMCBias === type &&
        h4Bias === type &&
        h1Bias === type;
      
      if (perfectAlignment) {
        multipliers += 0.40; // Exceptional confluence
      }
      
      // ════════════════════════════════════════════════════════════════════
      // FINAL CONFIDENCE CALCULATION
      // ════════════════════════════════════════════════════════════════════
      
      // Apply multipliers to base confidence
      let finalConfidence = confidence * multipliers;
      
      // Add base floor for strong signals
      if (finalConfidence > 50) finalConfidence += 15;
      
      // Cap at 99.9
      finalConfidence = Math.min(99.9, finalConfidence);
      
      // Minimum threshold - Don't generate weak signals
      if (finalConfidence < 70) return null;

      // ════════════════════════════════════════════════════════════════════
      // PRECISE TP/SL CALCULATION V12.0 - Risk-Adjusted Institutional Levels
      // ════════════════════════════════════════════════════════════════════
      
      const entry = currentPrice;
      const priceRange = Math.max(...history) - Math.min(...history);
      const atr = priceRange * 0.02; // 2% of range as base ATR proxy
      
      // Dynamic risk based on confidence
      const riskMultiplier = finalConfidence > 95 ? 1.2 : finalConfidence > 90 ? 1.0 : 0.8;
      const riskAmount = atr * riskMultiplier;
      
      // Calculate TP and SL with proper R:R ratio (minimum 2.5:1)
      const tp = type === 'LONG' 
        ? currentPrice + (riskAmount * 3.0)  // TP is 3x risk above entry for LONG
        : currentPrice - (riskAmount * 3.0); // TP is 3x risk below entry for SHORT
      
      const sl = type === 'LONG' 
        ? currentPrice - riskAmount  // SL is 1x risk below entry for LONG
        : currentPrice + riskAmount; // SL is 1x risk above entry for SHORT

      // ════════════════════════════════════════════════════════════════════
      // SIGNAL REASONING LOGS - Enhanced with all factors
      // ════════════════════════════════════════════════════════════════════
      
      // Determine signal grade
      const signalGrade = finalConfidence >= 96 ? 'ELITE' : 
                          finalConfidence >= 92 ? 'PREMIUM' :
                          finalConfidence >= 88 ? 'HIGH' :
                          finalConfidence >= 82 ? 'STANDARD' : 'DEVELOPING';
      
      // Multi-TF alignment description
      const mtfAlignment = biasStrength >= 75 ? 'PERFECT CONFLUENCE' : 
                          biasStrength >= 65 ? 'STRONG CONFLUENCE' : 
                          biasStrength >= 55 ? 'MODERATE CONFLUENCE' : 'MIXED';
      
      const logs = [
        `📊 ${signalGrade} Signal • ${mtfAlignment}`,
        `🎯 Multi-TF: M5(${m5Bias}) → M15(${m15Bias}) → H1(${h1Bias}) → H4(${h4Bias})`,
        `📈 Bias Strength: ${biasStrength.toFixed(1)}% ${type}`,
        `🔮 Primary: ${smc.signal} (H1)`,
        patternData.label !== 'STRUCTURAL BIAS' ? `🔄 Pattern: ${patternData.label} (${patternData.confidence}%)` : null,
        waves.waveCount !== 'DEVELOPING' ? `📐 Elliott: ${waves.waveCount}` : null,
        ...smc.factors.slice(0, 2),
        smc.marketStructure !== 'RANGING' ? `📈 Structure: ${smc.marketStructure}` : null,
        smc.premiumDiscount !== 'EQUILIBRIUM' ? `💎 Zone: ${smc.premiumDiscount}` : null,
        smc.orderBlocks && smc.orderBlocks.length > 0 ? `🏛️ Order Blocks: ${smc.orderBlocks.length} Active` : null,
        smc.fairValueGaps && smc.fairValueGaps.length > 0 ? `⚡ FVG: ${smc.fairValueGaps.length} Imbalances` : null,
        smc.bosChoch && smc.bosChoch.length > 0 ? `🔀 ${smc.bosChoch[0]}` : null,
        // ICT FACTORS
        ict && ict.killZone !== 'NONE' ? `⏰ ICT Kill Zone: ${ict.killZone} (${ict.killZoneStrength}%)` : null,
        ict && ict.oteZone.inZone ? `🎯 OTE Zone: ${ict.oteZone.type}` : null,
        ict && ict.powerOf3.phase !== 'NONE' ? `📦 Power of 3: ${ict.powerOf3.phase}` : null,
        ict && ict.institutionalOrderFlow !== 'NEUTRAL' ? `💰 Inst. Flow: ${ict.institutionalOrderFlow}` : null,
        ict && ict.optimalEntry.signal !== 'WAITING' ? `🎯 ICT Entry: ${ict.optimalEntry.signal}` : null,
        // Volume & Technical
        highVolume ? `📊 Volume: ${Math.round(volumeRatio * 100)}% (HIGH)` : null,
        orderFlowBias !== 'NEUTRAL' ? `🌊 Order Flow: ${orderFlowBias}` : null,
        ...technicals.signals.slice(0, 2),
        manipulation.detected ? `⚠️ Risk: ${manipulation.type} [${manipulation.severity}/5]` : '✅ Clean Market Flow',
        spikeData.isSpike ? `⚡ Spike: ${spikeData.severity} ${spikeData.direction}` : 
          spikeData.prediction !== 'NEUTRAL' ? `🔮 Spike ${spikeData.prediction}` : null,
        // H4 Confirmation
        `📊 H4 Trend: ${h4SMC.trend} (${h4Strength}%)`
      ].filter(Boolean) as string[];

      // ════════════════════════════════════════════════════════════════════
      // RISK PROFILE DETERMINATION
      // ════════════════════════════════════════════════════════════════════
      
      let riskProfile = 'STANDARD RISK';
      if (manipulation.detected && manipulation.severity >= 4) {
        riskProfile = 'CRITICAL - MANIPULATION ACTIVE';
      } else if (manipulation.detected && manipulation.severity >= 3) {
        riskProfile = 'ELEVATED RISK - MONITOR';
      } else if (finalConfidence >= 96) {
        riskProfile = `INSTITUTIONAL GRADE ${signalGrade}`;
      } else if (finalConfidence >= 92) {
        riskProfile = `HIGH PROBABILITY ${signalGrade}`;
      } else if (finalConfidence >= 85) {
        riskProfile = 'VALIDATED SETUP';
      }

      return {
        id: idx.toString(),
        pair: pair.replace('frx', ''),
        type,
        timeframe: `M5/M15/H1/H4 • ${signalGrade}`,
        confidence: Math.round(finalConfidence),
        entry,
        tp,
        sl,
        currentPrice,
        timestamp: new Date().toLocaleTimeString(),
        reasons: logs,
        riskProfile,
        isDeepScanned: true,
        technicals,
        spikeData,
        // Enhanced metadata
        biasStrength: Math.round(biasStrength),
        signalGrade,
        mtfAlignment,
        volumeRatio: Math.round(volumeRatio * 100),
        orderFlow: orderFlowBias,
        waves,
        h4Trend: h4SMC.trend,
        killZone: ict?.killZone || 'NONE'
      };
    }).filter(s => s !== null && s.currentPrice > 0);
  }, [prices]);

  // Filter signals based on selected filter
  const filteredSignals = useMemo(() => {
    if (signalFilter === 'ALL') return dynamicSignals;
    if (signalFilter === 'ELITE') return dynamicSignals.filter(s => s && s.confidence >= 95);
    if (signalFilter === 'HIGH') return dynamicSignals.filter(s => s && s.confidence >= 88);
    return dynamicSignals;
  }, [dynamicSignals, signalFilter]);

  // Automatically send high-confidence signals to Telegram
  useEffect(() => {
    filteredSignals.forEach(async (signal) => {
      if (!signal) return;
      
      // Only send ELITE signals (confidence >= 92%) and not already sent
      const signalKey = `${signal.pair}-${signal.type}-${signal.confidence}`;
      
      if (signal.confidence >= 92 && !sentSignalsRef.current.has(signalKey)) {
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
          console.log(`📱 Telegram ELITE alert sent: ${signal.pair} ${signal.type} (${signal.confidence}%)`);
        }
      }
    });
  }, [filteredSignals]);

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500 pb-12 lg:pb-16">
      {/* Enhanced Header with Filter Controls */}
      <div className="glass p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-purple-500/20 border-2 border-cyan-500/50 animate-pulse">
                  <Brain size={28} className="lg:w-8 lg:h-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                </div>
                <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-xl animate-ping opacity-20"></div>
              </div>
              <div>
                <h1 className="font-orbitron text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 font-black tracking-tight">
                  SIGNAL ARCHITECTURE V12.0 ULTRA
                </h1>
                <p className="text-[9px] lg:text-[10px] font-mono text-cyan-400/70 uppercase tracking-[0.2em] mt-1">
                  SMC + ICT + Patterns + Waves + Volume + Multi-TF Confluence
                </p>
              </div>
            </div>
            
            {/* Stats Panel */}
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="glass bg-cyan-500/10 px-3 py-2 rounded-lg border border-cyan-500/30">
                <div className="text-[8px] font-mono text-cyan-400/70 uppercase">Active</div>
                <div className="font-orbitron font-black text-lg text-cyan-400">{filteredSignals.length}</div>
              </div>
              <div className="glass bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/30">
                <div className="text-[8px] font-mono text-green-400/70 uppercase">Elite</div>
                <div className="font-orbitron font-black text-lg text-green-400">
                  {dynamicSignals.filter(s => s && s.confidence >= 95).length}
                </div>
              </div>
              <div className="glass bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/30">
                <div className="text-[8px] font-mono text-purple-400/70 uppercase">Avg Conf</div>
                <div className="font-orbitron font-black text-lg text-purple-400">
                  {dynamicSignals.length > 0 ? Math.round(dynamicSignals.reduce((acc, s) => acc + (s?.confidence || 0), 0) / dynamicSignals.length) : 0}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mr-2">Filter:</span>
            {[
              { id: 'ALL', label: 'All Signals', icon: Layers },
              { id: 'ELITE', label: 'Elite (95%+)', icon: Shield },
              { id: 'HIGH', label: 'High (88%+)', icon: Target }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSignalFilter(filter.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider font-bold transition-all duration-300 ${
                  signalFilter === filter.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-cyan-300'
                }`}
              >
                <filter.icon size={12} />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.id}</span>
              </button>
            ))}
            
            <div className="flex-1"></div>
            
            {/* Status Badges */}
            <span className="flex items-center gap-1.5 text-[8px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded-full border border-cyan-500/40">
              <SearchCode size={10} className="text-cyan-400 animate-pulse" /> 
              DEEP SCAN
            </span>
            <span className="flex items-center gap-1.5 text-[8px] font-mono text-green-300 bg-green-950/50 px-2 py-1 rounded-full border border-green-500/40">
              <ShieldCheck size={10} className="text-green-500" /> 
              4-TF ANALYSIS
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
        {filteredSignals.length > 0 ? filteredSignals.map(signal => (
          <div key={signal.id} className={`glass rounded-xl lg:rounded-2xl overflow-hidden border-t-2 lg:border-t-4 transition-all duration-700 group hover:scale-[1.01] ${signal.type === 'LONG' ? 'border-t-green-500 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 'border-t-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]'} relative`}>
            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity ${signal.type === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            {/* Signal Grade Badge */}
            <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-lg text-[8px] font-orbitron font-black uppercase tracking-wider border ${
              signal.signalGrade === 'ELITE' ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 text-yellow-400' :
              signal.signalGrade === 'PREMIUM' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400' :
              signal.signalGrade === 'HIGH' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400' :
              'bg-white/10 border-white/20 text-gray-400'
            }`}>
              {signal.signalGrade}
            </div>
            
            <div className="p-3 lg:p-5 relative z-10">
              <div className="flex justify-between items-start mb-3 lg:mb-5">
                <div>
                  <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                    <h3 className={`font-orbitron font-black text-xl lg:text-2xl xl:text-3xl tracking-tighter ${signal.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.pair}
                    </h3>
                    {signal.killZone !== 'NONE' && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-[7px] font-mono text-orange-400 uppercase">
                        {signal.killZone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <span className="text-[9px] lg:text-[11px] font-mono text-gray-500 uppercase tracking-wide lg:tracking-widest font-bold flex items-center gap-1 lg:gap-2">
                       {signal.type === 'LONG' ? <TrendingUp size={12} className="lg:w-[14px] lg:h-[14px] text-green-500" /> : <TrendingDown size={12} className="lg:w-[14px] lg:h-[14px] text-red-500" />}
                       <span className="hidden sm:inline">{signal.type} • {signal.biasStrength}% BIAS</span>
                       <span className="sm:hidden">{signal.type}</span>
                    </span>
                    <div className="h-1 lg:h-1.5 w-1 lg:w-1.5 rounded-full bg-cyan-500/50"></div>
                    <span className="text-[9px] lg:text-[11px] font-mono text-cyan-400 uppercase font-black">{signal.timestamp}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] lg:text-[10px] font-mono text-cyan-500 mb-1 tracking-[0.2em] lg:tracking-[0.3em] uppercase font-black">
                    <span className="hidden sm:inline">CONFIDENCE</span>
                    <span className="sm:hidden">CONF</span>
                  </div>
                  <div className={`font-orbitron font-black text-2xl lg:text-3xl xl:text-4xl tracking-tighter ${
                    signal.confidence >= 95 ? 'text-green-400' :
                    signal.confidence >= 90 ? 'text-cyan-400' :
                    signal.confidence >= 85 ? 'text-blue-400' : 'text-purple-400'
                  } drop-shadow-[0_0_12px_currentColor]`}>{signal.confidence}%</div>
                </div>
              </div>

              {/* Enhanced Price Grid with H4 Trend */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3 mb-4 lg:mb-5">
                {[
                  { label: 'Live Price', val: signal.currentPrice.toFixed(4), color: 'text-cyan-400 font-bold', shortLabel: 'Live', icon: '⚡' },
                  { label: 'Entry Point', val: signal.entry.toFixed(4), color: 'text-white', shortLabel: 'Entry', icon: '🎯' },
                  { label: 'Take Profit', val: signal.tp.toFixed(4), color: 'text-green-400 font-bold', shortLabel: 'TP', icon: '✓' },
                  { label: 'Stop Loss', val: signal.sl.toFixed(4), color: 'text-red-400 font-bold', shortLabel: 'SL', icon: '✕' },
                  { label: 'H4 Trend', val: signal.h4Trend, color: signal.h4Trend === 'BULLISH' ? 'text-green-400' : signal.h4Trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400', shortLabel: 'H4', icon: '📊' }
                ].map((stat, i) => (
                  <div key={i} className="glass bg-white/[0.03] p-2 lg:p-3 rounded-xl lg:rounded-2xl border-white/5 group-hover:border-cyan-500/20 transition-all relative overflow-hidden">
                    {i === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent animate-pulse"></div>
                    )}
                    <p className="text-[8px] lg:text-[9px] font-mono text-gray-500 mb-1 lg:mb-2 uppercase tracking-tighter font-black relative z-10">
                      <span className="hidden sm:inline">{stat.icon} {stat.label}</span>
                      <span className="sm:hidden">{stat.icon} {stat.shortLabel || stat.label}</span>
                    </p>
                    <p className={`font-mono text-[12px] lg:text-[13px] font-black ${stat.color} truncate tracking-tighter relative z-10`}>{stat.val}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div>
                  <h4 className="text-[9px] lg:text-[10px] font-orbitron text-cyan-400/70 flex items-center gap-2 lg:gap-4 mb-2 lg:mb-3 uppercase tracking-[0.3em] lg:tracking-[0.5em] font-black">
                    <Target size={14} className="lg:w-4 lg:h-4 text-cyan-500" /> 
                    <span className="hidden lg:inline">Ultra-Accurate Signal Analysis V12.0</span>
                    <span className="lg:hidden">ANALYSIS V12.0</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 lg:gap-2">
                    {signal.reasons.slice(0, 5).map((r, i) => (
                      <div key={i} className="text-[10px] lg:text-[11px] font-rajdhani text-gray-300 flex items-center gap-2 lg:gap-3 bg-white/[0.03] p-2 lg:p-2.5 rounded-lg lg:rounded-xl border border-white/5 group-hover:border-cyan-500/10 transition-all">
                        <div className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0 ${
                          r.includes('ELITE') || r.includes('PREMIUM') ? 'bg-yellow-500 animate-pulse' :
                          r.includes('CRITICAL') || r.includes('Trap') || r.includes('⚠️') ? 'bg-red-500 animate-pulse' : 
                          r.includes('BULLISH') || r.includes('LONG') || r.includes('HH/HL') || r.includes('DISCOUNT') || r.includes('✅') ? 'bg-green-500' : 
                          r.includes('BEARISH') || r.includes('SHORT') || r.includes('LH/LL') || r.includes('PREMIUM') ? 'bg-red-500' : 
                          r.includes('Order Block') || r.includes('FVG') || r.includes('🏛️') || r.includes('⚡') ? 'bg-purple-500' :
                          r.includes('ICT') || r.includes('OTE') || r.includes('Kill Zone') ? 'bg-orange-500' :
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
                      <span className="hidden sm:inline">Technical Confluence</span>
                      <span className="sm:hidden">Technicals</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 lg:gap-3">
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
                        <p className="text-[8px] font-mono text-gray-500 uppercase">ADX</p>
                        <p className={`font-mono text-[10px] font-bold ${signal.technicals.adx.trend === 'STRONG' ? 'text-green-400' : 'text-gray-400'}`}>
                          {signal.technicals.adx.trend}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono text-gray-500 uppercase">ICHIMOKU</p>
                        <p className={`font-mono text-[10px] font-bold ${signal.technicals.ichimoku.signal === 'BULLISH' ? 'text-green-400' : signal.technicals.ichimoku.signal === 'BEARISH' ? 'text-red-400' : 'text-gray-400'}`}>
                          {signal.technicals.ichimoku.signal}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono text-gray-500 uppercase">VOL</p>
                        <p className={`font-mono text-[10px] font-bold ${signal.volumeRatio > 130 ? 'text-green-400' : signal.volumeRatio > 100 ? 'text-cyan-400' : 'text-gray-400'}`}>
                          {signal.volumeRatio}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wave Analysis (if available) */}
                {signal.waves && signal.waves.waveCount !== 'DEVELOPING' && (
                  <div className="glass bg-purple-500/5 p-3 rounded-xl border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-purple-400" />
                        <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{signal.waves.waveCount}</span>
                      </div>
                      {signal.waves.fibonacciRelationships.length > 0 && (
                        <span className="text-[9px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                          {signal.waves.fibonacciRelationships[0]}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border flex items-center gap-2 lg:gap-3 transition-all duration-500 ${signal.riskProfile.includes('CRITICAL') ? 'bg-red-500/10 border-red-500/30' : signal.riskProfile.includes('ELITE') || signal.riskProfile.includes('PREMIUM') ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
                  <div className={`p-2 rounded-lg lg:rounded-xl ${signal.riskProfile.includes('CRITICAL') ? 'bg-red-500/20 text-red-400' : signal.riskProfile.includes('ELITE') || signal.riskProfile.includes('PREMIUM') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    <ShieldCheck size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <p className={`text-[8px] lg:text-[10px] font-mono uppercase tracking-[0.2em] lg:tracking-[0.3em] leading-none mb-1 lg:mb-1.5 font-black ${signal.riskProfile.includes('CRITICAL') ? 'text-red-400' : signal.riskProfile.includes('ELITE') || signal.riskProfile.includes('PREMIUM') ? 'text-yellow-400' : 'text-cyan-400'}`}>
                      <span className="hidden sm:inline">Risk & Grade</span>
                      <span className="sm:hidden">Grade</span>
                    </p>
                    <p className={`text-[10px] lg:text-xs font-orbitron font-bold tracking-tight ${signal.riskProfile.includes('CRITICAL') ? 'text-red-100' : signal.riskProfile.includes('ELITE') || signal.riskProfile.includes('PREMIUM') ? 'text-yellow-100' : 'text-cyan-100'}`}>{signal.riskProfile}</p>
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
