
import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Search, Crosshair, AlertCircle, CheckCircle2, Cpu, Brain, Sparkles, RefreshCw } from 'lucide-react';
import { speakJarvis } from '../services/voiceService';

const MarketLens: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const mockResults = {
      asset: "IDENTIFIED: XAUUSD (Gold)",
      timeframe: "H1 / Hourly",
      sentiment: "BULLISH BIAS",
      confidence: "87.4%",
      patterns: ["Falling Wedge Breakout", "Double Bottom Support", "Bullish Divergence (RSI)"],
      targets: [
        { label: "Take Profit 1", value: "2055.40" },
        { label: "Take Profit 2", value: "2068.10" },
        { label: "Stop Loss", value: "2038.50" }
      ],
      commentary: "Structural analysis indicates a successful retest of the order block at 2042.00. Institutional buy volume is building. Recommend looking for long entries on the next retracement, sir."
    };

    setResults(mockResults);
    setIsAnalyzing(false);
    speakJarvis(`Analysis complete, sir. I've identified a ${mockResults.sentiment} setup with ${mockResults.confidence} confidence. Stand by for detailed targets.`, 'sophisticated');
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">AI Confidence</p>
                  <p className="text-2xl font-orbitron font-black text-cyan-400">{results.confidence}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Risk Rating</p>
                  <p className="text-2xl font-orbitron font-black text-purple-400">LOW</p>
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

              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="font-orbitron text-xs font-bold text-gray-300 uppercase">Tactical Targets</h4>
                <div className="grid grid-cols-1 gap-2">
                  {results.targets.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-colors">
                      <span className="text-xs font-mono text-gray-400 group-hover:text-cyan-400 transition-colors uppercase">{t.label}</span>
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
