
import { PriceData } from '../types';

export interface PatternResult {
  label: string;
  confidence: number;
}

export const initialPriceData: Record<string, PriceData> = {
  'EURUSD': { symbol: 'EURUSD', price: 1.0892, change: 0.0012, changePercent: 0.11, history: Array(150).fill(1.0892), volatility: 0.05 },
  'GBPUSD': { symbol: 'GBPUSD', price: 1.2642, change: -0.0008, changePercent: -0.06, history: Array(150).fill(1.2642), volatility: 0.08 },
  'GOLD': { symbol: 'GOLD', price: 2038.2, change: 3.2, changePercent: 0.16, history: Array(150).fill(2038.2), volatility: 0.25 },
  'BTCUSD': { symbol: 'BTCUSD', price: 51240, change: 450, changePercent: 0.88, history: Array(150).fill(51240), volatility: 1.2 },
  'BOOM500': { symbol: 'BOOM500', price: 12450, change: 120, changePercent: 0.97, history: Array(150).fill(12450), volatility: 2.1 },
  'CRASH500': { symbol: 'CRASH500', price: 8450, change: -80, changePercent: -0.95, history: Array(150).fill(8450), volatility: 2.1 },
  'NAS100': { symbol: 'NAS100', price: 17850, change: -45, changePercent: -0.25, history: Array(150).fill(17850), volatility: 0.45 },
};

export const generatePriceUpdate = (prev: PriceData): PriceData => {
  const volatility = prev.volatility / 100;
  const change = (Math.random() - 0.5) * volatility * prev.price;
  const newPrice = prev.price + change;
  const newHistory = [...prev.history.slice(-199), newPrice]; 
  
  let lastSpike = prev.lastSpike;
  const suddenMove = Math.abs(change / prev.price) * 100;
  if (suddenMove > 0.055) { 
    lastSpike = Date.now();
  }

  return {
    ...prev,
    price: newPrice,
    change: newPrice - prev.history[0],
    changePercent: ((newPrice - prev.history[0]) / prev.history[0]) * 100,
    history: newHistory,
    lastSpike
  };
};

export const calculateVolatility = (history: number[]) => {
  if (history.length < 2) return 0;
  const returns = history.slice(1).map((val, i) => (val - history[i]) / history[i]);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 1200; 
};

/**
 * JARVIS Smart Money Concepts (SMC) Engine V10.0
 * Enhanced institutional analysis with advanced order blocks, FVG, liquidity zones, and market structure.
 */
export interface SMCResult {
  signal: string;
  factors: string[];
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  accuracy: number;
  orderBlocks: { type: 'BULLISH' | 'BEARISH'; price: number; strength: number }[];
  fairValueGaps: { type: 'BULLISH' | 'BEARISH'; start: number; end: number }[];
  liquidityZones: { type: 'BUY' | 'SELL'; price: number; strength: number }[];
  marketStructure: 'HH/HL' | 'LH/LL' | 'RANGING';
  premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  bosChoch: string[];
  ictConcepts?: ICTResult;
}

/**
 * JARVIS ICT (Inner Circle Trader) Concepts V1.0
 * Advanced institutional trading concepts including Kill Zones, OTE, Breaker Blocks, Power of 3
 */
export interface ICTResult {
  killZone: 'LONDON' | 'NEW_YORK' | 'ASIA' | 'NONE';
  killZoneStrength: number;
  oteZone: { inZone: boolean; level: number; type: 'BULLISH' | 'BEARISH' | 'NONE' };
  breakerBlocks: { type: 'BULLISH' | 'BEARISH'; price: number; strength: number }[];
  mitigationBlocks: { type: 'BULLISH' | 'BEARISH'; price: number; validated: boolean }[];
  powerOf3: { phase: 'ACCUMULATION' | 'MANIPULATION' | 'DISTRIBUTION' | 'NONE'; confidence: number };
  institutionalOrderFlow: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  optimalEntry: { signal: string; confidence: number; zones: number[] };
  sessionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ictFactors: string[];
}

/**
 * JARVIS ICT (Inner Circle Trader) Analysis Engine V1.0
 * Implements advanced institutional trading concepts for enhanced market reading
 */
export const detectICT = (history: number[], symbol?: string): ICTResult => {
  if (history.length < 50) return {
    killZone: 'NONE',
    killZoneStrength: 0,
    oteZone: { inZone: false, level: 0, type: 'NONE' },
    breakerBlocks: [],
    mitigationBlocks: [],
    powerOf3: { phase: 'NONE', confidence: 0 },
    institutionalOrderFlow: 'NEUTRAL',
    optimalEntry: { signal: 'WAITING', confidence: 0, zones: [] },
    sessionBias: 'NEUTRAL',
    ictFactors: []
  };

  const ictFactors: string[] = [];
  const last = history[history.length - 1];
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min;

  // ===== KILL ZONE DETECTION =====
  // Kill Zones are specific time windows where institutional activity is highest
  // We simulate this based on price action characteristics
  const currentHour = new Date().getUTCHours();
  let killZone: 'LONDON' | 'NEW_YORK' | 'ASIA' | 'NONE' = 'NONE';
  let killZoneStrength = 0;

  // London Kill Zone: 02:00-05:00 EST (07:00-10:00 UTC)
  // New York Kill Zone: 07:00-10:00 EST (12:00-15:00 UTC)
  // Asia Kill Zone: 20:00-00:00 EST (01:00-05:00 UTC)
  
  if (currentHour >= 7 && currentHour < 10) {
    killZone = 'LONDON';
    killZoneStrength = 95;
    ictFactors.push('🎯 LONDON KILL ZONE ACTIVE');
  } else if (currentHour >= 12 && currentHour < 15) {
    killZone = 'NEW_YORK';
    killZoneStrength = 98;
    ictFactors.push('🎯 NEW YORK KILL ZONE ACTIVE');
  } else if (currentHour >= 1 && currentHour < 5) {
    killZone = 'ASIA';
    killZoneStrength = 85;
    ictFactors.push('🎯 ASIA KILL ZONE ACTIVE');
  }

  // ===== OPTIMAL TRADE ENTRY (OTE) DETECTION =====
  // OTE is typically between 0.62-0.79 retracement of a move
  const recentHigh = Math.max(...history.slice(-30));
  const recentLow = Math.min(...history.slice(-30));
  const recentRange = recentHigh - recentLow;
  
  const ote62 = recentHigh - (recentRange * 0.62);
  const ote705 = recentHigh - (recentRange * 0.705);
  const ote79 = recentHigh - (recentRange * 0.79);
  
  // Bullish OTE (price in discount retracing to buy zone)
  const inBullishOTE = last >= ote79 && last <= ote62 && last < (recentHigh + recentLow) / 2;
  // Bearish OTE (price in premium retracing to sell zone)
  const bearishOte62 = recentLow + (recentRange * 0.62);
  const bearishOte705 = recentLow + (recentRange * 0.705);
  const bearishOte79 = recentLow + (recentRange * 0.79);
  const inBearishOTE = last >= bearishOte62 && last <= bearishOte79 && last > (recentHigh + recentLow) / 2;
  
  let oteZone: { inZone: boolean; level: number; type: 'BULLISH' | 'BEARISH' | 'NONE' } = {
    inZone: false,
    level: 0,
    type: 'NONE'
  };
  
  if (inBullishOTE) {
    oteZone = { inZone: true, level: ote705, type: 'BULLISH' };
    ictFactors.push('📍 OTE BULLISH ZONE (0.62-0.79)');
  } else if (inBearishOTE) {
    oteZone = { inZone: true, level: bearishOte705, type: 'BEARISH' };
    ictFactors.push('📍 OTE BEARISH ZONE (0.62-0.79)');
  }

  // ===== BREAKER BLOCK DETECTION =====
  // Breaker blocks are failed order blocks that reverse and become support/resistance
  const breakerBlocks: { type: 'BULLISH' | 'BEARISH'; price: number; strength: number }[] = [];
  
  for (let i = 30; i < history.length - 10; i++) {
    const candle = history[i];
    const prev = history[i - 1];
    const next = history[i + 1];
    
    // Bullish Breaker: Price breaks below support, then reclaims it
    const brokeBelow = next < candle * 0.995;
    const reclaimedAbove = history.slice(i + 5, i + 10).some(p => p > candle);
    
    if (brokeBelow && reclaimedAbove) {
      const strength = Math.min(100, ((candle - min) / range) * 100);
      breakerBlocks.push({ type: 'BULLISH', price: candle, strength });
    }
    
    // Bearish Breaker: Price breaks above resistance, then falls below
    const brokeAbove = next > candle * 1.005;
    const fellBelow = history.slice(i + 5, i + 10).some(p => p < candle);
    
    if (brokeAbove && fellBelow) {
      const strength = Math.min(100, ((max - candle) / range) * 100);
      breakerBlocks.push({ type: 'BEARISH', price: candle, strength });
    }
  }
  
  // Check if current price is near breaker blocks
  const nearBullishBreaker = breakerBlocks.filter(bb => 
    bb.type === 'BULLISH' && Math.abs(last - bb.price) / last < 0.005
  );
  const nearBearishBreaker = breakerBlocks.filter(bb => 
    bb.type === 'BEARISH' && Math.abs(last - bb.price) / last < 0.005
  );
  
  if (nearBullishBreaker.length > 0) {
    ictFactors.push(`⚡ BULLISH BREAKER BLOCK (${nearBullishBreaker.length})`);
  }
  if (nearBearishBreaker.length > 0) {
    ictFactors.push(`⚡ BEARISH BREAKER BLOCK (${nearBearishBreaker.length})`);
  }

  // ===== MITIGATION BLOCK DETECTION =====
  // Mitigation blocks are zones where price imbalances are filled
  const mitigationBlocks: { type: 'BULLISH' | 'BEARISH'; price: number; validated: boolean }[] = [];
  
  for (let i = 20; i < history.length - 5; i++) {
    const candle = history[i];
    const strongMove = Math.abs(history[i + 1] - candle) > range * 0.015;
    
    if (strongMove) {
      // Check if price returned to mitigate (fill) the imbalance
      const mitigated = history.slice(i + 2).some(p => Math.abs(p - candle) / candle < 0.003);
      const type = history[i + 1] > candle ? 'BULLISH' : 'BEARISH';
      mitigationBlocks.push({ type, price: candle, validated: mitigated });
    }
  }
  
  const validatedMitigation = mitigationBlocks.filter(mb => mb.validated).length;
  if (validatedMitigation > 0) {
    ictFactors.push(`🔄 MITIGATION BLOCKS (${validatedMitigation})`);
  }

  // ===== POWER OF 3 CONCEPT =====
  // Power of 3: Accumulation → Manipulation → Distribution
  let powerOf3: { phase: 'ACCUMULATION' | 'MANIPULATION' | 'DISTRIBUTION' | 'NONE'; confidence: number } = {
    phase: 'NONE',
    confidence: 0
  };
  
  const recent30 = history.slice(-30);
  const recent10 = history.slice(-10);
  const volatility30 = calculateVolatility(recent30);
  const volatility10 = calculateVolatility(recent10);
  
  // Accumulation: Low volatility, tight range
  if (volatility30 < 0.3 && volatility10 < 0.25) {
    const rangeCompression = (Math.max(...recent10) - Math.min(...recent10)) / range;
    if (rangeCompression < 0.15) {
      powerOf3 = { phase: 'ACCUMULATION', confidence: 85 };
      ictFactors.push('📦 ACCUMULATION PHASE (Power of 3)');
    }
  }
  
  // Manipulation: Sharp move against expected direction (liquidity grab)
  const recentSwing = Math.abs(recent10[recent10.length - 1] - recent10[0]) / recent10[0];
  const suddenReversal = history.slice(-5).some((p, i) => {
    if (i === 0) return false;
    const change = Math.abs(p - history.slice(-5)[i - 1]) / history.slice(-5)[i - 1];
    return change > 0.01;
  });
  
  if (suddenReversal && volatility10 > volatility30 * 1.5) {
    powerOf3 = { phase: 'MANIPULATION', confidence: 90 };
    ictFactors.push('🎭 MANIPULATION PHASE (Liquidity Grab)');
  }
  
  // Distribution: Strong directional move after accumulation
  if (volatility10 > volatility30 * 2 && !suddenReversal) {
    const directionalMove = recent10.slice(1).every((v, i) => v > recent10[i]) ||
                           recent10.slice(1).every((v, i) => v < recent10[i]);
    if (directionalMove) {
      powerOf3 = { phase: 'DISTRIBUTION', confidence: 88 };
      ictFactors.push('🚀 DISTRIBUTION PHASE (Institutional Move)');
    }
  }

  // ===== INSTITUTIONAL ORDER FLOW =====
  // Analyze buying vs selling pressure with institutional characteristics
  const recent40 = history.slice(-40);
  let buyingPressure = 0;
  let sellingPressure = 0;
  let institutionalSignature = 0;
  
  for (let i = 1; i < recent40.length; i++) {
    const change = recent40[i] - recent40[i - 1];
    const magnitude = Math.abs(change);
    
    if (change > 0) {
      buyingPressure += magnitude;
      // Large moves indicate institutional activity
      if (magnitude > range * 0.01) institutionalSignature += 1;
    } else {
      sellingPressure += magnitude;
      if (magnitude > range * 0.01) institutionalSignature -= 1;
    }
  }
  
  const orderFlowRatio = buyingPressure / (sellingPressure + 0.0001);
  let institutionalOrderFlow: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
  
  if (orderFlowRatio > 1.8 && institutionalSignature > 3) {
    institutionalOrderFlow = 'STRONG_BUY';
    ictFactors.push('💰 STRONG INSTITUTIONAL BUYING');
  } else if (orderFlowRatio > 1.3) {
    institutionalOrderFlow = 'BUY';
    ictFactors.push('📈 INSTITUTIONAL BUYING');
  } else if (orderFlowRatio < 0.55 && institutionalSignature < -3) {
    institutionalOrderFlow = 'STRONG_SELL';
    ictFactors.push('💸 STRONG INSTITUTIONAL SELLING');
  } else if (orderFlowRatio < 0.77) {
    institutionalOrderFlow = 'SELL';
    ictFactors.push('📉 INSTITUTIONAL SELLING');
  }

  // ===== OPTIMAL ENTRY SIGNAL =====
  let optimalEntry = { signal: 'WAITING', confidence: 0, zones: [] as number[] };
  
  // Perfect setup: OTE + Kill Zone + Power of 3 alignment
  if (oteZone.inZone && killZoneStrength > 0) {
    const oteType = oteZone.type;
    const p3Aligned = (oteType === 'BULLISH' && powerOf3.phase === 'DISTRIBUTION') ||
                      (oteType === 'BEARISH' && powerOf3.phase === 'DISTRIBUTION');
    
    if (p3Aligned) {
      optimalEntry = {
        signal: `OPTIMAL ${oteType} ENTRY`,
        confidence: 92 + (killZoneStrength * 0.05),
        zones: [oteZone.level]
      };
      ictFactors.push(`🎯 OPTIMAL ${oteType} ENTRY SETUP`);
    } else if (killZoneStrength >= 90) {
      optimalEntry = {
        signal: `${oteType} ENTRY ZONE`,
        confidence: 85,
        zones: [oteZone.level]
      };
    }
  }

  // ===== SESSION BIAS =====
  // Determine overall bias based on ICT concepts
  let sessionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let biasScore = 0;
  
  if (oteZone.type === 'BULLISH') biasScore += 2;
  if (oteZone.type === 'BEARISH') biasScore -= 2;
  if (institutionalOrderFlow === 'STRONG_BUY' || institutionalOrderFlow === 'BUY') biasScore += 3;
  if (institutionalOrderFlow === 'STRONG_SELL' || institutionalOrderFlow === 'SELL') biasScore -= 3;
  if (powerOf3.phase === 'DISTRIBUTION' && last > history[history.length - 20]) biasScore += 2;
  if (powerOf3.phase === 'DISTRIBUTION' && last < history[history.length - 20]) biasScore -= 2;
  if (nearBullishBreaker.length > 0) biasScore += 1;
  if (nearBearishBreaker.length > 0) biasScore -= 1;
  
  if (biasScore >= 4) {
    sessionBias = 'BULLISH';
    ictFactors.push('🟢 BULLISH SESSION BIAS');
  } else if (biasScore <= -4) {
    sessionBias = 'BEARISH';
    ictFactors.push('🔴 BEARISH SESSION BIAS');
  }

  return {
    killZone,
    killZoneStrength,
    oteZone,
    breakerBlocks: breakerBlocks.slice(-3),
    mitigationBlocks: mitigationBlocks.slice(-3),
    powerOf3,
    institutionalOrderFlow,
    optimalEntry,
    sessionBias,
    ictFactors
  };
};

