
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Sparkles, Zap, StopCircle } from 'lucide-react';
import { speakJarvis, stopJarvis } from '../services/voiceService';
import { queryJarvisWebhook, isInventoryQuery } from '../services/webhookService';

interface JarvisVocalInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccountBalance?: number;
}

const JarvisVocalInterface: React.FC<JarvisVocalInterfaceProps> = ({ isOpen, onClose, activeAccountBalance }) => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('READY TO ASSIST');
  const [waves, setWaves] = useState<number[]>(new Array(20).fill(0));
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [textInput, setTextInput] = useState('');

  // Refs for stable access inside async callbacks
  const isActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Helper to (re)start recognition safely
  const restartListening = (recog: any) => {
    if (!isActiveRef.current) return;
    setTimeout(() => {
      if (!isActiveRef.current) return;
      try {
        recog.start();
        setIsListening(true);
        setStatus('LISTENING...');
      } catch (e) {
        // Already running — ignore
      }
    }, 350);
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = async (event: any) => {
        const command = event.results[0][0].transcript;
        isProcessingRef.current = true;
        setTranscript(command);
        setStatus(`PROCESSING: "${command}"`);
        setIsListening(false);

        await handleVoiceCommand(command);

        isProcessingRef.current = false;
        // Restart loop if session still active
        restartListening(recognitionInstance);
      };

      recognitionInstance.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal timeout — silently keep listening
          setStatus('LISTENING...');
          return;
        }
        if (event.error === 'aborted') {
          // Intentional stop — do nothing
          return;
        }

        console.error('Speech recognition error:', event.error);

        if (event.error === 'network') {
          setStatus('OFFLINE — CHECK CONNECTION');
          setTimeout(() => isActiveRef.current && setStatus('LISTENING...'), 4000);
        } else if (event.error === 'not-allowed') {
          setStatus('MICROPHONE ACCESS DENIED');
          isActiveRef.current = false;
          setIsActive(false);
        } else {
          setStatus('VOICE ERROR - RETRYING...');
          setTimeout(() => isActiveRef.current && setStatus('LISTENING...'), 2000);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        // If session is active and we're not mid-processing, keep looping
        if (isActiveRef.current && !isProcessingRef.current) {
          restartListening(recognitionInstance);
        }
      };

      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    } else {
      setSpeechSupported(false);
      setStatus('TEXT MODE — SPEECH NOT SUPPORTED IN THIS BROWSER');
    }
  }, []);

  // Handle voice commands
  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();

    // ── Local hard-coded commands ──────────────────────────────────────────
    if (lowerCommand.includes('stop') || lowerCommand.includes('shut down') || lowerCommand.includes('goodbye')) {
      await speakJarvis('Understood sir. Shutting down vocal interface. Goodbye.', 'sophisticated');
      setStatus('SESSION TERMINATED');
      isActiveRef.current = false;
      setIsActive(false);
      return;
    }

    if (lowerCommand.includes('hello') || lowerCommand.includes('hi jarvis')) {
      await speakJarvis('Hello sir. All systems are online and ready. How may I assist you today?', 'encouraging');
      setStatus('COMMAND EXECUTED');
      return;
    }

    if ((lowerCommand.includes('balance') || lowerCommand.includes('my account')) && !lowerCommand.includes('sheet') && !lowerCommand.includes('data')) {
      const response = `Current account balance is ${activeAccountBalance?.toFixed(2) || 'not available'} dollars.`;
      await speakJarvis(response, 'sophisticated');
      setStatus('COMMAND EXECUTED');
      return;
    }

    // ── All other queries → n8n webhook (Google Sheets inventory) ───────────────────
    if (isInventoryQuery(command)) {
      setStatus('CHECKING INVENTORY...');
    } else {
      setStatus('QUERYING DATA SOURCE...');
    }

    const webhookReply = await queryJarvisWebhook(command);

    if (webhookReply) {
      await speakJarvis(webhookReply, 'sophisticated');
      setStatus('COMMAND EXECUTED');
    } else {
      await speakJarvis('I was unable to retrieve that information from the inventory system at the moment, sir. Please try again.', 'alert');
      setStatus('WEBHOOK UNAVAILABLE');
    }
  };

  // Text command fallback
  const handleTextCommand = async () => {
    if (!textInput.trim()) return;
    const command = textInput.trim();
    setTranscript(command);
    setStatus(`PROCESSING: "${command}"`);
    setTextInput('');
    await handleVoiceCommand(command);
  };

  // Start session: speak greeting then enter continuous listen loop
  const initiateVoiceCommand = async () => {
    if (!recognition) {
      setStatus('TEXT MODE — TYPE A COMMAND BELOW');
      return;
    }

    isActiveRef.current = true;
    isProcessingRef.current = false;
    setIsActive(true);
    setTranscript('');

    if (!navigator.onLine) {
      setStatus('OFFLINE — USING LOCAL VOICE');
    } else {
      setStatus('INITIALIZING JARVIS...');
    }

    // Speak greeting and wait for audio to finish
    await speakJarvis(
      'Hello sir. I am JARVIS, your intelligent assistant. All systems are online and operational. I am ready to help with your church, business, or any other needs. I am now listening continuously. How may I assist you today?',
      'sophisticated'
    );

    // Begin continuous listen loop
    if (isActiveRef.current) {
      try {
        recognition.start();
        setIsListening(true);
        setStatus('LISTENING...');
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  // Stop session
  const stopVoiceSession = () => {
    isActiveRef.current = false;
    isProcessingRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setStatus('SESSION TERMINATED');
    stopJarvis(); // cut audio immediately
    try { recognition?.stop(); } catch (e) {}
    setTimeout(() => setStatus('READY TO ASSIST'), 2000);
  };

  // Simulate audio visualization
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setWaves(prev => prev.map(() => (isListening || isActive) ? Math.random() * 100 : Math.random() * 20));
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, isListening, isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <button 
        onClick={() => { stopVoiceSession(); onClose(); }}
        className="absolute top-8 right-8 p-3 glass rounded-full text-gray-400 hover:text-white transition-all"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col items-center gap-12 max-w-2xl w-full px-6">
        {/* Arc Reactor Visualizer */}
        <div className="relative">
          <div className="w-64 h-64 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin-slow opacity-40"></div>
            <div className="absolute inset-4 rounded-full border-b-4 border-blue-500 animate-reverse-spin-slow opacity-40"></div>
            
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.4)] transition-transform duration-500 ${(isListening || isActive) ? 'scale-110' : 'scale-100'}`}>
              <Sparkles size={48} className="text-white animate-pulse" />
            </div>
          </div>

          {/* Audio Bars */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12">
            {waves.map((h, i) => (
              <div 
                key={i} 
                className="w-1 bg-cyan-400 transition-all duration-75 rounded-t-full"
                style={{ height: `${h}%`, opacity: 0.2 + (h/100) }}
              ></div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="font-orbitron text-3xl font-bold tracking-widest text-white neon-text-blue">JARVIS VOCAL SYSTEM</h2>
          <p className="font-mono text-cyan-400 text-sm tracking-widest animate-pulse">{status}</p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          {!speechSupported && (
            <div className="w-full flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextCommand()}
                placeholder="Type a command and press Enter..."
                className="flex-1 bg-black/60 border border-cyan-500/40 rounded-xl px-4 py-3 text-cyan-300 font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleTextCommand}
                disabled={!textInput.trim()}
                className="px-6 py-3 bg-cyan-500 text-black rounded-xl font-orbitron font-bold hover:bg-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                SEND
              </button>
            </div>
          )}
          <div className="flex gap-6">
          {!isActive ? (
            <button
              onClick={initiateVoiceCommand}
              disabled={!speechSupported}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-orbitron font-bold transition-all ${
                !speechSupported
                  ? 'opacity-40 cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:bg-cyan-400'
              }`}
            >
              <Mic size={20} />
              {speechSupported ? 'INITIATE VOICE COMMAND' : 'VOICE UNAVAILABLE'}
            </button>
          ) : (
            <button
              onClick={stopVoiceSession}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-orbitron font-bold bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:bg-red-500 transition-all animate-pulse"
            >
              <StopCircle size={20} />
              {isListening ? 'LISTENING... — STOP SESSION' : 'STOP SESSION'}
            </button>
          )}
          
          <button 
            onClick={() => speakJarvis("Market analysis complete. No significant threats detected at this level. Stay sharp, sir!", "alert")}
            className="flex items-center gap-3 px-8 py-4 glass border-cyan-500/30 text-cyan-400 rounded-2xl font-orbitron font-bold hover:bg-cyan-500/10 transition-all"
          >
            <Zap size={20} />
            QUICK STATUS
          </button>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl w-full border-cyan-500/20 text-center space-y-4">
          {transcript && (
            <div className="mb-4">
              <p className="text-xs font-rajdhani text-gray-400 uppercase tracking-widest mb-2">Voice Input Detected</p>
              <p className="text-sm font-mono text-cyan-400">"{transcript}"</p>
            </div>
          )}
          <p className="text-xs font-rajdhani text-gray-400 uppercase tracking-widest mb-2">Vocal Identity</p>
          <div className="flex items-center justify-center gap-4">
            <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-[10px] font-mono text-cyan-400 border border-cyan-500/20">FEMALE (REFINED)</span>
            <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-[10px] font-mono text-cyan-400 border border-cyan-500/20">EMOTION ENGINE: ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JarvisVocalInterface;
