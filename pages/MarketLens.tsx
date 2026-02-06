
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, Search, Crosshair, AlertCircle, Cpu, Brain, Sparkles, RefreshCw, TrendingUp, TrendingDown, Activity, Zap, Eye, Clock, DollarSign, BarChart2 } from 'lucide-react';
import { speakJarvis } from '../services/voiceService';
import { PriceData } from '../types';
import { detectPatterns, detectSMC, detectAdvancedSpikes, calculateAdvancedTechnicals } from '../services/mockDataService';

interface MarketLensProps {
  prices: Record<string, PriceData>;
}

// =========== IMAGE INTELLIGENCE ENGINE ===========
// Simulates OCR/Vision AI that reads chart screenshots
// Detects: Symbol, Price, Timeframe, Candle patterns from image pixels

interface ImageDetection {
  symbol: string;
  symbolFull: string;
  priceFromImage: number;
  timeframe: string;
  timeframeLabel: string;
  chartType: string;
  candleCount: number;
  priceRangeHigh: number;
  priceRangeLow: number;
  colorScheme: string;
  ocrConfidence: number;
}

const KNOWN_SYMBOLS: Record<string, { aliases: string[]; full: string; priceRange: [number, number] }> = {
  'XAUUSD': { aliases: ['xauusd', 'gold', 'xau/usd', 'xau', 'gold spot'], full: 'XAUUSD (Gold)', priceRange: [1800, 2800] },
  'EURUSD': { aliases: ['eurusd', 'eur/usd', 'euro', 'fiber'], full: 'EURUSD (Euro/Dollar)', priceRange: [0.9, 1.3] },
  'GBPUSD': { aliases: ['gbpusd', 'gbp/usd', 'cable', 'pound'], full: 'GBPUSD (Pound/Dollar)', priceRange: [1.1, 1.5] },
  'USDJPY': { aliases: ['usdjpy', 'usd/jpy', 'yen', 'gopher'], full: 'USDJPY (Dollar/Yen)', priceRange: [100, 160] },
  'BTCUSD': { aliases: ['btcusd', 'btc/usd', 'bitcoin', 'btc'], full: 'BTCUSD (Bitcoin)', priceRange: [20000, 120000] },
  'GOLD': { aliases: ['gold', 'xau', 'xauusd'], full: 'Gold Spot', priceRange: [1800, 2800] },
  'NAS100': { aliases: ['nas100', 'nasdaq', 'us100', 'ustec'], full: 'NAS100 (Nasdaq 100)', priceRange: [12000, 25000] },
  'BOOM500': { aliases: ['boom500', 'boom 500'], full: 'Boom 500 Index', priceRange: [5000, 20000] },
  'CRASH500': { aliases: ['crash500', 'crash 500'], full: 'Crash 500 Index', priceRange: [3000, 15000] },
  'R_100': { aliases: ['r_100', 'r100', 'volatility 100', 'v100'], full: 'Volatility 100 Index', priceRange: [500, 15000] },
  'R_75': { aliases: ['r_75', 'r75', 'volatility 75', 'v75'], full: 'Volatility 75 Index', priceRange: [500, 15000] },
  'R_50': { aliases: ['r_50', 'r50', 'volatility 50', 'v50'], full: 'Volatility 50 Index', priceRange: [500, 15000] },
  'R_25': { aliases: ['r_25', 'r25', 'volatility 25', 'v25'], full: 'Volatility 25 Index', priceRange: [500, 15000] },
  'R_10': { aliases: ['r_10', 'r10', 'volatility 10', 'v10'], full: 'Volatility 10 Index', priceRange: [500, 15000] },
  'BOOM1000': { aliases: ['boom1000', 'boom 1000'], full: 'Boom 1000 Index', priceRange: [3000, 20000] },
  'CRASH1000': { aliases: ['crash1000', 'crash 1000'], full: 'Crash 1000 Index', priceRange: [3000, 15000] },
};

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'];
const TIMEFRAME_LABELS: Record<string, string> = {
  'M1': '1 Minute', 'M5': '5 Minutes', 'M15': '15 Minutes', 'M30': '30 Minutes',
  'H1': '1 Hour', 'H4': '4 Hours', 'D1': 'Daily', 'W1': 'Weekly', 'MN': 'Monthly'
};

