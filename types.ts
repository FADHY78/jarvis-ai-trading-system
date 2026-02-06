
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

// Universal symbol resolver to handle mapping between Deriv keys and UI keys
export function resolvePriceData(symbol: string, prices: Record<string, PriceData>): PriceData | undefined {
  if (!prices) return undefined;
  if (prices[symbol]) return prices[symbol];
  
  // Symbol mapping from Deriv API keys to UI keys (matches App.tsx mapping)
  const symbolMap: Record<string, string> = {
    'frxXAUUSD': 'GOLD',
    'XAUUSD': 'GOLD',
    'XAU': 'GOLD',
    'frxEURUSD': 'EURUSD', 
    'EURUSD': 'EURUSD',
    'frxGBPUSD': 'GBPUSD',
    'GBPUSD': 'GBPUSD', 
    'frxUSDJPY': 'USDJPY',
    'USDJPY': 'USDJPY',
    'cryBTCUSD': 'BTCUSD',
    'BTCUSD': 'BTCUSD',
    'BTC': 'BTCUSD',
    '1HZ100V': 'NAS100',
    'NAS100': 'NAS100',
    'NASDAQ': 'NAS100',
    'R_100': 'R_100',
    'R_75': 'R_75',
    'R_50': 'R_50',
    'R_25': 'R_25',
    'R_10': 'R_10',
    'BOOM500': 'BOOM500',
    'BOOM1000': 'BOOM1000',
    'CRASH500': 'CRASH500',
    'CRASH1000': 'CRASH1000'
  };

  const mappedKey = symbolMap[symbol];
  if (mappedKey && prices[mappedKey]) return prices[mappedKey];

  return undefined;
}