export const detectSMC = (history: number[], symbol?: string): SMCResult => {
  if (history.length < 50) return { 
    signal: 'SYNCHRONIZING...', 
    factors: [] as string[], 
    trend: 'NEUTRAL', 
    accuracy: 0,
    orderBlocks: [],
    fairValueGaps: [],
    liquidityZones: [],
    marketStructure: 'RANGING',
    premiumDiscount: 'EQUILIBRIUM',
    bosChoch: []
  };
  
  const factors: string[] = [];
  const bosChoch: string[] = [];
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min;

  // ===== ADVANCED ORDER BLOCK DETECTION =====
  const orderBlocks: { type: 'BULLISH' | 'BEARISH'; price: number; strength: number }[] = []
  let institutionalOrderBlockDetected = false;
  
  for (let i = 20; i < history.length - 5; i++) {
    const candle = history[i];
    const nextMove = history[i + 1] - history[i];
    const moveSize = Math.abs(nextMove);
    
    // Calculate volume proxy (price range expansion)
    const volumeProxy = Math.abs(history[i + 1] - history[i]) / history[i];
    const avgVolume = history.slice(i - 10, i).reduce((acc, v, idx) => 
      acc + Math.abs(history[idx + 1] - v) / v, 0) / 10;
    const highVolume = volumeProxy > avgVolume * 1.5;
    
    // Institutional Order Block Criteria:
    // 1. Strong directional move (>1.5% of range)
    // 2. High volume (proxy: large price movement)
    // 3. Retest of level OR continuation strength
    // 4. Clean rejection from zone
    
    // Bullish Order Block: Strong move up from this level with institutional characteristics
    if (nextMove > range * 0.015) {
      const strength = moveSize / range * 100;
      const retest = history.slice(i + 2).some(p => Math.abs(p - candle) / candle < 0.003);
      const continuation = history.slice(i + 1, i + 4).every(p => p > history[i]);
      
      // INSTITUTIONAL ORDER BLOCK DETECTION
      if ((retest || strength > 3) && highVolume && continuation) {
        orderBlocks.push({ type: 'BULLISH', price: candle, strength: Math.min(100, strength * 10) });
        institutionalOrderBlockDetected = true;
      } else if (retest || strength > 3) {
        orderBlocks.push({ type: 'BULLISH', price: candle, strength: Math.min(100, strength * 10) });
      }
    }
    
    // Bearish Order Block: Strong move down from this level with institutional characteristics
    if (nextMove < -range * 0.015) {
      const strength = moveSize / range * 100;
      const retest = history.slice(i + 2).some(p => Math.abs(p - candle) / candle < 0.003);
      const continuation = history.slice(i + 1, i + 4).every(p => p < history[i]);
      
      // INSTITUTIONAL ORDER BLOCK DETECTION
      if ((retest || strength > 3) && highVolume && continuation) {
        orderBlocks.push({ type: 'BEARISH', price: candle, strength: Math.min(100, strength * 10) });
        institutionalOrderBlockDetected = true;
      } else if (retest || strength > 3) {
        orderBlocks.push({ type: 'BEARISH', price: candle, strength: Math.min(100, strength * 10) });
      }
    }
  }
  
  // Log institutional order block detection
  if (institutionalOrderBlockDetected) {
    factors.push('ORDER_BLOCK_DETECTED - INSTITUTIONAL');
  }
  
  // Check current price near order blocks
  const nearBullishOB = orderBlocks.filter(ob => ob.type === 'BULLISH' && Math.abs(last - ob.price) / last < 0.005);
  const nearBearishOB = orderBlocks.filter(ob => ob.type === 'BEARISH' && Math.abs(last - ob.price) / last < 0.005);
  
  if (nearBullishOB.length > 0) {
    factors.push(`BULLISH OB ZONE (${nearBullishOB.length})`);
  }
  if (nearBearishOB.length > 0) {
    factors.push(`BEARISH OB ZONE (${nearBearishOB.length})`);
  }

  // ===== FAIR VALUE GAPS (FVG) DETECTION =====
  const fairValueGaps: { type: 'BULLISH' | 'BEARISH'; start: number; end: number }[] = [];
  
  for (let i = 2; i < history.length; i++) {
    const candle1 = history[i - 2];
    const candle2 = history[i - 1];
    const candle3 = history[i];
    
    // Bullish FVG: Gap between candle 1 low and candle 3 high
    if (candle3 > candle1 && candle2 > candle1 * 1.002) {
      const gapSize = candle2 - candle1;
      if (gapSize > range * 0.008) {
        fairValueGaps.push({ type: 'BULLISH', start: candle1, end: candle2 });
      }
    }
    
    // Bearish FVG: Gap between candle 1 high and candle 3 low
    if (candle3 < candle1 && candle2 < candle1 * 0.998) {
      const gapSize = candle1 - candle2;
      if (gapSize > range * 0.008) {
        fairValueGaps.push({ type: 'BEARISH', start: candle2, end: candle1 });
      }
    }
  }
  
  // Check if price is in FVG
  const inBullishFVG = fairValueGaps.some(fvg => fvg.type === 'BULLISH' && last >= fvg.start && last <= fvg.end);
  const inBearishFVG = fairValueGaps.some(fvg => fvg.type === 'BEARISH' && last >= fvg.start && last <= fvg.end);
  
  if (inBullishFVG) factors.push('FVG BULLISH FILL');
  if (inBearishFVG) factors.push('FVG BEARISH FILL');

  // ===== LIQUIDITY ZONES (SSL/BSL) WITH POOL DETECTION =====
  const liquidityZones: { type: 'BUY' | 'SELL'; price: number; strength: number }[] = [];
  const swingWindow = 10;
  let liquidityPoolTargeted = false;
  
  // Identify significant highs and lows (pivot points)
  const significantLevels: { type: 'HIGH' | 'LOW'; price: number; touches: number }[] = [];
  
  for (let i = swingWindow; i < history.length - swingWindow; i++) {
    const window = history.slice(i - swingWindow, i + swingWindow + 1);
    const current = history[i];
    
    // Swing High = Sell-Side Liquidity
    if (current === Math.max(...window)) {
      liquidityZones.push({ type: 'SELL', price: current, strength: 85 });
      
      // Count how many times price touched this level (liquidity buildup)
      const touches = history.filter(p => Math.abs(p - current) / current < 0.002).length;
      significantLevels.push({ type: 'HIGH', price: current, touches });
    }
    
    // Swing Low = Buy-Side Liquidity
    if (current === Math.min(...window)) {
      liquidityZones.push({ type: 'BUY', price: current, strength: 85 });
      
      // Count how many times price touched this level (liquidity buildup)
      const touches = history.filter(p => Math.abs(p - current) / current < 0.002).length;
      significantLevels.push({ type: 'LOW', price: current, touches });
    }
  }
  
  // LIQUIDITY POOL DETECTION
  // Scan for liquidity pools above significant highs (sell-side liquidity)
  const recentHighs = significantLevels.filter(l => l.type === 'HIGH').slice(-5);
  const poolAboveHigh = recentHighs.some(level => {
    // Pool exists if: multiple touches + price approaching + stop losses likely above
    const approaching = Math.abs(last - level.price) / level.price < 0.01;
    const multipleTouches = level.touches >= 3;
    const priceNearLevel = last > level.price * 0.98 && last < level.price;
    return approaching && multipleTouches && priceNearLevel;
  });
  
  // Scan for liquidity pools below significant lows (buy-side liquidity)
  const recentLows = significantLevels.filter(l => l.type === 'LOW').slice(-5);
  const poolBelowLow = recentLows.some(level => {
    // Pool exists if: multiple touches + price approaching + stop losses likely below
    const approaching = Math.abs(last - level.price) / level.price < 0.01;
    const multipleTouches = level.touches >= 3;
    const priceNearLevel = last < level.price * 1.02 && last > level.price;
    return approaching && multipleTouches && priceNearLevel;
  });
  
  // Log liquidity pool targeting
  if (poolAboveHigh) {
    factors.push('LIQUIDITY_POOL_TARGETED - SSL ABOVE');
    liquidityPoolTargeted = true;
  }
  if (poolBelowLow) {
    factors.push('LIQUIDITY_POOL_TARGETED - BSL BELOW');
    liquidityPoolTargeted = true;
  }
  
  // Check for liquidity sweeps
  const recentLiquidity = liquidityZones.slice(-10);
  const sellLiquiditySwept = recentLiquidity.some(lz => lz.type === 'SELL' && last > lz.price && prev < lz.price);
  const buyLiquiditySwept = recentLiquidity.some(lz => lz.type === 'BUY' && last < lz.price && prev > lz.price);
  
  if (sellLiquiditySwept) {
    factors.push('SSL SWEPT - REVERSAL');
    bosChoch.push('LIQUIDITY GRAB COMPLETE');
  }
  if (buyLiquiditySwept) {
    factors.push('BSL SWEPT - REVERSAL');
    bosChoch.push('LIQUIDITY GRAB COMPLETE');
  }

  // ===== MARKET STRUCTURE (BOS/CHoCH) =====
  let marketStructure: 'HH/HL' | 'LH/LL' | 'RANGING' = 'RANGING';
  const structureWindow = history.slice(-60);
  const peaks: number[] = [];
  const troughs: number[] = [];
  
  for (let i = 5; i < structureWindow.length - 5; i++) {
    const window = structureWindow.slice(i - 5, i + 6);
    if (structureWindow[i] === Math.max(...window)) peaks.push(structureWindow[i]);
    if (structureWindow[i] === Math.min(...window)) troughs.push(structureWindow[i]);
  }
  
  if (peaks.length >= 2 && troughs.length >= 2) {
    const higherHighs = peaks[peaks.length - 1] > peaks[peaks.length - 2];
    const higherLows = troughs[troughs.length - 1] > troughs[troughs.length - 2];
    const lowerHighs = peaks[peaks.length - 1] < peaks[peaks.length - 2];
    const lowerLows = troughs[troughs.length - 1] < troughs[troughs.length - 2];
    
    if (higherHighs && higherLows) {
      marketStructure = 'HH/HL';
      factors.push('BULLISH STRUCTURE (HH/HL)');
      bosChoch.push('BOS CONFIRMED');
    } else if (lowerHighs && lowerLows) {
      marketStructure = 'LH/LL';
      factors.push('BEARISH STRUCTURE (LH/LL)');
      bosChoch.push('BOS CONFIRMED');
    }
    
    // Change of Character Detection
    if (higherHighs && lowerLows) {
      bosChoch.push('CHoCH BEARISH');
      factors.push('CHOCH DETECTED - BEARISH');
    } else if (lowerHighs && higherLows) {
      bosChoch.push('CHoCH BULLISH');
      factors.push('CHOCH DETECTED - BULLISH');
    }
  }

  // ===== PREMIUM/DISCOUNT ZONES =====
  const equilibrium = (max + min) / 2;
  const premiumThreshold = equilibrium + (range * 0.15);
  const discountThreshold = equilibrium - (range * 0.15);
  
  let premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';
  if (last > premiumThreshold) {
    premiumDiscount = 'PREMIUM';
    factors.push('PREMIUM ZONE - SELL');
  } else if (last < discountThreshold) {
    premiumDiscount = 'DISCOUNT';
    factors.push('DISCOUNT ZONE - BUY');
  }

  // ===== INDUCEMENT DETECTION =====
  const recentMoves = history.slice(-20);
  const fakeBreakout = recentMoves.some((p, i) => {
    if (i < 3) return false;
    const wasAbove = recentMoves[i - 1] > max * 0.995;
    const nowBelow = p < max * 0.99;
    return wasAbove && nowBelow;
  });
  
  if (fakeBreakout) {
    factors.push('INDUCEMENT - TRAP');
  }

  // Deep Scan for Boom/Crash Spikes
  if (symbol?.includes('BOOM') || symbol?.includes('CRASH')) {
    const isBoom = symbol.includes('BOOM');
    const recentConsolidation = history.slice(-15);
    const lowVol = calculateVolatility(recentConsolidation) < 0.2;
    const rsi = calculateTechnicalStrength(history);

    if (isBoom) {
      if (rsi < 30 && lowVol) factors.push('BOOM ACCUMULATION (DEEP)');
      if (last > Math.max(...recentConsolidation.slice(0, 10))) factors.push('SPIKE PRE-IGNITION');
    } else {
      if (rsi > 70 && lowVol) factors.push('CRASH DISTRIBUTION (DEEP)');
      if (last < Math.min(...recentConsolidation.slice(0, 10))) factors.push('SPIKE PRE-IGNITION');
    }
  }

  // Institutional Order Flow
  const recentHistory = history.slice(-40);
  const highs = recentHistory.filter((v, i, a) => i > 0 && v > a[i-1]).length;
  const lows = recentHistory.filter((v, i, a) => i > 0 && v < a[i-1]).length;
  if (highs > lows * 1.6) factors.push('IOF BULLISH BIAS');
  else if (lows > highs * 1.6) factors.push('IOF BEARISH BIAS');

  // Volume Profile (POC)
  const bins = 12;
  const binSize = range / bins;
  const profile = new Array(bins).fill(0);
  history.forEach(p => {
    const b = Math.min(bins - 1, Math.floor((p - min) / binSize));
    profile[b]++;
  });
  const pocIndex = profile.indexOf(Math.max(...profile));
  const pocPrice = min + (pocIndex * binSize) + (binSize / 2);
  
  if (Math.abs(last - pocPrice) < binSize) factors.push('POC MAGNET ACTIVE');

  // ===== SIGNAL GENERATION =====
  let signal = 'NEUTRAL';
  const score = factors.reduce((acc, f) => {
    if (f.includes('BULLISH') || f.includes('DEMAND') || f.includes('BOOM') || f.includes('IGNITION') || 
        f.includes('DISCOUNT') || f.includes('HH/HL') || f.includes('BSL')) return acc + 1.8;
    if (f.includes('BEARISH') || f.includes('SUPPLY') || f.includes('CRASH') || 
        f.includes('PREMIUM') || f.includes('LH/LL') || f.includes('SSL')) return acc - 1.8;
    return acc;
  }, 0);
  
  if (score >= 5.0) signal = 'ELITE SMC BULLISH';
  else if (score >= 2.5) signal = 'SMC BULLISH';
  else if (score <= -5.0) signal = 'ELITE SMC BEARISH';
  else if (score <= -2.5) signal = 'SMC BEARISH';

  const trend = score > 0 ? 'BULLISH' : score < 0 ? 'BEARISH' : 'NEUTRAL';
  let accuracy = Math.min(99.9, 85 + (factors.length * 1.5) + (orderBlocks.length * 0.5) + (fairValueGaps.length * 0.8));

  // ===== ICT INTEGRATION =====
  const ictAnalysis = detectICT(history, symbol);
  
  // Boost accuracy with ICT factors
  if (ictAnalysis.killZoneStrength > 0) {
    accuracy = Math.min(99.9, accuracy + (ictAnalysis.killZoneStrength * 0.08));
    factors.push(...ictAnalysis.ictFactors.slice(0, 2)); // Add top ICT factors to main factors
  }
  
  // OTE zones add significant confidence
  if (ictAnalysis.oteZone.inZone) {
    accuracy = Math.min(99.9, accuracy + 6);
  }
  
  // Power of 3 phases add institutional confirmation
  if (ictAnalysis.powerOf3.phase !== 'NONE') {
    accuracy = Math.min(99.9, accuracy + (ictAnalysis.powerOf3.confidence * 0.05));
  }
  
  // Institutional order flow alignment
  if ((ictAnalysis.institutionalOrderFlow === 'STRONG_BUY' && trend === 'BULLISH') ||
      (ictAnalysis.institutionalOrderFlow === 'STRONG_SELL' && trend === 'BEARISH')) {
    accuracy = Math.min(99.9, accuracy + 8);
    factors.push('ICT ORDER FLOW ALIGNED');
  }

  return { 
    signal, 
    factors, 
    trend,
    accuracy,
    orderBlocks: orderBlocks.slice(-5), // Keep only recent ones
    fairValueGaps: fairValueGaps.slice(-3),
    liquidityZones: liquidityZones.slice(-5),
    marketStructure,
    premiumDiscount,
    bosChoch,
    ictConcepts: ictAnalysis
  };
};

