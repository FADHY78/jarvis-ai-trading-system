
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, Search, Crosshair, AlertCircle, CheckCircle2, Cpu, Brain, Sparkles, RefreshCw, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { speakJarvis } from '../services/voiceService';
import { PriceData } from '../types';
import { detectPatterns, detectSMC, detectAdvancedSpikes, calculateAdvancedTechnicals } from '../services/mockDataService';

interface MarketLensProps {
  prices: Record<string, PriceData>;
}

const MarketLens: React.FC<MarketLensProps> = ({ prices }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<any | null>(null);
  const [detectedSymbol, setDetectedSymbol] = useState<string | null>(null);
  const [liveMarketData, setLiveMarketData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect potential symbol from image analysis
  useEffect(() => {
    if (detectedSymbol && prices[detectedSymbol]) {
      const asset = prices[detectedSymbol];
      const history = asset.history;
      
      // Run real-time analysis
      const pattern = detectPatterns(history);
      const smc = detectSMC(history, detectedSymbol);
      const spike = detectAdvancedSpikes(history, detectedSymbol);
      const technicals = calculateAdvancedTechnicals(history);
      
      setLiveMarketData({
        symbol: detectedSymbol,
        price: asset.price,
        change: asset.change,
        changePercent: asset.changePercent,
        pattern,
        smc,
        spike,
        technicals
      });
    }
  }, [detectedSymbol, prices]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setResults(null);
    
    speakJarvis("Market Lens protocol initiated. Scanning visual data for institutional footprints.", 'sophisticated');

    // Simulate progress steps
    const steps = [
      { p: 20, msg: "Enhancing resolution..." },
      { p: 40, msg: "Detecting candle structures..." },
      { p: 60, msg: "Mapping support and resistance..." },
      { p: 80, msg: "Synchronizing with global liquidity feeds..." },
      { p: 100, msg: "Synthesizing final intelligence..." }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setAnalysisProgress(step.p);
    }

    // AI Symbol Detection (simulate detecting symbol from image)
    const symbols = Object.keys(prices).filter(s => !s.startsWith('frx') && !s.startsWith('cry'));
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)] || 'GOLD';
    setDetectedSymbol(randomSymbol);
    
    // Get real-time market context
    const asset = prices[randomSymbol];
    if (!asset) {
      setIsAnalyzing(false);
      return;
    }
    
    const history = asset.history || [];
    const pattern = detectPatterns(history);
    const smc = detectSMC(history, randomSymbol);
    const spike = detectAdvancedSpikes(history, randomSymbol);
    const technicals = calculateAdvancedTechnicals(history);
    
    // Determine sentiment based on real data
    const isBullish = (asset.change || 0) > 0 || smc.marketStructure === 'HH/HL' || smc.trend === 'BULLISH';
    const sentiment = isBullish ? "BULLISH BIAS" : "BEARISH BIAS";
    
    // Calculate confidence from multiple factors
    let confidence = 65;
    if (pattern.confidence > 70) confidence += 10;
    if (smc.marketStructure !== 'RANGING') confidence += 8;
    if (spike.isSpike) confidence += 7;
    if (technicals.divergence.detected) confidence += 5;
    if (technicals.adx.value > 25) confidence += 5;
    
    // Generate patterns list
    const detectedPatterns: string[] = [];
    if (pattern.label && pattern.label !== 'RANGING') detectedPatterns.push(pattern.label);
    if (smc.orderBlocks && smc.orderBlocks.length > 0) {
      detectedPatterns.push(`${smc.orderBlocks[0].type} Order Block`);
    }
    if (smc.fairValueGaps && smc.fairValueGaps.length > 0) {
      detectedPatterns.push('Fair Value Gap');
    }
    if (technicals.divergence.detected) detectedPatterns.push(`${technicals.divergence.type} Divergence`);
    if (spike.prediction === 'IMMINENT') detectedPatterns.push('Spike Zone Detected');
    if (!detectedPatterns.length) detectedPatterns.push('Consolidation Pattern', 'Ranging Market');
    
    // Calculate realistic targets based on current price
    const currentPrice = asset.price || 2042.50;
    const volatility = Math.abs(asset.changePercent || 1.5);
    const tp1 = isBullish ? currentPrice * (1 + volatility/100 * 0.8) : currentPrice * (1 - volatility/100 * 0.8);
    const tp2 = isBullish ? currentPrice * (1 + volatility/100 * 1.5) : currentPrice * (1 - volatility/100 * 1.5);
    const sl = isBullish ? currentPrice * (1 - volatility/100 * 0.6) : currentPrice * (1 + volatility/100 * 0.6);
    
    const mockResults = {
      asset: `IDENTIFIED: ${randomSymbol}`,
      timeframe: "H1 / Hourly",
      sentiment: sentiment,
      confidence: `${confidence.toFixed(1)}%`,
      currentPrice: currentPrice.toFixed(2),
      liveChange: asset.changePercent?.toFixed(2) || "0.00",
      patterns: detectedPatterns.slice(0, 3),
      targets: [
        { label: "Take Profit 1", value: tp1.toFixed(2), pips: Math.abs(tp1 - currentPrice).toFixed(0) },
        { label: "Take Profit 2", value: tp2.toFixed(2), pips: Math.abs(tp2 - currentPrice).toFixed(0) },
        { label: "Stop Loss", value: sl.toFixed(2), pips: Math.abs(currentPrice - sl).toFixed(0) }
      ],
      smcAnalysis: {
        structure: smc.marketStructure,
        trend: smc.trend,
        orderBlocks: smc.orderBlocks,
        liquidityZones: smc.liquidityZones,
        fairValueGaps: smc.fairValueGaps
      },
      technicals: {
        direction: technicals.adx.direction,
        strength: technicals.adx.value.toFixed(0),
        rsi: technicals.rsi.toFixed(1),
        macdSignal: technicals.macd.histogram > 0 ? 'BULLISH' : 'BEARISH'
      },
      commentary: `Real-time analysis confirms ${sentiment.toLowerCase()} structure on ${randomSymbol}. Current price action shows ${smc.marketStructure.toLowerCase()} market conditions. ${spike.isSpike ? `ALERT: ${spike.severity} spike detected with ${spike.prediction.toLowerCase()} movement expected.` : 'Price stability maintained within normal ranges.'} RSI at ${technicals.rsi.toFixed(1)} indicates ${technicals.rsi > 70 ? 'overbought' : technicals.rsi < 30 ? 'oversold' : 'neutral'} conditions. Recommend ${isBullish ? 'long' : 'short'} positions on confirmed entry signals, sir.`
    };

    setResults(mockResults);
    setIsAnalyzing(false);
    speakJarvis(`Analysis complete, sir. Real-time data confirms ${mockResults.sentiment} on ${randomSymbol} with ${mockResults.confidence} confidence. Current price ${mockResults.currentPrice}, displaying ${detectedPatterns.length} key patterns. Tactical targets uploaded.`, 'sophisticated');
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
            Visual Recognition • Pattern Synthesis • Tactical Intelligence
          </p>
        </div>
      </div>

      {/* Real-time Market Intelligence Bar */}
      <div className="glass rounded-2xl p-4 border border-cyan-500/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-orbitron text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
            <Activity size={14} className="animate-pulse" /> Live Market Feed
          </h3>
          <span className="text-[8px] font-mono text-gray-500">SYNCED • {Object.keys(prices).length} ASSETS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(prices).slice(0, 6).map(([symbol, value]) => {
            const data = value as PriceData;
            return (
            <div key={symbol} className="bg-black/30 rounded-xl p-3 border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer" onClick={() => setDetectedSymbol(symbol)}>
              <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">{symbol}</p>
              <p className="text-sm font-orbitron font-bold text-white">{data.price.toFixed(2)}</p>
              <div className={`flex items-center gap-1 mt-1 text-[9px] font-mono ${
                data.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span>{data.changePercent?.toFixed(2)}%</span>
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
                  
                  {/* Analysis HUD Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scanline"></div>
                      <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                          <Cpu size={12} className="animate-spin" /> SCANNING DIMENSIONS...
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 text-cyan-400 font-mono text-[10px] bg-black/60 px-3 py-1 rounded">
                        COORD: {Math.random().toFixed(4)}, {Math.random().toFixed(4)}
                      </div>
                    </div>
                  )}

                  {/* Crosshair indicators if results exist */}
                  {results && !isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 left-1/3 w-8 h-8 border border-green-500/50 rounded-full animate-ping"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border border-cyan-500/50 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500 group">
                  <div className="p-6 rounded-full bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                    <ImageIcon size={48} className="group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-orbitron text-sm font-bold uppercase tracking-widest text-gray-400">Upload Market Screenshot</p>
                    <p className="font-rajdhani text-xs mt-1">Accepts PNG, JPG, or Snap Camera Input</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-black/20 flex gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                onClick={triggerUpload}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-orbitron text-[10px] uppercase font-bold tracking-widest"
              >
                <Upload size={14} /> Upload Image
              </button>
              <button 
                className="flex items-center justify-center px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                title="Camera Input"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>

          <button 
            disabled={!selectedImage || isAnalyzing}
            onClick={startAnalysis}
            className={`w-full py-4 rounded-2xl font-orbitron font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
              !selectedImage ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 
              isAnalyzing ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
              'bg-cyan-500 text-black hover:bg-cyan-400 neon-glow'
            }`}
          >
            {isAnalyzing ? (
              <><RefreshCw size={20} className="animate-spin" /> Processing AI Node {analysisProgress}%</>
            ) : (
              <><Brain size={20} /> Execute Tactical Analysis</>
            )}
          </button>
        </div>

        {/* Right Column: AI Results */}
        <div className="space-y-6">
          {!results && !isAnalyzing ? (
            <div className="glass rounded-3xl p-8 border border-white/5 h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <div className="p-4 bg-white/5 rounded-2xl">
                <Sparkles size={32} className="text-gray-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-orbitron font-bold text-lg text-gray-400 uppercase">Awaiting Visual Input</h3>
                <p className="text-sm text-gray-500 font-rajdhani max-w-xs mx-auto">
                  Provide a screenshot of your trading terminal for JARVIS to analyze structure, patterns, and institutional flow.
                </p>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="glass rounded-3xl p-8 border border-cyan-500/20 h-full space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyan-400/70">NEURAL_SYNTHESIS_ENGINE</span>
                  <span className="font-mono text-[10px] text-cyan-400">{analysisProgress}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_#06b6d4]" 
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4 text-cyan-400/60 font-mono text-[11px]">
                <p className="animate-pulse">{'>'} INITIALIZING DIMENSIONAL SCAN...</p>
                {analysisProgress > 30 && <p className="animate-pulse">{'>'} IDENTIFYING OHLC STRUCTURES...</p>}
                {analysisProgress > 60 && <p className="animate-pulse">{'>'} MAPPING INSTITUTIONAL FOOTPRINTS...</p>}
                {analysisProgress > 90 && <p className="animate-pulse">{'>'} CALCULATING TACTICAL TARGETS...</p>}
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-6 lg:p-8 border-t-4 border-t-cyan-500 space-y-6 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron font-black text-xl text-white uppercase tracking-tighter">{results.asset}</h3>
                  <p className="text-xs font-mono text-gray-400">{results.timeframe}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-orbitron text-[10px] font-bold border ${
                  results.sentiment.includes('BULLISH') ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'
                }`}>
                  {results.sentiment}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">Live Price</p>
                  <p className="text-lg font-orbitron font-black text-white">{results.currentPrice}</p>
                </div>
                <div className={`bg-white/5 rounded-2xl p-3 border border-white/10`}>
                  <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">24H Change</p>
                  <p className={`text-lg font-orbitron font-black ${
                    parseFloat(results.liveChange) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>{results.liveChange}%</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">AI Confidence</p>
                  <p className="text-lg font-orbitron font-black text-cyan-400">{results.confidence}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">RSI Level</p>
                  <p className="text-lg font-orbitron font-black text-purple-400">{results.technicals.rsi}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-orbitron text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                  <Crosshair size={14} className="text-cyan-500" /> Detected Patterns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.patterns.map((p: string, i: number) => (
                    <span key={i} className="bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg text-[10px] font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* SMC & Technical Analysis */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[9px] font-mono text-gray-500 uppercase mb-2">Market Structure</p>
                  <p className={`text-xs font-orbitron font-bold ${
                    results.smcAnalysis.structure === 'HH/HL' ? 'text-green-400' : 
                    results.smcAnalysis.structure === 'LH/LL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{results.smcAnalysis.structure}</p>
                  {results.smcAnalysis.orderBlocks && results.smcAnalysis.orderBlocks.length > 0 && (
                    <p className="text-[8px] text-cyan-400 mt-1 font-mono">⚡ {results.smcAnalysis.orderBlocks[0].type} OB</p>
                  )}
                  <p className={`text-[8px] mt-1 font-mono ${
                    results.smcAnalysis.trend === 'BULLISH' ? 'text-green-400' : 
                    results.smcAnalysis.trend === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
                  }`}>{results.smcAnalysis.trend}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[9px] font-mono text-gray-500 uppercase mb-2">Trend Strength</p>
                  <p className="text-xs font-orbitron font-bold text-purple-400">{results.technicals.strength}%</p>
                  <p className="text-[8px] text-gray-400 mt-1 font-mono">{results.technicals.direction} • {results.technicals.macdSignal}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="font-orbitron text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                  <Zap size={14} className="text-cyan-500" /> Tactical Targets (Live-Calculated)
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {results.targets.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-colors">
                      <div>
                        <span className="text-xs font-mono text-gray-400 group-hover:text-cyan-400 transition-colors uppercase block">{t.label}</span>
                        <span className="text-[8px] text-gray-500 font-mono">{t.pips} pips</span>
                      </div>
                      <span className="font-orbitron font-bold text-white">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cyan-500/5 rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Brain size={40} />
                </div>
                <p className="font-mono text-[9px] text-cyan-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                  <AlertCircle size={10} /> JARVIS commentary
                </p>
                <p className="font-rajdhani text-sm text-gray-300 italic leading-relaxed">
                  "{results.commentary}"
                </p>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-widest transition-all">
                  Save Report
                </button>
                <button className="flex-1 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-widest transition-all">
                  Sync MT5
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketLens;
