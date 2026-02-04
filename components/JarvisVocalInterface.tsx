
import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, Sparkles, Zap } from 'lucide-react';
import { speakJarvis } from '../services/voiceService';

interface JarvisVocalInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccountBalance?: number;
}

const JarvisVocalInterface: React.FC<JarvisVocalInterfaceProps> = ({ isOpen, onClose, activeAccountBalance }) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('READY TO ASSIST');
  const [waves, setWaves] = useState<number[]>(new Array(20).fill(0));
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = async (event: any) => {
        const command = event.results[0][0].transcript;
        setTranscript(command);
        setStatus(`PROCESSING: "${command}"`);
        setIsListening(false);
        
        // Process command and respond
        await handleVoiceCommand(command);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Provide user-friendly error messages
        if (event.error === 'network') {
          setStatus('NETWORK ERROR - CHECK CONNECTION');
        } else if (event.error === 'no-speech') {
          setStatus('NO SPEECH DETECTED - TRY AGAIN');
        } else if (event.error === 'aborted') {
          setStatus('VOICE CAPTURE CANCELLED');
        } else if (event.error === 'not-allowed') {
          setStatus('MICROPHONE ACCESS DENIED');
        } else {
          setStatus('VOICE ERROR - TRY AGAIN');
        }
        
        setIsListening(false);
        
        // Auto-reset status after 3 seconds
        setTimeout(() => setStatus('READY TO ASSIST'), 3000);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Handle voice commands
  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Simple command processing
    if (lowerCommand.includes('balance') || lowerCommand.includes('account')) {
      const response = `Current account balance is ${activeAccountBalance?.toFixed(2) || 'not available'} dollars.`;
      await speakJarvis(response, 'sophisticated');
      setStatus('COMMAND EXECUTED');
    } else if (lowerCommand.includes('status') || lowerCommand.includes('market')) {
      await speakJarvis('Market analysis complete. All systems nominal. Monitoring volatility indices.', 'alert');
      setStatus('COMMAND EXECUTED');
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      await speakJarvis('Hello sir. All systems are online and ready. How may I assist you?', 'encouraging');
      setStatus('COMMAND EXECUTED');
    } else {
      await speakJarvis(`Command received: ${command}. Processing request.`, 'sophisticated');
      setStatus('COMMAND EXECUTED');
    }
    
    // Reset status after response
    setTimeout(() => setStatus('READY TO ASSIST'), 3000);
  };

  // Voice command activation
  const initiateVoiceCommand = () => {
    if (!recognition) {
      setStatus('ERROR: SPEECH RECOGNITION NOT SUPPORTED');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setStatus('READY TO ASSIST');
    } else {
      setTranscript('');
      setStatus('LISTENING...');
      setIsListening(true);
      recognition.start();
    }
  };

  // Simulate audio visualization
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setWaves(prev => prev.map(() => isListening ? Math.random() * 100 : Math.random() * 20));
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, isListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <button 
        onClick={onClose}
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
            
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.4)] transition-transform duration-500 ${isListening ? 'scale-110' : 'scale-100'}`}>
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

        <div className="flex gap-6">
          <button 
            onClick={initiateVoiceCommand}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-orbitron font-bold transition-all ${
              isListening ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:bg-cyan-400'
            }`}
          >
            <Mic size={20} />
            {isListening ? 'LISTENING...' : 'INITIATE VOICE COMMAND'}
          </button>
          
          <button 
            onClick={() => speakJarvis("Market analysis complete. No significant threats detected at this level. Stay sharp, sir!", "alert")}
            className="flex items-center gap-3 px-8 py-4 glass border-cyan-500/30 text-cyan-400 rounded-2xl font-orbitron font-bold hover:bg-cyan-500/10 transition-all"
          >
            <Zap size={20} />
            QUICK STATUS
          </button>
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