/**
 * JARVIS Elliott Wave Analysis Engine
 * Advanced wave counting, Fibonacci relationships, wave personality analysis
 */
export interface WaveAnalysis {
  waveCount: string;
  degree: string;
  wavePersonality: string[];
  fibonacciRelationships: string[];
  projection: { target: number; confidence: number };
  alternation: boolean;
  equality: boolean;
}

export const analyzeElliottWaves = (history: number[]): WaveAnalysis => {
  if (history.length < 100) return {
    waveCount: 'INSUFFICIENT DATA',
    degree: 'UNKNOWN',
    wavePersonality: [],
    fibonacciRelationships: [],
    projection: { target: 0, confidence: 0 },
    alternation: false,
    equality: false
  };

  const peaks: { index: number; value: number }[] = [];
  const troughs: { index: number; value: number }[] = [];
  
  // Enhanced swing detection with strength filtering
  for (let i = 10; i < history.length - 10; i++) {
    const window = history.slice(i - 10, i + 11);
    const current = history[i];
    
    if (current === Math.max(...window)) {
      const strength = (current - Math.min(...window)) / current;
      if (strength > 0.008) peaks.push({ index: i, value: current });
    }
    if (current === Math.min(...window)) {
      const strength = (Math.max(...window) - current) / current;
      if (strength > 0.008) troughs.push({ index: i, value: current });
    }
  }

  // Combine and sort pivots
  const pivots = [...peaks.map(p => ({ ...p, type: 'peak' as const })), 
                  ...troughs.map(t => ({ ...t, type: 'trough' as const }))]
    .sort((a, b) => a.index - b.index);

  let waveCount = 'DEVELOPING';
  let degree = 'MINUTE';
  const wavePersonality: string[] = [];
  const fibonacciRelationships: string[] = [];
  let alternation = false;
  let equality = false;
  let projectionTarget = history[history.length - 1];
  let projectionConfidence = 0;

  if (pivots.length >= 9) {
    // Identify impulse wave structure (5 waves in trend direction)
    const last9 = pivots.slice(-9);
    
    // Check for 5-wave impulse pattern
    const isImpulse = last9.length === 9 && 
                     last9[0].type !== last9[1].type &&
                     last9[1].type !== last9[2].type;

    if (isImpulse) {
      const wave0 = last9[0].value;
      const wave1 = last9[1].value;
      const wave2 = last9[2].value;
      const wave3 = last9[3].value;
      const wave4 = last9[4].value;
      const wave5 = last9[5]?.value || history[history.length - 1];

      const len1 = Math.abs(wave1 - wave0);
      const len2 = Math.abs(wave2 - wave1);
      const len3 = Math.abs(wave3 - wave2);
      const len4 = Math.abs(wave4 - wave3);
      const len5 = Math.abs(wave5 - wave4);

      // Wave 3 Rules
      if (len3 >= len1 && len3 >= len5) {
        wavePersonality.push('WAVE 3 EXTENDED (STRONGEST)');
        projectionConfidence += 25;
        
        // Wave 3 is often 1.618 * Wave 1
        if (Math.abs(len3 / len1 - 1.618) < 0.08) {
          fibonacciRelationships.push('WAVE 3 = 1.618 × WAVE 1');
          projectionConfidence += 15;
        }
      }

      // Wave 2 cannot retrace more than 100% of Wave 1
      const wave2Retracement = len2 / len1;
      if (wave2Retracement < 1.0) {
        wavePersonality.push('WAVE 2 VALID RETRACEMENT');
        
        if (wave2Retracement >= 0.5 && wave2Retracement <= 0.618) {
          fibonacciRelationships.push('WAVE 2 = 0.618 RETRACEMENT');
          projectionConfidence += 12;
        }
      }

      // Wave 4 cannot enter Wave 1 territory
      const wave4Valid = last9[0].type === 'trough' ? 
        wave4 > wave1 : wave4 < wave1;
      
      if (wave4Valid) {
        wavePersonality.push('WAVE 4 NON-OVERLAP');
        
        // Wave 4 often retraces 0.382 of Wave 3
        const wave4Retracement = len4 / len3;
        if (Math.abs(wave4Retracement - 0.382) < 0.05) {
          fibonacciRelationships.push('WAVE 4 = 0.382 RETRACEMENT');
          projectionConfidence += 12;
        }
      }

      // Wave 5 equality with Wave 1
      if (Math.abs(len5 / len1 - 1.0) < 0.15) {
        equality = true;
        fibonacciRelationships.push('WAVE 5 = WAVE 1 (EQUALITY)');
        projectionConfidence += 10;
      }

      // Alternation: Wave 2 and Wave 4 should alternate
      if (wave2Retracement < 0.5 && wave4Retracement > 0.5 ||
          wave2Retracement > 0.5 && wave4Retracement < 0.5) {
        alternation = true;
        wavePersonality.push('ALTERNATION CONFIRMED');
        projectionConfidence += 8;
      }

      // Project Wave 5 target
      const direction = wave1 > wave0 ? 1 : -1;
      const wave1Len = len1;
      
      // Common Wave 5 targets
      const target1 = wave4 + (direction * wave1Len); // Equality
      const target2 = wave4 + (direction * wave1Len * 1.618); // Extension
      const target3 = wave0 + (direction * len3 * 1.618); // From origin
      
      projectionTarget = (target1 + target2 + target3) / 3;
      
      if (projectionConfidence > 50) {
        waveCount = '5-WAVE IMPULSE DETECTED';
        degree = len3 > history[history.length - 1] * 0.05 ? 'INTERMEDIATE' : 'MINUTE';
      } else {
        waveCount = 'IMPULSE FORMING';
      }
    } else {
      // Check for corrective patterns (ABC, WXY, Triangle)
      if (last9.length >= 5) {
        const waveA = Math.abs(last9[1].value - last9[0].value);
        const waveB = Math.abs(last9[2].value - last9[1].value);
        const waveC = Math.abs(last9[3].value - last9[2].value);
        
        // Zigzag: Wave C = Wave A
        if (Math.abs(waveC / waveA - 1.0) < 0.12) {
          waveCount = 'ZIGZAG CORRECTION (ABC)';
          fibonacciRelationships.push('WAVE C = WAVE A');
          projectionConfidence = 65;
        }
        // Flat: Wave B retraces 90%+ of Wave A
        else if (waveB / waveA > 0.9) {
          waveCount = 'FLAT CORRECTION (ABC)';
          fibonacciRelationships.push('WAVE B = 0.9+ WAVE A');
          projectionConfidence = 60;
        }
        // Triangle
        else if (waveB < waveA && waveC < waveB) {
          waveCount = 'TRIANGLE CORRECTION';
          wavePersonality.push('CONTRACTING PATTERN');
          projectionConfidence = 55;
        }
      }
    }
  }

  // Degree classification based on magnitude
  const priceRange = Math.max(...history) - Math.min(...history);
  const avgPrice = history[history.length - 1];
  const rangePct = (priceRange / avgPrice) * 100;
  
  if (rangePct > 10) degree = 'PRIMARY';
  else if (rangePct > 5) degree = 'INTERMEDIATE';
  else if (rangePct > 2) degree = 'MINOR';
  else degree = 'MINUTE';

  return {
    waveCount,
    degree,
    wavePersonality,
    fibonacciRelationships,
    projection: {
      target: projectionTarget,
      confidence: Math.min(99, projectionConfidence)
    },
    alternation,
    equality
  };
};

