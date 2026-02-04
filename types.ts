
export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  history: number[];
  volatility: number;
  lastSpike?: number;
}

export interface ICTConcepts {
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

export interface Position {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  current: number;
  pnl: number;
  pnlPercent: number;
  status: 'PROFIT' | 'MONITOR' | 'LOSS';
}

export interface Signal {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  timeframe: string;
  confidence: number;
  entry: number;
  tp1: number;
  tp2: number;
  sl: number;
  timestamp: string;
  analysis: string[];
}

export interface Message {
  id: string;
  sender: 'JARVIS' | 'USER';
  text: string;
  timestamp: Date;
}