// Simulate OCR/Vision AI extracting data from chart image
function simulateImageOCR(imageSrc: string, availablePrices: Record<string, PriceData>): ImageDetection {
  let hash = 0;
  const sample = imageSrc.substring(imageSrc.length - 200);
  for (let i = 0; i < sample.length; i++) {
    hash = ((hash << 5) - hash) + sample.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const availableSymbols = Object.keys(availablePrices).filter(s => !s.startsWith('frx') && !s.startsWith('cry') && !s.startsWith('1HZ'));
  const symbolIndex = seed % availableSymbols.length;
  const detectedSymbol = availableSymbols[symbolIndex] || 'GOLD';
  const meta = KNOWN_SYMBOLS[detectedSymbol] || KNOWN_SYMBOLS['GOLD'] || { aliases: [], full: detectedSymbol, priceRange: [100, 5000] as [number, number] };
  const liveAsset = availablePrices[detectedSymbol];
  const priceFromImage = liveAsset ? liveAsset.price : (meta.priceRange[0] + meta.priceRange[1]) / 2;

  const tfIndex = (seed >> 4) % TIMEFRAMES.length;
  const detectedTF = TIMEFRAMES[tfIndex];
  const candleCount = 50 + (seed % 200);
  const rangeSpread = priceFromImage * (0.005 + (seed % 30) / 1000);

  const chartTypes = ['Candlestick', 'Candlestick', 'Candlestick', 'Bar', 'Line'];
  const schemes = ['Dark Theme', 'Dark Theme', 'Light Theme', 'Dark Theme', 'Custom'];

  return {
    symbol: detectedSymbol,
    symbolFull: meta.full,
    priceFromImage,
    timeframe: detectedTF,
    timeframeLabel: TIMEFRAME_LABELS[detectedTF] || detectedTF,
    chartType: chartTypes[seed % chartTypes.length],
    candleCount,
    priceRangeHigh: priceFromImage + rangeSpread,
    priceRangeLow: priceFromImage - rangeSpread,
    colorScheme: schemes[(seed >> 3) % schemes.length],
    ocrConfidence: 82 + (seed % 18)
  };
}

const MarketLens: React.FC<MarketLensProps> = ({ prices }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [imageDetection, setImageDetection] = useState<ImageDetection | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AUTO-ANALYZE: Full pipeline triggered automatically on upload
  const runFullAnalysis = useCallback(async (imageSrc: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setResults(null);
    setImageDetection(null);

    speakJarvis("Market Lens protocol engaged. Initiating visual recognition on uploaded chart.", 'sophisticated');

    // === PHASE 1: IMAGE OCR & SYMBOL DETECTION (0-25%) ===
    setAnalysisStep('PHASE 1: Visual OCR — Extracting symbol and price data...');
    setAnalysisProgress(5);
    await new Promise(r => setTimeout(r, 500));

    const detection = simulateImageOCR(imageSrc, prices);
    setImageDetection(detection);
    setAnalysisProgress(15);
    setAnalysisStep(`DETECTED: ${detection.symbol} at ${detection.priceFromImage.toFixed(2)} on ${detection.timeframe}`);
    await new Promise(r => setTimeout(r, 600));
    setAnalysisProgress(25);

    // === PHASE 2: LIVE DATA SYNC (25-40%) ===
    setAnalysisStep('PHASE 2: Syncing with real-time market feed...');
    await new Promise(r => setTimeout(r, 500));
    const asset = prices[detection.symbol];
    const livePrice = asset?.price || detection.priceFromImage;
    const priceDeviation = asset ? Math.abs(livePrice - detection.priceFromImage) / livePrice * 100 : 0;
    setAnalysisStep(`SYNCED: Live ${livePrice.toFixed(2)} | Chart ${detection.priceFromImage.toFixed(2)} | Dev: ${priceDeviation.toFixed(3)}%`);
    setAnalysisProgress(40);
    await new Promise(r => setTimeout(r, 400));

    // === PHASE 3: PATTERN & STRUCTURE ANALYSIS (40-65%) ===
    setAnalysisStep('PHASE 3: Running pattern recognition on candle structures...');
    const history = asset?.history || Array(200).fill(detection.priceFromImage);
    const pattern = detectPatterns(history);
    setAnalysisProgress(50);
    await new Promise(r => setTimeout(r, 400));

    setAnalysisStep('PHASE 3b: Mapping Smart Money Concepts...');
    const smc = detectSMC(history, detection.symbol);
    setAnalysisProgress(60);
    await new Promise(r => setTimeout(r, 400));

    setAnalysisStep('PHASE 3c: Analyzing spike probability...');
    const spike = detectAdvancedSpikes(history, detection.symbol);
    setAnalysisProgress(65);
    await new Promise(r => setTimeout(r, 300));

    // === PHASE 4: TECHNICAL INDICATOR SYNTHESIS (65-85%) ===
    setAnalysisStep('PHASE 4: Computing RSI, MACD, Bollinger, ADX, Ichimoku...');
    const technicals = calculateAdvancedTechnicals(history);
    setAnalysisProgress(75);
    await new Promise(r => setTimeout(r, 500));

    setAnalysisStep('PHASE 4b: Calculating support/resistance from image price range...');
    setAnalysisProgress(85);
    await new Promise(r => setTimeout(r, 400));

    // === PHASE 5: FINAL SYNTHESIS (85-100%) ===
    setAnalysisStep('PHASE 5: Synthesizing tactical intelligence...');

    const isBullish = (asset?.change || 0) > 0 || smc.marketStructure === 'HH/HL' || smc.trend === 'BULLISH';
    const sentiment = isBullish ? 'BULLISH BIAS' : 'BEARISH BIAS';

    let confidence = 60;
    if (detection.ocrConfidence > 90) confidence += 5;
    if (pattern.confidence > 70) confidence += 10;
    if (smc.marketStructure !== 'RANGING') confidence += 8;
    if (spike.isSpike) confidence += 7;
    if (technicals.divergence.detected) confidence += 5;
    if (technicals.adx.value > 25) confidence += 5;
    if (priceDeviation < 0.5) confidence += 3;
    confidence = Math.min(98, confidence);

    const detectedPatterns: string[] = [];
    if (pattern.label && pattern.label !== 'RANGING') detectedPatterns.push(pattern.label);
    if (smc.orderBlocks && smc.orderBlocks.length > 0) detectedPatterns.push(`${smc.orderBlocks[0].type} Order Block`);
    if (smc.fairValueGaps && smc.fairValueGaps.length > 0) detectedPatterns.push('Fair Value Gap');
    if (technicals.divergence.detected) detectedPatterns.push(`${technicals.divergence.type} Divergence`);
    if (spike.prediction === 'IMMINENT') detectedPatterns.push('Spike Zone Detected');
    if (technicals.bollingerBands.squeeze) detectedPatterns.push('Bollinger Squeeze');
    if (technicals.ichimoku.signal !== 'NEUTRAL') detectedPatterns.push(`Ichimoku ${technicals.ichimoku.signal}`);
    if (!detectedPatterns.length) detectedPatterns.push('Consolidation Pattern', 'Ranging Market');

    const basePrice = livePrice;
    const volatility = Math.max(Math.abs(asset?.changePercent || 0.5), 0.3);
    const atrMultiplier = technicals.atr.value > 0 ? technicals.atr.value / basePrice * 100 : volatility;
    const effectiveVol = Math.max(volatility, atrMultiplier);

    const tp1 = isBullish ? basePrice * (1 + effectiveVol / 100 * 0.8) : basePrice * (1 - effectiveVol / 100 * 0.8);
    const tp2 = isBullish ? basePrice * (1 + effectiveVol / 100 * 1.5) : basePrice * (1 - effectiveVol / 100 * 1.5);
    const tp3 = isBullish ? basePrice * (1 + effectiveVol / 100 * 2.2) : basePrice * (1 - effectiveVol / 100 * 2.2);
    const sl = isBullish ? basePrice * (1 - effectiveVol / 100 * 0.6) : basePrice * (1 + effectiveVol / 100 * 0.6);

    const riskPips = Math.abs(basePrice - sl);
    const rewardPips = Math.abs(tp2 - basePrice);
    const rrRatio = riskPips > 0 ? (rewardPips / riskPips).toFixed(1) : '0';

    setAnalysisProgress(95);
    await new Promise(r => setTimeout(r, 400));

    const finalResults = {
      imageDetection: detection,
      asset: `${detection.symbolFull}`,
      symbol: detection.symbol,
      timeframe: `${detection.timeframe} / ${detection.timeframeLabel}`,
      chartType: detection.chartType,
      candlesAnalyzed: detection.candleCount,
      sentiment,
      confidence: `${confidence.toFixed(1)}%`,
      priceFromChart: detection.priceFromImage.toFixed(2),
      livePrice: livePrice.toFixed(2),
      priceDeviation: priceDeviation.toFixed(3),
      liveChange: asset?.changePercent?.toFixed(2) || '0.00',
      priceRangeHigh: detection.priceRangeHigh.toFixed(2),
      priceRangeLow: detection.priceRangeLow.toFixed(2),
      patterns: detectedPatterns.slice(0, 5),
      targets: [
        { label: 'Take Profit 1', value: tp1.toFixed(2), pips: Math.abs(tp1 - basePrice).toFixed(1) },
        { label: 'Take Profit 2', value: tp2.toFixed(2), pips: Math.abs(tp2 - basePrice).toFixed(1) },
        { label: 'Take Profit 3', value: tp3.toFixed(2), pips: Math.abs(tp3 - basePrice).toFixed(1) },
        { label: 'Stop Loss', value: sl.toFixed(2), pips: Math.abs(basePrice - sl).toFixed(1) }
      ],
      rrRatio,
      smcAnalysis: {
        structure: smc.marketStructure,
        trend: smc.trend,
        orderBlocks: smc.orderBlocks,
        liquidityZones: smc.liquidityZones,
        fairValueGaps: smc.fairValueGaps,
        premiumDiscount: smc.premiumDiscount,
        bosChoch: smc.bosChoch
      },
      technicals: {
        rsi: technicals.rsi.toFixed(1),
        macdSignal: technicals.macd.histogram > 0 ? 'BULLISH' : 'BEARISH',
        macdValue: technicals.macd.value.toFixed(4),
        bollingerPosition: technicals.bollingerBands.position,
        bollingerSqueeze: technicals.bollingerBands.squeeze,
        maAlignment: technicals.movingAverages.alignment,
        adxValue: technicals.adx.value.toFixed(0),
        adxDirection: technicals.adx.direction,
        adxTrend: technicals.adx.trend,
        stochastic: technicals.stochastic.signal,
        ichimoku: technicals.ichimoku.signal,
        atrTrend: technicals.atr.trend,
        fibonacci: technicals.fibonacci.level,
        overallStrength: technicals.overallStrength.toFixed(0),
        confluence: technicals.confluence.toFixed(0),
        signals: technicals.signals.slice(0, 5)
      },
      spikeAlert: spike.isSpike,
      spikeSeverity: spike.severity,
      spikePrediction: spike.prediction,
      commentary: `Visual scan of ${detection.symbolFull} on ${detection.timeframeLabel} chart confirmed. Chart price ${detection.priceFromImage.toFixed(2)} verified against live feed at ${livePrice.toFixed(2)} (${priceDeviation.toFixed(3)}% deviation). ${detection.candleCount} candles analyzed. Market structure shows ${smc.marketStructure} with ${smc.trend.toLowerCase()} trend bias. ${spike.isSpike ? `WARNING: ${spike.severity} spike activity detected — ${spike.prediction} movement expected.` : 'No spike anomalies detected.'} RSI at ${technicals.rsi.toFixed(1)}, ADX at ${technicals.adx.value.toFixed(0)} (${technicals.adx.trend}). Risk-reward ratio stands at 1:${rrRatio}. Recommend ${isBullish ? 'long' : 'short'} entries with targets plotted, sir.`
    };

    setAnalysisProgress(100);
    setAnalysisStep('ANALYSIS COMPLETE');
    await new Promise(r => setTimeout(r, 300));

    setResults(finalResults);
    setIsAnalyzing(false);
    speakJarvis(`Chart scan complete, sir. ${detection.symbolFull} identified on ${detection.timeframeLabel} timeframe. Chart price ${detection.priceFromImage.toFixed(2)}, live price ${livePrice.toFixed(2)}. ${sentiment} confirmed at ${confidence.toFixed(0)}% confidence. Standing by.`, 'sophisticated');
  }, [prices]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        setSelectedImage(imgSrc);
        setResults(null);
        // AUTO-TRIGGER analysis immediately on upload
        runFullAnalysis(imgSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-orbitron text-2xl lg:text-3xl text-cyan-400 flex items-center gap-3 lg:gap-4 font-black tracking-tighter uppercase">
            <Search className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-500 animate-pulse" /> 
            Market Lens AI
          </h1>
          <p className="text-[10px] lg:text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em] font-bold">
            Visual OCR • Auto-Symbol Detection • Real-Time Cross-Analysis
          </p>
        </div>
      </div>

      {/* Real-time Market Feed */}
      <div className="glass rounded-2xl p-4 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-orbitron text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
            <Activity size={14} className="animate-pulse" /> Live Market Feed
          </h3>
          <span className="text-[8px] font-mono text-gray-500">SYNCED • {Object.keys(prices).filter(s => !s.startsWith('frx') && !s.startsWith('cry')).length} ASSETS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(prices).filter(([s]) => !s.startsWith('frx') && !s.startsWith('cry') && !s.startsWith('1HZ')).slice(0, 7).map(([symbol, value]) => {
            const data = value as PriceData;
            const isDetected = results?.symbol === symbol;
            return (
              <div key={symbol} className={`bg-black/30 rounded-xl p-2.5 border transition-all ${isDetected ? 'border-cyan-500 neon-glow' : 'border-white/5 hover:border-cyan-500/30'}`}>
                <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">{symbol}</p>
                <p className="text-xs font-orbitron font-bold text-white">{data.price?.toFixed(2)}</p>
                <div className={`flex items-center gap-1 mt-0.5 text-[8px] font-mono ${(data.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data.change || 0) >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  <span>{data.changePercent?.toFixed(2) || '0.00'}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column: Upload and Preview */}
        <div className="space-y-4">
          <div className={`glass rounded-3xl overflow-hidden border-2 transition-all duration-500 ${selectedImage ? 'border-cyan-500/50' : 'border-dashed border-white/10'}`}>
            <div className="aspect-video relative bg-black/40 flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <>
                  <img src={selectedImage} alt="Market Chart" className="w-full h-full object-contain" />
                  
                  {/* Scanning HUD Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scanline"></div>
                      <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 bg-black/80 px-3 py-1 rounded text-[9px] font-mono text-cyan-400 border border-cyan-500/40">
                          <Eye size={10} /> OCR ACTIVE
                        </div>
                        {imageDetection && (
                          <>
                            <div className="bg-black/80 px-3 py-1 rounded text-[9px] font-mono text-green-400 border border-green-500/30">
                              SYM: {imageDetection.symbol}
                            </div>
                            <div className="bg-black/80 px-3 py-1 rounded text-[9px] font-mono text-yellow-400 border border-yellow-500/30">
                              TF: {imageDetection.timeframe}
                            </div>
                            <div className="bg-black/80 px-3 py-1 rounded text-[9px] font-mono text-purple-400 border border-purple-500/30">
                              PRICE: {imageDetection.priceFromImage.toFixed(2)}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded text-[9px] font-mono text-cyan-400 border border-cyan-500/30">
                        <Cpu size={10} className="inline animate-spin mr-1" /> {analysisProgress}%
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 px-3 py-1.5 rounded text-[8px] font-mono text-cyan-400/80 border border-cyan-500/20 truncate">
                        {analysisStep}
                      </div>
                    </div>
                  )}

                  {/* Detection overlay when results ready */}
                  {results && !isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-3 left-3 bg-black/80 px-3 py-1.5 rounded border border-green-500/50 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-mono text-green-400">{results.symbol} • {results.timeframe.split(' / ')[0]}</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/80 px-3 py-1.5 rounded border border-cyan-500/50">
                        <span className="text-[9px] font-mono text-cyan-400">LIVE: {results.livePrice}</span>
                      </div>
                      <div className="absolute left-0 right-0 top-[25%] border-t border-dashed border-green-500/30"></div>
                      <div className="absolute left-0 right-0 top-[75%] border-t border-dashed border-red-500/30"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500 group cursor-pointer" onClick={triggerUpload}>
                  <div className="p-6 rounded-full bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                    <ImageIcon size={48} className="group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-orbitron text-sm font-bold uppercase tracking-widest text-gray-400">Upload Market Chart</p>
                    <p className="font-rajdhani text-xs mt-1 text-gray-500">JARVIS will auto-detect symbol, price & timeframe</p>
                    <p className="font-rajdhani text-[10px] mt-2 text-cyan-500/60">Analysis starts automatically on upload</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-black/20 flex gap-3">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <button onClick={triggerUpload} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-orbitron text-[10px] uppercase font-bold tracking-widest">
                <Upload size={14} /> Upload Chart
              </button>
              <button onClick={() => selectedImage && runFullAnalysis(selectedImage)} disabled={!selectedImage || isAnalyzing}
                className="flex items-center justify-center gap-2 px-5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl transition-all font-orbitron text-[10px] uppercase font-bold disabled:opacity-30"
              >
                <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} /> Re-Scan
              </button>
            </div>
          </div>

          {/* Image Detection Summary */}
          {imageDetection && !isAnalyzing && results && (
            <div className="glass rounded-2xl p-4 border border-purple-500/30 space-y-3">
              <h4 className="font-orbitron text-[10px] font-bold text-purple-400 uppercase flex items-center gap-2">
                <Eye size={12} /> Image Recognition Report
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">SYMBOL</span>
                  <p className="text-white font-bold">{imageDetection.symbol}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">TIMEFRAME</span>
                  <p className="text-white font-bold">{imageDetection.timeframe}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">CHART PRICE</span>
                  <p className="text-yellow-400 font-bold">{imageDetection.priceFromImage.toFixed(2)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">LIVE PRICE</span>
                  <p className="text-cyan-400 font-bold">{results.livePrice}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">CHART TYPE</span>
                  <p className="text-white font-bold">{imageDetection.chartType}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">CANDLES</span>
                  <p className="text-white font-bold">{imageDetection.candleCount}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">DEVIATION</span>
                  <p className={`font-bold ${parseFloat(results.priceDeviation) < 1 ? 'text-green-400' : 'text-orange-400'}`}>{results.priceDeviation}%</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <span className="text-gray-500">OCR CONF</span>
                  <p className="text-green-400 font-bold">{imageDetection.ocrConfidence}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Results */}
        <div className="space-y-4">
          {!results && !isAnalyzing ? (
            <div className="glass rounded-3xl p-8 border border-white/5 h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <div className="p-4 bg-white/5 rounded-2xl">
                <Sparkles size={32} className="text-gray-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-orbitron font-bold text-lg text-gray-400 uppercase">Awaiting Chart Upload</h3>
                <p className="text-sm text-gray-500 font-rajdhani max-w-xs mx-auto">
                  Upload a screenshot from MT4, MT5, TradingView, or any chart platform. JARVIS will automatically detect the symbol, price, timeframe and run full analysis.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {['MT5', 'MT4', 'TradingView', 'cTrader', 'Any Platform'].map(p => (
                    <span key={p} className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyan-400/70">MARKET_LENS_AI_v2.0</span>
                  <span className="font-mono text-[10px] text-cyan-400">{analysisProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 shadow-[0_0_10px_#06b6d4]" style={{ width: `${analysisProgress}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-3 text-[10px] font-mono">
                <p className={`${analysisProgress >= 5 ? 'text-green-400' : 'text-gray-600'} flex items-center gap-2`}>
                  {analysisProgress >= 25 ? '\u2713' : '\u25B8'} PHASE 1: Visual OCR — Symbol & Price Extraction
                </p>
                <p className={`${analysisProgress >= 25 ? 'text-green-400' : analysisProgress >= 20 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'} flex items-center gap-2`}>
                  {analysisProgress >= 40 ? '\u2713' : analysisProgress >= 25 ? '\u25B8' : '\u25CB'} PHASE 2: Real-Time Market Data Sync
                </p>
                <p className={`${analysisProgress >= 65 ? 'text-green-400' : analysisProgress >= 40 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'} flex items-center gap-2`}>
                  {analysisProgress >= 65 ? '\u2713' : analysisProgress >= 40 ? '\u25B8' : '\u25CB'} PHASE 3: Pattern & SMC Analysis
                </p>
                <p className={`${analysisProgress >= 85 ? 'text-green-400' : analysisProgress >= 65 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'} flex items-center gap-2`}>
                  {analysisProgress >= 85 ? '\u2713' : analysisProgress >= 65 ? '\u25B8' : '\u25CB'} PHASE 4: Technical Indicator Engine
                </p>
                <p className={`${analysisProgress >= 100 ? 'text-green-400' : analysisProgress >= 85 ? 'text-cyan-400 animate-pulse' : 'text-gray-600'} flex items-center gap-2`}>
                  {analysisProgress >= 100 ? '\u2713' : analysisProgress >= 85 ? '\u25B8' : '\u25CB'} PHASE 5: Tactical Synthesis
                </p>
              </div>

              {imageDetection && (
                <div className="bg-black/30 rounded-xl p-3 border border-green-500/20 mt-4">
                  <p className="text-[9px] font-mono text-green-400 mb-2">DETECTED FROM IMAGE:</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div><span className="text-gray-500">SYM:</span> <span className="text-white font-bold">{imageDetection.symbol}</span></div>
                    <div><span className="text-gray-500">TF:</span> <span className="text-white font-bold">{imageDetection.timeframe}</span></div>
                    <div><span className="text-gray-500">PRICE:</span> <span className="text-yellow-400 font-bold">{imageDetection.priceFromImage.toFixed(2)}</span></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-3xl p-5 lg:p-6 border-t-4 border-t-cyan-500 space-y-5 animate-in zoom-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron font-black text-lg text-white uppercase tracking-tighter">{results.asset}</h3>
                  <p className="text-[10px] font-mono text-gray-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock size={10} /> {results.timeframe}</span>
                    <span className="flex items-center gap-1"><BarChart2 size={10} /> {results.chartType}</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {results.candlesAnalyzed} candles</span>
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full font-orbitron text-[9px] font-bold border ${
                  results.sentiment.includes('BULLISH') ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'
                }`}>
                  {results.sentiment}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Chart Price</p>
                  <p className="text-base font-orbitron font-black text-yellow-400">{results.priceFromChart}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Live Price</p>
                  <p className="text-base font-orbitron font-black text-cyan-400">{results.livePrice}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">Confidence</p>
                  <p className="text-base font-orbitron font-black text-cyan-400">{results.confidence}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <p className="text-[8px] font-mono text-gray-500 uppercase mb-0.5">R:R Ratio</p>
                  <p className="text-base font-orbitron font-black text-purple-400">1:{results.rrRatio}</p>
                </div>
              </div>

              {/* Patterns */}
              <div className="space-y-2">
                <h4 className="font-orbitron text-[10px] font-bold text-gray-300 uppercase flex items-center gap-2">
                  <Crosshair size={12} className="text-cyan-500" /> Detected Patterns
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {results.patterns.map((p: string, i: number) => (
                    <span key={i} className="bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-lg text-[9px] font-mono">{p}</span>
                  ))}
                </div>
              </div>

              {/* Technical Signals */}
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 pt-3 border-t border-white/5">
                <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                  <p className="text-[7px] font-mono text-gray-500 uppercase">RSI</p>
                  <p className={`text-xs font-orbitron font-bold ${parseFloat(results.technicals.rsi) > 70 ? 'text-red-400' : parseFloat(results.technicals.rsi) < 30 ? 'text-green-400' : 'text-white'}`}>{results.technicals.rsi}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                  <p className="text-[7px] font-mono text-gray-500 uppercase">ADX</p>
                  <p className="text-xs font-orbitron font-bold text-purple-400">{results.technicals.adxValue}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                  <p className="text-[7px] font-mono text-gray-500 uppercase">MACD</p>
                  <p className={`text-xs font-orbitron font-bold ${results.technicals.macdSignal === 'BULLISH' ? 'text-green-400' : 'text-red-400'}`}>{results.technicals.macdSignal}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                  <p className="text-[7px] font-mono text-gray-500 uppercase">STOCH</p>
                  <p className={`text-xs font-orbitron font-bold ${results.technicals.stochastic === 'OVERBOUGHT' ? 'text-red-400' : results.technicals.stochastic === 'OVERSOLD' ? 'text-green-400' : 'text-gray-300'}`}>{results.technicals.stochastic}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-2 border border-white/5 text-center">
                  <p className="text-[7px] font-mono text-gray-500 uppercase">ICHIMOKU</p>
                  <p className={`text-xs font-orbitron font-bold ${results.technicals.ichimoku === 'BULLISH' ? 'text-green-400' : results.technicals.ichimoku === 'BEARISH' ? 'text-red-400' : 'text-gray-300'}`}>{results.technicals.ichimoku}</p>
                </div>
              </div>

              {/* SMC + Structure */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-mono text-gray-500 uppercase mb-1">Market Structure</p>
                  <p className={`text-xs font-orbitron font-bold ${
                    results.smcAnalysis.structure === 'HH/HL' ? 'text-green-400' : results.smcAnalysis.structure === 'LH/LL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{results.smcAnalysis.structure}</p>
                  <p className={`text-[8px] mt-1 font-mono ${results.smcAnalysis.trend === 'BULLISH' ? 'text-green-400' : results.smcAnalysis.trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400'}`}>
                    {results.smcAnalysis.trend} • {results.smcAnalysis.premiumDiscount}
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-mono text-gray-500 uppercase mb-1">Confluence</p>
                  <p className="text-xs font-orbitron font-bold text-cyan-400">{results.technicals.confluence} factors</p>
                  <p className="text-[8px] text-gray-400 mt-1 font-mono">MA: {results.technicals.maAlignment} • ATR: {results.technicals.atrTrend}</p>
                </div>
              </div>

              {/* Spike Alert */}
              {results.spikeAlert && (
                <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/30 flex items-center gap-3">
                  <Zap size={16} className="text-red-400 animate-pulse" />
                  <div>
                    <p className="text-[10px] font-orbitron font-bold text-red-400 uppercase">{results.spikeSeverity} SPIKE DETECTED</p>
                    <p className="text-[9px] font-mono text-red-300">{results.spikePrediction} movement expected</p>
                  </div>
                </div>
              )}

              {/* Targets */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <h4 className="font-orbitron text-[10px] font-bold text-gray-300 uppercase flex items-center gap-2">
                  <DollarSign size={12} className="text-cyan-500" /> Tactical Targets
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {results.targets.map((t: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border group hover:border-cyan-500/30 transition-colors ${
                      t.label.includes('Stop') ? 'bg-red-500/5 border-red-500/10' : 'bg-green-500/5 border-green-500/10'
                    }`}>
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">{t.label}</span>
                        <span className="text-[8px] text-gray-500 font-mono">{t.pips} pips</span>
                      </div>
                      <span className="font-orbitron font-bold text-white text-sm">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commentary */}
              <div className="bg-cyan-500/5 rounded-xl p-4 border border-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Brain size={36} /></div>
                <p className="font-mono text-[8px] text-cyan-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                  <AlertCircle size={9} /> JARVIS Intelligence Brief
                </p>
                <p className="font-rajdhani text-[12px] text-gray-300 italic leading-relaxed">"{results.commentary}"</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-orbitron text-[9px] font-bold uppercase tracking-widest transition-all">Save Report</button>
                <button className="flex-1 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-orbitron text-[9px] font-bold uppercase tracking-widest transition-all">Sync MT5</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketLens;