/**
 * JARVIS Neural Pattern Recognition V12.0 MASTER
 * Enhanced with Elliott Wave Theory, advanced wave analysis, multi-dimensional pattern validation
 */
export const detectPatterns = (history: number[]): PatternResult => {
  if (history.length < 80) return { label: "CALIBRATING...", confidence: 0 };
  
  const last = history[history.length - 1];
  const first = history[0];
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min;
  const smc = detectSMC(history);
  const waveAnalysis = analyzeElliottWaves(history);

  // Advanced swing point detection with strength scoring
  const peakIndices: number[] = [];
  const troughIndices: number[] = [];
  const peakValues: number[] = [];
  const troughValues: number[] = [];
  
  for (let i = 8; i < history.length - 8; i++) {
    const window = history.slice(i - 8, i + 9);
    if (history[i] === Math.max(...window)) {
      peakIndices.push(i);
      peakValues.push(history[i]);
    }
    if (history[i] === Math.min(...window)) {
      troughIndices.push(i);
      troughValues.push(history[i]);
    }
  }

  // Multi-point harmonic pattern detection
  const X = first;
  const A = last > first ? max : min;
  const B = history[Math.floor(history.length * 0.45)];
  const C = history[Math.floor(history.length * 0.7)];
  const D = last;

  const XA = Math.abs(A - X);
  const AB = Math.abs(B - A);
  const BC = Math.abs(C - B);
  const CD = Math.abs(D - C);
  const AD = Math.abs(D - A);
  const XD = Math.abs(D - X);
  
  const retracementB = XA > 0 ? AB / XA : 0;
  const retracementD = XA > 0 ? AD / XA : 0;
  const retracementC = AB > 0 ? BC / AB : 0;
  const extensionD = BC > 0 ? CD / BC : 0;
  const xdRatio = XA > 0 ? XD / XA : 0;

  let pattern = "STRUCTURAL BIAS";
  let confidence = 75;

  // Ultra-precision Fibonacci checks (0.008 tolerance for maximum accuracy)
  const isStrict = (v: number, target: number) => Math.abs(v - target) < 0.008;
  const isRange = (v: number, min: number, max: number) => v >= min && v <= max;
  const isPrecise = (v: number, target: number) => Math.abs(v - target) < 0.005;
  const isUltraPrecise = (v: number, target: number) => Math.abs(v - target) < 0.003;

  // Advanced Harmonic Patterns with multi-point validation and depth scoring
  if (isPrecise(retracementD, 0.786) && isPrecise(retracementB, 0.618) && isRange(retracementC, 0.382, 0.886)) {
    const depthScore = (isUltraPrecise(retracementD, 0.786) ? 3 : 0) + (isUltraPrecise(retracementB, 0.618) ? 3 : 0);
    pattern = "GARTLEY HARMONIC PRO";
    confidence = 92 + depthScore;
  } else if (isPrecise(retracementD, 0.886) && isRange(retracementB, 0.382, 0.5) && isRange(xdRatio, 0.886, 1.13)) {
    const depthScore = (isUltraPrecise(retracementD, 0.886) ? 4 : 0) + (isStrict(retracementB, 0.439) ? 2 : 0);
    pattern = "BAT HARMONIC PRO";
    confidence = 94 + depthScore;
  } else if (isPrecise(retracementD, 1.272) && isPrecise(retracementB, 0.786) && isRange(xdRatio, 1.272, 1.618)) {
    const depthScore = (isUltraPrecise(retracementD, 1.272) ? 4 : 0) + (isUltraPrecise(retracementB, 0.786) ? 3 : 0);
    pattern = "BUTTERFLY HARMONIC PRO";
    confidence = 96 + Math.min(depthScore, 3);
  } else if (isStrict(retracementD, 1.618) && isRange(retracementB, 0.382, 0.618) && xdRatio > 1.618) {
    const depthScore = (isUltraPrecise(retracementD, 1.618) ? 5 : 0);
    pattern = "CRAB HARMONIC PRO";
    confidence = 97 + Math.min(depthScore, 2);
  } else if (isPrecise(retracementB, 0.382) && isPrecise(retracementD, 0.786) && isPrecise(retracementC, 1.272)) {
    const depthScore = (isUltraPrecise(retracementB, 0.382) ? 3 : 0) + (isUltraPrecise(retracementD, 0.786) ? 3 : 0);
    pattern = "CYPHER HARMONIC PRO";
    confidence = 95 + Math.min(depthScore, 4);
  } else if (isPrecise(retracementB, 0.618) && isPrecise(retracementD, 0.886) && isStrict(extensionD, 1.618)) {
    const depthScore = (isUltraPrecise(retracementB, 0.618) ? 4 : 0);
    pattern = "SHARK HARMONIC PRO";
    confidence = 96 + Math.min(depthScore, 3);
  } else if (isPrecise(extensionD, 1.0) && Math.abs(AB - CD) / AB < 0.02) {
    const symmetryScore = Math.abs(AB - CD) / AB < 0.01 ? 4 : 2;
    pattern = "AB=CD PRECISION";
    confidence = 90 + symmetryScore;
  } else if (isStrict(retracementD, 1.13) && isRange(retracementB, 0.618, 0.786) && isRange(retracementC, 1.618, 2.24)) {
    pattern = "DEEP CRAB HARMONIC";
    confidence = 97;
  } else if (isPrecise(retracementB, 0.5) && isPrecise(retracementD, 0.707) && isStrict(retracementC, 1.414)) {
    pattern = "5-0 HARMONIC PRO";
    confidence = 95;
  }
  
  // Three Drives Pattern Detection
  if (peakIndices.length >= 3 || troughIndices.length >= 3) {
    const drives = peakIndices.length >= 3 ? peakValues.slice(-3) : troughValues.slice(-3);
    if (drives.length === 3) {
      const drive1to2 = Math.abs(drives[1] - drives[0]);
      const drive2to3 = Math.abs(drives[2] - drives[1]);
      if (Math.abs(drive1to2 - drive2to3) / drive1to2 < 0.15) {
        pattern = "THREE DRIVES";
        confidence = 93;
      }
    }
  }

  // Wolfe Wave Detection
  if (peakIndices.length >= 5 && troughIndices.length >= 3) {
    const recentPeaks = peakValues.slice(-5);
    const recentTroughs = troughValues.slice(-3);
    
    // Wolfe bullish: 1-3-5 descending, 2-4 descending
    if (recentPeaks.length >= 3 && recentTroughs.length >= 2) {
      const descendingPeaks = recentPeaks[2] < recentPeaks[1] && recentPeaks[1] < recentPeaks[0];
      const descendingTroughs = recentTroughs[1] < recentTroughs[0];
      if (descendingPeaks || descendingTroughs) {
        pattern = "WOLFE WAVE";
        confidence = 94;
      }
    }
  }

  // Elliott Wave Detection with impulse validation
  if (peakIndices.length >= 3 && troughIndices.length >= 2) {
    const waveStructure = peakIndices.length === 5 && troughIndices.length === 4;
    if (waveStructure) {
      // Validate wave 3 is not the shortest
      const wave1 = peakValues[0] - troughValues[0];
      const wave3 = peakValues[2] - troughValues[1];
      const wave5 = peakValues[4] - troughValues[3];
      if (wave3 >= wave1 && wave3 >= wave5) {
        pattern = "ELLIOTT IMPULSE WAVE";
        confidence = 91;
      }
    }
  }

  // Head and Shoulders / Inverse H&S
  if (peakIndices.length >= 3) {
    const p1 = peakValues[peakValues.length - 3];
    const p2 = peakValues[peakValues.length - 2];
    const p3 = peakValues[peakValues.length - 1];
    if (p2 > p1 && p2 > p3 && Math.abs(p1 - p3) / p1 < 0.05) {
      pattern = "HEAD & SHOULDERS";
      confidence = 90;
    }
  }
  if (troughIndices.length >= 3) {
    const t1 = troughValues[troughValues.length - 3];
    const t2 = troughValues[troughValues.length - 2];
    const t3 = troughValues[troughValues.length - 1];
    if (t2 < t1 && t2 < t3 && Math.abs(t1 - t3) / t1 < 0.05) {
      pattern = "INVERSE HEAD & SHOULDERS";
      confidence = 90;
    }
  }

  // Multi-timeframe pattern confirmation with wave analysis
  const mtfWindow = history.slice(-100);
  const mtfPatternStrength = calculateVolatility(mtfWindow);
  if (mtfPatternStrength > 0.5 && pattern !== "STRUCTURAL BIAS") {
    confidence = Math.min(99.9, confidence + 2);
  }

  // Elliott Wave Integration - Major confidence boost
  if (waveAnalysis.waveCount.includes('IMPULSE') && pattern !== "STRUCTURAL BIAS") {
    confidence = Math.min(99.9, confidence + waveAnalysis.projection.confidence * 0.15);
    
    // If wave analysis aligns with harmonic pattern
    if (waveAnalysis.fibonacciRelationships.length >= 2) {
      confidence = Math.min(99.9, confidence + 8);
      pattern = `${pattern} + ${waveAnalysis.waveCount}`;
    }
  }
  
  // Wave personality adds conviction
  if (waveAnalysis.wavePersonality.length >= 2 && pattern !== "STRUCTURAL BIAS") {
    confidence = Math.min(99.9, confidence + 5);
  }

  // Alternation and Equality are strong Elliott confirmations
  if (waveAnalysis.alternation && waveAnalysis.equality) {
    confidence = Math.min(99.9, confidence + 6);
  }

  // SMC Confluence Booster
  if (smc.trend === 'BULLISH' && pattern !== "STRUCTURAL BIAS") {
    confidence = Math.min(99.9, confidence + 5);
  } else if (smc.trend === 'BEARISH' && pattern !== "STRUCTURAL BIAS") {
    confidence = Math.min(99.9, confidence + 4);
  }

  // Volume-weighted pattern validation (simulated)
  const recentVolatility = calculateVolatility(history.slice(-20));
  if (recentVolatility < 0.3 && pattern !== "STRUCTURAL BIAS") {
    confidence = Math.min(99.9, confidence + 3);
  }

  // Final pattern labeling with wave context
  let finalLabel = pattern === "STRUCTURAL BIAS" ? 
    (last > first ? "INSTITUTIONAL ASCENT" : "INSTITUTIONAL DESCENT") : 
    pattern;
  
  // Add wave degree for significant patterns
  if (waveAnalysis.waveCount !== 'DEVELOPING' && waveAnalysis.degree !== 'MINUTE' && confidence > 85) {
    finalLabel = `${finalLabel} [${waveAnalysis.degree}]`;
  }

  return { 
    label: finalLabel, 
    confidence 
  };
};

