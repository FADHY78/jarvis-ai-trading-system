
import React, { useState, useEffect } from 'react';
import { Brain, Radar, Zap, Activity, TrendingUp, AlertTriangle, Target, Sparkles, Play, Pause, RefreshCw, Cpu, Database, Eye, Waves } from 'lucide-react';
import { PriceData } from '../types';
import { detectPatterns, detectSMC, detectAdvancedSpikes, calculateAdvancedTechnicals, analyzeElliottWaves } from '../services/mockDataService';
import { speakJarvis } from '../services/voiceService';

interface JarvisControlCenterProps {
  prices: Record<string, PriceData>;
}

const JarvisControlCenter: React.FC<JarvisControlCenterProps> = ({ prices }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [deepScanActive, setDeepScanActive] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [autoScan, setAutoScan] = useState(false);

  // Auto-scan every 30 seconds when enabled
  useEffect(() => {
    if (autoScan) {
      const interval = setInterval(() => {
        handleDeepDive();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoScan, prices]);

  const handleDeepDive = async () => {
    setIsScanning(true);
    setDeepScanActive(true);
    setScanProgress(0);
    
    speakJarvis("Initiating deep market analysis protocol. Scanning all dimensional layers, sir.", 'sophisticated');

    const results: any[] = [];
    const assets = Object.values(prices) as PriceData[];
    const increment = 100 / assets.length;

    for (let i = 0; i < assets.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const asset = assets[i];
      const history = asset.history;
      
      // Comprehensive analysis
      const pattern = detectPatterns(history);
      const smc = detectSMC(history, asset.symbol);
      const spike = detectAdvancedSpikes(history, asset.symbol);
      const technicals = calculateAdvancedTechnicals(history);
      const waves = analyzeElliottWaves(history);

      // Calculate threat level
      let threatLevel = 0;
      if (spike.isSpike && spike.severity === 'EXTREME') threatLevel += 40;
      else if (spike.isSpike && spike.severity === 'CRITICAL') threatLevel += 30;
      else if (spike.prediction === 'IMMINENT') threatLevel += 25;
      
      if (smc.marketStructure !== 'RANGING') threatLevel += 15;
      if (technicals.divergence.detected) threatLevel += 20;
      if (waves.waveCount.includes('IMPULSE')) threatLevel += 15;

      results.push({
        symbol: asset.symbol,
        price: asset.price,
        pattern,
        smc,
        spike,
        technicals,
        waves,
        threatLevel: Math.min(100, threatLevel),
        priority: threatLevel > 50 ? 'HIGH' : threatLevel > 25 ? 'MEDIUM' : 'LOW'
      });

      setScanProgress(Math.round((i + 1) * increment));
    }

    // Sort by threat level
    results.sort((a, b) => b.threatLevel - a.threatLevel);
    setAnalysisResults(results);
    setScanProgress(100);
    
    setTimeout(() => {
      setIsScanning(false);
      setDeepScanActive(false);
      
      const highPriority = results.filter(r => r.priority === 'HIGH').length;
      if (highPriority > 0) {
        speakJarvis(`Analysis complete. ${highPriority} high-priority opportunities detected. Standing by for your command, sir.`, 'sophisticated');
      } else {
        speakJarvis("Deep scan complete. All markets analyzed. Systems nominal.", 'sophisticated');
      }
    }, 500);
  };

  const handleQuickScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    speakJarvis("Executing quick market scan. All systems engaged.", 'sophisticated');

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          speakJarvis("Quick scan complete. Market intelligence updated.", 'sophisticated');
          return 100;
        }
        return prev + 8;
      });
    }, 100);
  };

  const getAssetDetails = (symbol: string) => {
    return analysisResults.find(r => r.symbol === symbol);
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500 pb-12">
      {/* JARVIS Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-orbitron text-2xl lg:text-3xl text-cyan-400 flex items-center gap-3 lg:gap-4 font-black tracking-tighter uppercase">
            <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-500 animate-pulse" /> 
            JARVIS Control Center
          </h1>
          <p className="text-[10px] lg:text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] font-bold">
            <span className="hidden lg:inline">AUTONOMOUS MARKET INTELLIGENCE • DEEP ANALYSIS PROTOCOL V12.0</span>
            <span className="lg:hidden">AI CONTROL • V12.0</span>
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass rounded-2xl lg:rounded-3xl p-5 lg:p-8 border-t-4 border-t-cyan-500 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-20 bg-cyan-500"></div>
        
        <div className="relative z-10 space-y-6">
          {/* Status Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 pb-6 border-b border-cyan-500/20">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${isScanning ? 'from-green-500 to-cyan-500 animate-pulse' : 'from-cyan-500 to-blue-600'} p-1`}>
                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                  <Cpu size={24} className="lg:w-8 lg:h-8 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg lg:text-xl text-white">
                  {isScanning ? 'SCANNING...' : 'SYSTEMS READY'}
                </h3>
                <p className="text-xs lg:text-sm font-mono text-gray-400">
                  {isScanning ? `PROGRESS: ${scanProgress}%` : 'Awaiting Command'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-[10px] font-mono text-gray-500 uppercase">Scan Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${autoScan ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <p className="text-xs font-bold text-white font-mono">{autoScan ? 'AUTO' : 'MANUAL'}</p>
                </div>
              </div>
              <button
                onClick={() => setAutoScan(!autoScan)}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-orbitron text-[10px] lg:text-xs font-bold transition-all ${
                  autoScan 
                    ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400 hover:bg-green-500/30' 
                    : 'bg-white/5 border-2 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {autoScan ? <><Pause size={14} className="inline mr-1 lg:mr-2" /> AUTO</> : <><Play size={14} className="inline mr-1 lg:mr-2" /> MANUAL</>}
              </button>
            </div>
          </div>

          {/* Scan Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <button
              onClick={handleQuickScan}
              disabled={isScanning}
              className="glass bg-cyan-500/10 hover:bg-cyan-500/20 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Radar size={24} className="lg:w-7 lg:h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <h4 className="font-orbitron font-bold text-base lg:text-lg text-white">Quick Scan</h4>
                  <p className="text-[10px] lg:text-xs font-mono text-gray-400">Surface Analysis • 10s</p>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-300 font-rajdhani">
                Rapid market overview with basic pattern recognition and SMC analysis
              </p>
            </button>

            <button
              onClick={handleDeepDive}
              disabled={isScanning}
              className="glass bg-purple-500/10 hover:bg-purple-500/20 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 border-purple-500/30 hover:border-purple-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Database size={24} className="lg:w-7 lg:h-7 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <h4 className="font-orbitron font-bold text-base lg:text-lg text-white">Deep Dive</h4>
                  <p className="text-[10px] lg:text-xs font-mono text-gray-400">Full Analysis • 15-20s</p>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-300 font-rajdhani">
                Complete market intelligence: Elliott Waves, Harmonics, SMC, Spikes, Technicals
              </p>
            </button>
          </div>

          {/* Progress Bar */}
          {isScanning && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-mono text-cyan-400">
                <span>{deepScanActive ? 'DEEP ANALYSIS IN PROGRESS' : 'SCANNING'}</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 relative"
                  style={{ width: `${scanProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="glass rounded-2xl lg:rounded-3xl overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-cyan-500/10 bg-white/5 flex items-center justify-between">
            <h2 className="font-orbitron text-sm lg:text-base text-cyan-400 flex items-center gap-2 lg:gap-3">
              <Activity size={16} className="lg:w-5 lg:h-5" /> 
              <span className="hidden sm:inline">DEEP ANALYSIS RESULTS</span>
              <span className="sm:hidden">RESULTS</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">{analysisResults.length} ASSETS SCANNED</span>
          </div>

          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
            {analysisResults.map((result) => (
              <div
                key={result.symbol}
                className="p-4 lg:p-6 hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => setSelectedAsset(selectedAsset === result.symbol ? null : result.symbol)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${
                      result.priority === 'HIGH' ? 'from-red-500 to-orange-500' :
                      result.priority === 'MEDIUM' ? 'from-yellow-500 to-orange-500' :
                      'from-green-500 to-cyan-500'
                    } p-0.5`}>
                      <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                        <Target size={18} className="lg:w-5 lg:h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-base lg:text-lg text-white">{result.symbol}</h3>
                      <p className="text-xs lg:text-sm font-mono text-cyan-400">{result.price.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-gray-500 uppercase">Threat Level</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-full h-2 bg-white/5 rounded-full overflow-hidden`} style={{ width: '60px' }}>
                          <div 
                            className={`h-full ${
                              result.threatLevel > 66 ? 'bg-red-500' :
                              result.threatLevel > 33 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${result.threatLevel}%` }}
                          ></div>
                        </div>
                        <span className={`font-mono text-sm font-bold ${
                          result.threatLevel > 66 ? 'text-red-400' :
                          result.threatLevel > 33 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>{result.threatLevel}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold ${
                      result.priority === 'HIGH' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
                      result.priority === 'MEDIUM' ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' :
                      'bg-green-500/20 border border-green-500/50 text-green-400'
                    }`}>
                      {result.priority}
                    </span>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-3">
                  <div className="glass bg-white/[0.02] p-2 lg:p-3 rounded-lg">
                    <p className="text-[8px] lg:text-[9px] font-mono text-gray-500 uppercase mb-1">Pattern</p>
                    <p className="text-[10px] lg:text-xs font-bold text-purple-400 truncate">{result.pattern.label}</p>
                  </div>
                  <div className="glass bg-white/[0.02] p-2 lg:p-3 rounded-lg">
                    <p className="text-[8px] lg:text-[9px] font-mono text-gray-500 uppercase mb-1">SMC</p>
                    <p className="text-[10px] lg:text-xs font-bold text-cyan-400 truncate">{result.smc.signal}</p>
                  </div>
                  <div className="glass bg-white/[0.02] p-2 lg:p-3 rounded-lg">
                    <p className="text-[8px] lg:text-[9px] font-mono text-gray-500 uppercase mb-1">Wave</p>
                    <p className="text-[10px] lg:text-xs font-bold text-blue-400 truncate">{result.waves.waveCount}</p>
                  </div>
                  <div className="glass bg-white/[0.02] p-2 lg:p-3 rounded-lg">
                    <p className="text-[8px] lg:text-[9px] font-mono text-gray-500 uppercase mb-1">Spike</p>
                    <p className={`text-[10px] lg:text-xs font-bold truncate ${result.spike.isSpike ? 'text-orange-400' : 'text-gray-400'}`}>
                      {result.spike.isSpike ? result.spike.severity : 'NONE'}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAsset === result.symbol && (
                  <div className="mt-4 p-4 lg:p-6 glass rounded-xl space-y-4 animate-in fade-in">
                    {/* Elliott Wave Details */}
                    {result.waves.wavePersonality.length > 0 && (
                      <div>
                        <h4 className="text-xs font-orbitron text-cyan-400 mb-2 flex items-center gap-2">
                          <Waves size={14} /> ELLIOTT WAVE ANALYSIS
                        </h4>
                        <div className="space-y-2">
                          {result.waves.wavePersonality.map((wp: string, i: number) => (
                            <div key={i} className="text-[10px] lg:text-xs text-gray-300 font-mono flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                              {wp}
                            </div>
                          ))}
                          {result.waves.fibonacciRelationships.map((fr: string, i: number) => (
                            <div key={i} className="text-[10px] lg:text-xs text-purple-300 font-mono flex items-center gap-2">
                              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                              {fr}
                            </div>
                          ))}
                          {result.waves.projection.confidence > 50 && (
                            <div className="mt-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                              <p className="text-xs text-cyan-400 font-mono">
                                WAVE TARGET: {result.waves.projection.target.toFixed(4)} ({result.waves.projection.confidence}% confidence)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Indicators */}
                    <div>
                      <h4 className="text-xs font-orbitron text-cyan-400 mb-2 flex items-center gap-2">
                        <TrendingUp size={14} /> TECHNICAL CONFLUENCE
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="text-[10px] lg:text-xs">
                          <span className="text-gray-500">RSI:</span> 
                          <span className={`ml-2 font-bold ${result.technicals.rsi > 70 ? 'text-red-400' : result.technicals.rsi < 30 ? 'text-green-400' : 'text-cyan-400'}`}>
                            {result.technicals.rsi.toFixed(0)}
                          </span>
                        </div>
                        <div className="text-[10px] lg:text-xs">
                          <span className="text-gray-500">MACD:</span> 
                          <span className="ml-2 font-bold text-cyan-400">{result.technicals.macd.trend}</span>
                        </div>
                        <div className="text-[10px] lg:text-xs">
                          <span className="text-gray-500">ADX:</span> 
                          <span className="ml-2 font-bold text-purple-400">{result.technicals.adx.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analysisResults.length === 0 && !isScanning && (
        <div className="glass p-12 lg:p-16 rounded-3xl text-center">
          <Eye size={48} className="lg:w-16 lg:h-16 mx-auto mb-4 text-cyan-400 opacity-50" />
          <h3 className="font-orbitron text-lg lg:text-xl text-white mb-2">No Analysis Data</h3>
          <p className="text-sm text-gray-400 font-rajdhani mb-6">
            Initiate a scan to begin comprehensive market analysis
          </p>
          <button
            onClick={handleDeepDive}
            className="px-6 lg:px-8 py-3 bg-cyan-500 text-black font-orbitron text-xs lg:text-sm font-bold rounded-xl hover:bg-cyan-400 transition-all neon-glow"
          >
            START DEEP DIVE
          </button>
        </div>
      )}
    </div>
  );
};

export default JarvisControlCenter;