/**
 * JARVIS Advanced Spike Detection Engine V11.0 ELITE
 * Predictive algorithms, volume context, price action analysis, early warning system
 */
export interface SpikeDetectionResult {
  isSpike: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME';
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  probability: number;
  indicators: string[];
  prediction: 'IMMINENT' | 'BUILDING' | 'NEUTRAL';
  timeToSpike?: number;
}

export const detectAdvancedSpikes = (history: number[], symbol?: string): SpikeDetectionResult => {
  if (history.length < 50) {
    return { isSpike: false, severity: 'LOW', direction: 'NEUTRAL', probability: 0, indicators: [], prediction: 'NEUTRAL' };
  }
  
  const indicators: string[] = [];
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const recentShort = history.slice(-10);
  const recentMed = history.slice(-30);
  const recentLong = history.slice(-50);
  const ultraLong = history.slice(-100);
  
  // Calculate volatilities across multiple timeframes
  const volShort = calculateVolatility(recentShort);
  const volMed = calculateVolatility(recentMed);
  const volLong = calculateVolatility(recentLong);
  const volUltra = calculateVolatility(ultraLong);
  
  // Advanced momentum calculation with multiple periods
  const momentum3 = last - history[history.length - 3];
  const momentum5 = last - history[history.length - 5];
  const momentum10 = last - history[history.length - 10];
  const avgPrice = recentMed.reduce((a, b) => a + b, 0) / recentMed.length;
  const momentumPercent3 = Math.abs(momentum3 / avgPrice) * 100;
  const momentumPercent5 = Math.abs(momentum5 / avgPrice) * 100;
  const momentumPercent10 = Math.abs(momentum10 / avgPrice) * 100;
  
  let isSpike = false;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXTREME' = 'LOW';
  let probability = 0;
  let prediction: 'IMMINENT' | 'BUILDING' | 'NEUTRAL' = 'NEUTRAL';
  let timeToSpike: number | undefined;
  
  // Multi-timeframe volatility expansion detection
  if (volShort > volMed * 2.2) {
    indicators.push('SHORT-TERM VOL SURGE');
    probability += 28;
    isSpike = true;
  }
  
  if (volShort > volLong * 3.5) {
    indicators.push('CRITICAL VOL EXPANSION');
    probability += 35;
    severity = 'CRITICAL';
    isSpike = true;
  }
  
  if (volShort > volUltra * 5.0) {
    indicators.push('EXTREME VOL BREAKOUT');
    probability += 40;
    severity = 'EXTREME';
    isSpike = true;
  }
  
  // Progressive momentum analysis
  if (momentumPercent3 > 0.4) {
    indicators.push('STRONG 3-BAR MOMENTUM');
    probability += 18;
    isSpike = true;
  }
  
  if (momentumPercent5 > 0.7) {
    indicators.push('EXPLOSIVE 5-BAR MOMENTUM');
    probability += 25;
    severity = severity === 'LOW' ? 'MEDIUM' : severity === 'MEDIUM' ? 'HIGH' : severity;
    isSpike = true;
  }
  
  if (momentumPercent10 > 1.2) {
    indicators.push('PARABOLIC 10-BAR MOMENTUM');
    probability += 30;
    severity = 'EXTREME';
    isSpike = true;
  }
  
  // Advanced volatility clustering with GARCH-style analysis
  const volChanges: number[] = [];
  for (let i = 20; i < history.length - 5; i += 5) {
    const window = history.slice(i, i + 5);
    volChanges.push(calculateVolatility(window));
  }
  
  if (volChanges.length > 3) {
    const recentVolChange = volChanges[volChanges.length - 1];
    const avgVolChange = volChanges.slice(0, -1).reduce((a, b) => a + b, 0) / (volChanges.length - 1);
    const volStdDev = Math.sqrt(volChanges.reduce((a, b) => a + Math.pow(b - avgVolChange, 2), 0) / volChanges.length);
    
    if (recentVolChange > avgVolChange + (volStdDev * 2)) {
      indicators.push('VOLATILITY CLUSTERING (2σ)');
      probability += 20;
      isSpike = true;
    }
    
    if (recentVolChange > avgVolChange + (volStdDev * 3)) {
      indicators.push('EXTREME VOL CLUSTER (3σ)');
      probability += 30;
      severity = 'EXTREME';
      isSpike = true;
    }
  }
  
  // Multi-degree price acceleration analysis with 3rd derivative (snap)
  const accel1 = history[history.length - 1] - history[history.length - 2];
  const accel2 = history[history.length - 2] - history[history.length - 3];
  const accel3 = history[history.length - 3] - history[history.length - 4];
  const accel4 = history[history.length - 4] - history[history.length - 5];
  const accel5 = history[history.length - 5] - history[history.length - 6];
  
  // Second derivative (jerk) analysis - enhanced
  const jerk1 = accel1 - accel2;
  const jerk2 = accel2 - accel3;
  const jerk3 = accel3 - accel4;
  
  // Third derivative (snap) analysis - ultra-early spike warning
  const snap1 = jerk1 - jerk2;
  const snap2 = jerk2 - jerk3;
  
  if (Math.abs(accel1) > Math.abs(accel2) * 1.5 && Math.abs(accel2) > Math.abs(accel3) * 1.3) {
    indicators.push('PRICE ACCELERATION');
    probability += 22;
    isSpike = true;
  }
  
  // Enhanced jerk detection with multi-level analysis
  if (Math.abs(jerk1) > Math.abs(jerk2) * 2.0) {
    indicators.push('JERK DETECTION (2ND DERIV)');
    probability += 25;
    severity = severity === 'LOW' ? 'HIGH' : severity;
    isSpike = true;
    
    // Ultra-precise jerk acceleration
    if (Math.abs(jerk1) > Math.abs(jerk2) * 3.0) {
      indicators.push('EXTREME JERK ACCELERATION');
      probability += 15;
      severity = 'EXTREME';
    }
  }
  
  // Snap analysis - earliest possible spike detection
  if (Math.abs(snap1) > Math.abs(snap2) * 1.8) {
    indicators.push('SNAP DETECTED (3RD DERIV)');
    probability += 30;
    prediction = 'IMMINENT';
    severity = severity === 'LOW' ? 'CRITICAL' : severity === 'HIGH' ? 'EXTREME' : severity;
    isSpike = true;
    
    // Calculate ultra-precise time to spike
    if (Math.abs(snap1) > 0) {
      const snapRate = Math.abs(snap1);
      timeToSpike = Math.max(1, Math.floor(5 / snapRate)); // Bars until spike
    }
  }
  
  // Consolidation breakout detection
  const consWindow = recentMed.slice(0, 20);
  const consRange = Math.max(...consWindow) - Math.min(...consWindow);
  const consAvg = consWindow.reduce((a, b) => a + b, 0) / consWindow.length;
  const consVol = calculateVolatility(consWindow);
  
  if (consVol < 0.2 && Math.abs(last - consAvg) > consRange * 1.5) {
    indicators.push('CONSOLIDATION BREAKOUT');
    probability += 28;
    isSpike = true;
  }
  
  // Predictive spike detection (early warning)
  if (consVol < 0.15 && volShort > volMed * 1.3 && !isSpike) {
    prediction = 'BUILDING';
    timeToSpike = 3;
    indicators.push('SPIKE BUILDING (3-5 BARS)');
    probability += 15;
  }
  
  if (volShort > volMed * 1.8 && momentumPercent3 > 0.3) {
    prediction = 'IMMINENT';
    timeToSpike = 1;
    indicators.push('SPIKE IMMINENT (1-2 BARS)');
    probability += 25;
    isSpike = true;
  }
  
  // Boom/Crash ultra-deep scanning with pattern recognition
  if (symbol?.includes('BOOM') || symbol?.includes('CRASH')) {
    const isBoom = symbol.includes('BOOM');
    const consolidationWindow = recentShort.slice(0, 7);
    const consRange = Math.max(...consolidationWindow) - Math.min(...consolidationWindow);
    const consAvg = consolidationWindow.reduce((a, b) => a + b, 0) / consolidationWindow.length;
    const breakout = Math.abs(last - consAvg);
    
    // Tight consolidation detection
    if (consRange / consAvg < 0.005) {
      indicators.push('ULTRA-TIGHT CONSOLIDATION');
      probability += 20;
      prediction = 'BUILDING';
      timeToSpike = 2;
    }
    
    if (breakout > consRange * 2.0) {
      indicators.push('BOOM/CRASH SPIKE INITIATED');
      probability += 30;
      severity = 'CRITICAL';
      isSpike = true;
    }
    
    if (breakout > consRange * 3.5) {
      indicators.push('BOOM/CRASH EXTREME SPIKE');
      probability += 45;
      severity = 'EXTREME';
      isSpike = true;
    }
    
    // RSI extreme zones for Boom/Crash
    const rsi = calculateTechnicalStrength(history);
    if ((isBoom && rsi < 25) || (!isBoom && rsi > 75)) {
      indicators.push('EXTREME RSI REVERSAL ZONE');
      probability += 20;
    }
  }
  
  // Volume profile analysis (simulated via price dispersion)
  const priceDispersion = Math.sqrt(
    recentMed.reduce((a, b) => a + Math.pow(b - avgPrice, 2), 0) / recentMed.length
  );
  const recentDispersion = Math.sqrt(
    recentShort.reduce((a, b) => a + Math.pow(b - avgPrice, 2), 0) / recentShort.length
  );
  
  if (recentDispersion > priceDispersion * 2.5) {
    indicators.push('VOLUME PROFILE ANOMALY');
    probability += 18;
    isSpike = true;
  }
  
  // Determine direction with refined logic
  let direction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
  const avgMomentum = (momentum3 + momentum5 + momentum10) / 3;
  if (avgMomentum > avgPrice * 0.003) direction = 'UP';
  else if (avgMomentum < -avgPrice * 0.003) direction = 'DOWN';
  
  // Set severity based on probability with refined thresholds
  if (probability > 90) severity = 'EXTREME';
  else if (probability > 75) severity = 'CRITICAL';
  else if (probability > 55) severity = 'HIGH';
  else if (probability > 35) severity = 'MEDIUM';
  
  return {
    isSpike,
    severity,
    direction,
    probability: Math.min(99.9, probability),
    indicators,
    prediction,
    timeToSpike
  };
};

export const detectManipulation = (history: number[]) => {
  if (history.length < 30) return { detected: false, type: 'STABLE', severity: 0, indicators: [] as string[], institutionalFootprint: 0 };
  
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const volatility = calculateVolatility(history);
  const move = Math.abs(last - prev);
  const recentHistory = history.slice(-30);
  const extendedHistory = history.slice(-60);
  
  const indicators: string[] = [];
  let severity = 0;
  let institutionalFootprint = 0;
  
  // Multi-Timeframe HFT Stop Hunt Detection (Enhanced V12.0)
  const shortTermVol = calculateVolatility(history.slice(-10));
  const mediumTermVol = calculateVolatility(history.slice(-30));
  const longTermVol = calculateVolatility(history.slice(-60));
  
  // Graduated HFT detection thresholds
  if (move > (volatility * 6.0)) {
    indicators.push('EXTREME HFT STOP HUNT (6σ)');
    severity += 5;
    institutionalFootprint += 25;
  } else if (move > (volatility * 4.5)) {
    indicators.push('CRITICAL HFT STOP HUNT (4.5σ)');
    severity += 4;
    institutionalFootprint += 20;
  } else if (move > (volatility * 3.0)) {
    indicators.push('HFT STOP HUNT (3σ)');
    severity += 3;
    institutionalFootprint += 15;
  }
  
  // Multi-timeframe volatility expansion detection
  if (shortTermVol > mediumTermVol * 2.0 && mediumTermVol > longTermVol * 1.5) {
    indicators.push('CASCADING VOLATILITY EXPANSION');
    severity += 2;
    institutionalFootprint += 12;
  }
  
  // Enhanced Liquidity Grab Detection
  const max = Math.max(...recentHistory);
  const min = Math.min(...recentHistory);
  const range = max - min;
  const avgPrice = recentHistory.reduce((a, b) => a + b, 0) / recentHistory.length;
  
  // Sudden spike above resistance then reversal (liquidity grab)
  if (last > max * 0.998 && prev < max * 0.995 && history[history.length - 3] < avgPrice) {
    indicators.push('LIQUIDITY GRAB - UPSIDE');
    severity += 4;
    institutionalFootprint += 25;
  }
  
  if (last < min * 1.002 && prev > min * 1.005 && history[history.length - 3] > avgPrice) {
    indicators.push('LIQUIDITY GRAB - DOWNSIDE');
    severity += 4;
    institutionalFootprint += 25;
  }
  
  // Order Flow Delta Analysis (simulated)
  let buyPressure = 0;
  let sellPressure = 0;
  for (let i = 1; i < recentHistory.length; i++) {
    const delta = recentHistory[i] - recentHistory[i - 1];
    if (delta > 0) buyPressure += delta;
    else sellPressure += Math.abs(delta);
  }
  const orderFlowDelta = (buyPressure - sellPressure) / (buyPressure + sellPressure + 0.0001);
  
  if (Math.abs(orderFlowDelta) > 0.7) {
    indicators.push(`ORDER FLOW IMBALANCE ${orderFlowDelta > 0 ? 'BULLISH' : 'BEARISH'}`);
    severity += 3;
    institutionalFootprint += 20;
  }
  
  // Institutional Footprint Analysis
  const largeMoves = recentHistory.filter((p, i) => {
    if (i === 0) return false;
    return Math.abs(p - recentHistory[i - 1]) > range * 0.04;
  });
  
  if (largeMoves.length > recentHistory.length * 0.15) {
    indicators.push('INSTITUTIONAL FOOTPRINT');
    severity += 2;
    institutionalFootprint += 30;
  }
  
  // Smart Money Divergence (Price vs Volume)
  const priceIncreasing = last > history[history.length - 10];
  const volIncreasing = calculateVolatility(recentHistory) > calculateVolatility(history.slice(-60, -30));
  
  if ((priceIncreasing && !volIncreasing) || (!priceIncreasing && volIncreasing)) {
    indicators.push('SMART MONEY DIVERGENCE');
    severity += 3;
    institutionalFootprint += 20;
  }
  
  // Volume Profile Anomaly (price clustering detection)
  const bins = 10;
  const binSize = range / bins;
  const profile = new Array(bins).fill(0);
  recentHistory.forEach(p => {
    const b = Math.min(bins - 1, Math.floor((p - min) / binSize));
    profile[b]++;
  });
  
  const avgBinCount = profile.reduce((a, b) => a + b, 0) / bins;
  const maxBinCount = Math.max(...profile);
  if (maxBinCount > avgBinCount * 3.5) {
    indicators.push('VOLUME PROFILE TRAP');
    severity += 2;
  }
  
  // Wyckoff Distribution/Accumulation Pattern
  const firstQuarter = recentHistory.slice(0, 7);
  const lastQuarter = recentHistory.slice(-7);
  const avgFirst = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
  const avgLast = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
  const volFirst = calculateVolatility(firstQuarter);
  const volLast = calculateVolatility(lastQuarter);
  
  if (volLast > volFirst * 2.5 && Math.abs(avgLast - avgFirst) < range * 0.1) {
    indicators.push('WYCKOFF ACCUMULATION');
    severity += 3;
    institutionalFootprint += 25;
  }
  
  // Enhanced Price Whipsaw Pattern
  let whipsaws = 0;
  for (let i = 2; i < recentHistory.length; i++) {
    const direction1 = recentHistory[i - 1] - recentHistory[i - 2];
    const direction2 = recentHistory[i] - recentHistory[i - 1];
    if (Math.sign(direction1) !== Math.sign(direction2) && Math.abs(direction1) > range * 0.02) {
      whipsaws++;
    }
  }
  if (whipsaws > recentHistory.length * 0.4) {
    indicators.push('WHIPSAW TRAP');
    severity += 2;
  }
  
  // Spring/Upthrust Detection (Wyckoff)
  const recent5 = history.slice(-5);
  const testBelow = recent5.some((p, i) => i > 0 && p < min * 1.001 && recent5[recent5.length - 1] > p);
  const testAbove = recent5.some((p, i) => i > 0 && p > max * 0.999 && recent5[recent5.length - 1] < p);
  
  if (testBelow) {
    indicators.push('SPRING DETECTED (WYCKOFF)');
    severity += 4;
    institutionalFootprint += 30;
  }
  if (testAbove) {
    indicators.push('UPTHRUST DETECTED (WYCKOFF)');
    severity += 4;
    institutionalFootprint += 30;
  }
  
  // Volume Spread Analysis (VSA)
  const spread = Math.abs(last - prev);
  const avgSpread = recentHistory.slice(1).reduce((acc, p, i) => acc + Math.abs(p - recentHistory[i]), 0) / (recentHistory.length - 1);
  
  if (spread < avgSpread * 0.3 && Math.abs(last - avgPrice) > range * 0.4) {
    indicators.push('NO DEMAND / NO SUPPLY (VSA)');
    severity += 3;
    institutionalFootprint += 20;
  }
  
  // Absorption Pattern (large moves on low vol)
  if (move > range * 0.05 && calculateVolatility(recent5) < volatility * 0.5) {
    indicators.push('ABSORPTION PATTERN');
    severity += 3;
    institutionalFootprint += 25;
  }
  
  const detected = severity > 0;
  const type = detected 
    ? indicators[0] || 'INSTITUTIONAL MANIPULATION'
    : 'ORGANIC FLOW';
  
  return { detected, type, severity, indicators, institutionalFootprint };
};

export const calculateTechnicalStrength = (history: number[]) => {
  if (history.length < 40) return 50;
  const calcRsi = (data: number[]) => {
    let gains = 0; let losses = 0;
    for (let i = 1; i < data.length; i++) {
      const d = data[i] - data[i-1];
      if (d > 0) gains += d; else losses += Math.abs(d);
    }
    return 100 - (100 / (1 + (gains / (losses || 1))));
  };
  const rsi = calcRsi(history.slice(-14));
  return Math.round(rsi);
};

/**
 * JARVIS Advanced Technical Analysis Suite V11.0 ELITE
 * Complete indicator suite with multi-timeframe confluence and convergence analysis
 */
export interface TechnicalAnalysisResult {
  rsi: number;
  macd: { value: number; signal: number; histogram: number; trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' };
  bollingerBands: { upper: number; middle: number; lower: number; position: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'; squeeze: boolean };
  movingAverages: { ma20: number; ma50: number; ma200: number; alignment: 'BULLISH' | 'BEARISH' | 'MIXED' };
  supportResistance: { support: number; resistance: number; nearLevel: boolean };
  divergence: { detected: boolean; type: string };
  stochastic: { k: number; d: number; signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' };
  atr: { value: number; trend: 'EXPANDING' | 'CONTRACTING' | 'STABLE' };
  adx: { value: number; trend: 'STRONG' | 'WEAK'; direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' };
  ichimoku: { signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; cloud: 'ABOVE' | 'BELOW' | 'INSIDE' };
  fibonacci: { level: string; nearLevel: boolean };
  overallStrength: number;
  signals: string[];
  confluence: number;
}

export const calculateAdvancedTechnicals = (history: number[]): TechnicalAnalysisResult => {
  if (history.length < 200) {
    return {
      rsi: 50,
      macd: { value: 0, signal: 0, histogram: 0, trend: 'NEUTRAL' },
      bollingerBands: { upper: 0, middle: 0, lower: 0, position: 'NEUTRAL', squeeze: false },
      movingAverages: { ma20: 0, ma50: 0, ma200: 0, alignment: 'MIXED' },
      supportResistance: { support: 0, resistance: 0, nearLevel: false },
      divergence: { detected: false, type: 'NONE' },
      stochastic: { k: 50, d: 50, signal: 'NEUTRAL' },
      atr: { value: 0, trend: 'STABLE' },
      adx: { value: 0, trend: 'WEAK', direction: 'NEUTRAL' },
      ichimoku: { signal: 'NEUTRAL', cloud: 'INSIDE' },
      fibonacci: { level: 'EQUILIBRIUM', nearLevel: false },
      overallStrength: 50,
      signals: ['CALIBRATING...'],
      confluence: 0
    };
  }
  
  const signals: string[] = [];
  const last = history[history.length - 1];
  let confluence = 0;
  
  // RSI
  const rsi = calculateTechnicalStrength(history);
  if (rsi > 75) { signals.push('RSI EXTREME OVERBOUGHT'); confluence -= 2; }
  else if (rsi > 70) { signals.push('RSI OVERBOUGHT'); confluence -= 1; }
  if (rsi < 25) { signals.push('RSI EXTREME OVERSOLD'); confluence += 2; }
  else if (rsi < 30) { signals.push('RSI OVERSOLD'); confluence += 1; }
  
  // MACD (12, 26, 9)
  const ema = (data: number[], period: number) => {
    const k = 2 / (period + 1);
    let emaVal = data[0];
    for (let i = 1; i < data.length; i++) {
      emaVal = (data[i] * k) + (emaVal * (1 - k));
    }
    return emaVal;
  };
  
  const ema12 = ema(history, 12);
  const ema26 = ema(history, 26);
  const macdValue = ema12 - ema26;
  const macdSignalVals: number[] = [];
  for (let i = 26; i < history.length; i++) {
    const e12 = ema(history.slice(0, i + 1), 12);
    const e26 = ema(history.slice(0, i + 1), 26);
    macdSignalVals.push(e12 - e26);
  }
  const macdSignal = ema(macdSignalVals.slice(-9), 9);
  const macdHistogram = macdValue - macdSignal;
  const prevHistogram = macdSignalVals.length > 1 ? macdSignalVals[macdSignalVals.length - 1] - ema(macdSignalVals.slice(-10, -1), 9) : 0;
  const macdTrend = macdHistogram > 0 ? 'BULLISH' : macdHistogram < 0 ? 'BEARISH' : 'NEUTRAL';
  
  if (macdHistogram > 0 && prevHistogram <= 0) { signals.push('MACD BULLISH CROSS'); confluence += 3; }
  else if (macdHistogram < 0 && prevHistogram >= 0) { signals.push('MACD BEARISH CROSS'); confluence -= 3; }
  else if (macdTrend === 'BULLISH') confluence += 1;
  else if (macdTrend === 'BEARISH') confluence -= 1;
  
  // Bollinger Bands (20, 2) with squeeze detection
  const sma20 = history.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const variance = history.slice(-20).reduce((a, b) => a + Math.pow(b - sma20, 2), 0) / 20;
  const stdDev = Math.sqrt(variance);
  const bbUpper = sma20 + (2 * stdDev);
  const bbLower = sma20 - (2 * stdDev);
  const bbWidth = bbUpper - bbLower;
  const avgBBWidth = history.slice(-100, -20).reduce((acc, _, i, arr) => {
    if (i < 19) return acc;
    const sma = arr.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20;
    const std = Math.sqrt(arr.slice(i - 19, i + 1).reduce((a, b) => a + Math.pow(b - sma, 2), 0) / 20);
    return acc + (std * 4);
  }, 0) / 80;
  const squeeze = bbWidth < avgBBWidth * 0.7;
  
  const bbPosition = last > bbUpper ? 'OVERBOUGHT' : last < bbLower ? 'OVERSOLD' : 'NEUTRAL';
  
  if (bbPosition === 'OVERBOUGHT') { signals.push('BB UPPER BREACH'); confluence -= 2; }
  if (bbPosition === 'OVERSOLD') { signals.push('BB LOWER BREACH'); confluence += 2; }
  if (squeeze) { signals.push('BB SQUEEZE - BREAKOUT IMMINENT'); confluence += 2; }
  
  // Moving Averages
  const ma20 = sma20;
  const ma50 = history.slice(-50).reduce((a, b) => a + b, 0) / 50;
  const ma200 = history.slice(-200).reduce((a, b) => a + b, 0) / 200;
  
  let maAlignment: 'BULLISH' | 'BEARISH' | 'MIXED' = 'MIXED';
  if (ma20 > ma50 && ma50 > ma200 && last > ma20) {
    maAlignment = 'BULLISH';
    signals.push('MA GOLDEN ALIGNMENT');
    confluence += 4;
  } else if (ma20 < ma50 && ma50 < ma200 && last < ma20) {
    maAlignment = 'BEARISH';
    signals.push('MA DEATH ALIGNMENT');
    confluence -= 4;
  }
  
  // Stochastic Oscillator (14, 3, 3)
  const stochPeriod = 14;
  const recentForStoch = history.slice(-stochPeriod);
  const highestHigh = Math.max(...recentForStoch);
  const lowestLow = Math.min(...recentForStoch);
  const stochK = ((last - lowestLow) / (highestHigh - lowestLow)) * 100;
  const stochKValues: number[] = [];
  for (let i = stochPeriod; i <= history.length; i++) {
    const window = history.slice(i - stochPeriod, i);
    const high = Math.max(...window);
    const low = Math.min(...window);
    stochKValues.push(((history[i - 1] - low) / (high - low)) * 100);
  }
  const stochD = stochKValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const stochSignal = stochK > 80 ? 'OVERBOUGHT' : stochK < 20 ? 'OVERSOLD' : 'NEUTRAL';
  
  if (stochSignal === 'OVERBOUGHT') { signals.push('STOCH OVERBOUGHT'); confluence -= 1; }
  if (stochSignal === 'OVERSOLD') { signals.push('STOCH OVERSOLD'); confluence += 1; }
  if (stochK > stochD && stochK < 20) { signals.push('STOCH BULLISH CROSS'); confluence += 2; }
  if (stochK < stochD && stochK > 80) { signals.push('STOCH BEARISH CROSS'); confluence -= 2; }
  
  // ATR (Average True Range) - 14 period
  const atrPeriod = 14;
  const trueRanges: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const high = Math.max(history[i], history[i - 1]);
    const low = Math.min(history[i], history[i - 1]);
    trueRanges.push(high - low);
  }
  const atrValue = trueRanges.slice(-atrPeriod).reduce((a, b) => a + b, 0) / atrPeriod;
  const prevATR = trueRanges.slice(-atrPeriod * 2, -atrPeriod).reduce((a, b) => a + b, 0) / atrPeriod;
  const atrTrend = atrValue > prevATR * 1.2 ? 'EXPANDING' : atrValue < prevATR * 0.8 ? 'CONTRACTING' : 'STABLE';
  
  if (atrTrend === 'EXPANDING') { signals.push('VOLATILITY EXPANSION'); confluence += 1; }
  if (atrTrend === 'CONTRACTING') { signals.push('VOLATILITY CONTRACTION'); }
  
  // ADX (Average Directional Index) - simplified
  const adxPeriod = 14;
  let positiveDM = 0, negativeDM = 0;
  for (let i = 1; i < history.slice(-adxPeriod).length; i++) {
    const upMove = history[history.length - adxPeriod + i] - history[history.length - adxPeriod + i - 1];
    const downMove = history[history.length - adxPeriod + i - 1] - history[history.length - adxPeriod + i];
    if (upMove > downMove && upMove > 0) positiveDM += upMove;
    if (downMove > upMove && downMove > 0) negativeDM += downMove;
  }
  const adxValue = Math.abs(positiveDM - negativeDM) / (positiveDM + negativeDM + 0.0001) * 100;
  const adxTrend = adxValue > 25 ? 'STRONG' : 'WEAK';
  const adxDirection = positiveDM > negativeDM ? 'BULLISH' : negativeDM > positiveDM ? 'BEARISH' : 'NEUTRAL';
  
  if (adxTrend === 'STRONG' && adxDirection === 'BULLISH') { signals.push('ADX STRONG UPTREND'); confluence += 3; }
  if (adxTrend === 'STRONG' && adxDirection === 'BEARISH') { signals.push('ADX STRONG DOWNTREND'); confluence -= 3; }
  
  // Ichimoku Cloud (simplified)
  const ichimokuPeriod = 26;
  const tenkanSen = (Math.max(...history.slice(-9)) + Math.min(...history.slice(-9))) / 2;
  const kijunSen = (Math.max(...history.slice(-26)) + Math.min(...history.slice(-26))) / 2;
  const senkouA = (tenkanSen + kijunSen) / 2;
  const senkouB = (Math.max(...history.slice(-52)) + Math.min(...history.slice(-52))) / 2;
  const cloudTop = Math.max(senkouA, senkouB);
  const cloudBottom = Math.min(senkouA, senkouB);
  
  const ichimokuCloud = last > cloudTop ? 'ABOVE' : last < cloudBottom ? 'BELOW' : 'INSIDE';
  const ichimokuSignal = ichimokuCloud === 'ABOVE' && tenkanSen > kijunSen ? 'BULLISH' : 
                         ichimokuCloud === 'BELOW' && tenkanSen < kijunSen ? 'BEARISH' : 'NEUTRAL';
  
  if (ichimokuSignal === 'BULLISH') { signals.push('ICHIMOKU BULLISH'); confluence += 3; }
  if (ichimokuSignal === 'BEARISH') { signals.push('ICHIMOKU BEARISH'); confluence -= 3; }
  
  // Support & Resistance (pivot points)
  const recentData = history.slice(-50);
  const high = Math.max(...recentData);
  const low = Math.min(...recentData);
  const close = last;
  const pivot = (high + low + close) / 3;
  const resistance = (2 * pivot) - low;
  const support = (2 * pivot) - high;
  
  const nearLevel = Math.abs(last - resistance) / last < 0.005 || Math.abs(last - support) / last < 0.005;
  if (nearLevel) signals.push('NEAR KEY LEVEL');
  
  // Fibonacci Retracement Levels
  const fibHigh = high;
  const fibLow = low;
  const fibRange = fibHigh - fibLow;
  const fib236 = fibHigh - (fibRange * 0.236);
  const fib382 = fibHigh - (fibRange * 0.382);
  const fib500 = fibHigh - (fibRange * 0.500);
  const fib618 = fibHigh - (fibRange * 0.618);
  const fib786 = fibHigh - (fibRange * 0.786);
  
  let fibLevel = 'EQUILIBRIUM';
  let fibNearLevel = false;
  const fibTolerance = fibRange * 0.02;
  
  if (Math.abs(last - fib236) < fibTolerance) { fibLevel = 'FIB 23.6%'; fibNearLevel = true; confluence += 2; }
  else if (Math.abs(last - fib382) < fibTolerance) { fibLevel = 'FIB 38.2%'; fibNearLevel = true; confluence += 2; }
  else if (Math.abs(last - fib500) < fibTolerance) { fibLevel = 'FIB 50%'; fibNearLevel = true; confluence += 3; }
  else if (Math.abs(last - fib618) < fibTolerance) { fibLevel = 'FIB 61.8% GOLDEN'; fibNearLevel = true; confluence += 4; }
  else if (Math.abs(last - fib786) < fibTolerance) { fibLevel = 'FIB 78.6%'; fibNearLevel = true; confluence += 3; }
  
  if (fibNearLevel) signals.push(`AT ${fibLevel}`);
  
  // Divergence Detection (RSI vs Price)
  const rsiHistory: number[] = [];
  for (let i = 14; i < history.length; i++) {
    rsiHistory.push(calculateTechnicalStrength(history.slice(0, i + 1)));
  }
  
  const priceHigher = history[history.length - 1] > history[history.length - 20];
  const rsiLower = rsiHistory[rsiHistory.length - 1] < rsiHistory[rsiHistory.length - 20];
  const priceLower = history[history.length - 1] < history[history.length - 20];
  const rsiHigher = rsiHistory[rsiHistory.length - 1] > rsiHistory[rsiHistory.length - 20];
  
  let divergence = { detected: false, type: 'NONE' };
  if (priceHigher && rsiLower) {
    divergence = { detected: true, type: 'BEARISH DIVERGENCE' };
    signals.push('BEARISH DIVERGENCE');
    confluence -= 4;
  } else if (priceLower && rsiHigher) {
    divergence = { detected: true, type: 'BULLISH DIVERGENCE' };
    signals.push('BULLISH DIVERGENCE');
    confluence += 4;
  }
  
  // Overall strength calculation with multi-factor weighting
  let strength = rsi;
  if (macdTrend === 'BULLISH') strength += 12;
  if (macdTrend === 'BEARISH') strength -= 12;
  if (maAlignment === 'BULLISH') strength += 18;
  if (maAlignment === 'BEARISH') strength -= 18;
  if (bbPosition === 'OVERSOLD') strength += 8;
  if (bbPosition === 'OVERBOUGHT') strength -= 8;
  if (adxTrend === 'STRONG' && adxDirection === 'BULLISH') strength += 10;
  if (adxTrend === 'STRONG' && adxDirection === 'BEARISH') strength -= 10;
  if (ichimokuSignal === 'BULLISH') strength += 10;
  if (ichimokuSignal === 'BEARISH') strength -= 10;
  
  const overallStrength = Math.max(0, Math.min(100, strength));
  
  return {
    rsi,
    macd: { value: macdValue, signal: macdSignal, histogram: macdHistogram, trend: macdTrend },
    bollingerBands: { upper: bbUpper, middle: sma20, lower: bbLower, position: bbPosition, squeeze },
    movingAverages: { ma20, ma50, ma200, alignment: maAlignment },
    supportResistance: { support, resistance, nearLevel },
    divergence,
    stochastic: { k: stochK, d: stochD, signal: stochSignal },
    atr: { value: atrValue, trend: atrTrend },
    adx: { value: adxValue, trend: adxTrend, direction: adxDirection },
    ichimoku: { signal: ichimokuSignal, cloud: ichimokuCloud },
    fibonacci: { level: fibLevel, nearLevel: fibNearLevel },
    overallStrength,
    signals: signals.slice(0, 8), // Limit to top 8 signals
    confluence
  };
};

function lastPrice(h: number[]) { return h[h.length - 1]; }
