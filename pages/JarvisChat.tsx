
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Trash2, Bot, User, Sparkles, TrendingUp, Radar, BarChart2, Volume2 } from 'lucide-react';
import { Message } from '../types';
import { speakJarvis } from '../services/voiceService';

const JarvisChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'JARVIS', text: 'Good afternoon, sir. How may I assist you with your trading today?', timestamp: new Date() }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [vocalEnabled, setVocalEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'USER', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(async () => {
      let responseText = "I'm analyzing the markets for you, sir.";
      const lowInput = input.toLowerCase();
      
      if (lowInput.includes('scan')) {
        responseText = "Running comprehensive scan... I've detected a high-probability setup on Volatility 75! Confidence is high, sir.";
      } else if (lowInput.includes('deriv') || lowInput.includes('balance')) {
        responseText = "Your Deriv accounts are synced. Total equity across accounts is looking healthy.";
      }

      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'JARVIS', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);

      if (vocalEnabled) {
        speakJarvis(responseText);
      }
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col glass rounded-2xl overflow-hidden border-cyan-500/20 animate-in fade-in duration-500">
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/30">
            <Bot className="text-cyan-400" />
          </div>
          <div>
             <h2 className="font-orbitron text-sm text-cyan-400 leading-none">JARVIS AI ASSISTANT</h2>
             <span className="text-[10px] font-mono text-green-500 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> VOCAL PROTOCOLS ACTIVE
             </span>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setVocalEnabled(!vocalEnabled)}
            className={`p-2 rounded-lg transition-all ${vocalEnabled ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500 hover:text-white'}`}
           >
             <Volume2 size={18} />
           </button>
           <button onClick={() => setMessages([])} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'USER' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-cyan-500/20 border-cyan-500/50'
              }`}>
                {msg.sender === 'USER' ? <User size={14} className="text-blue-400" /> : <Sparkles size={14} className="text-cyan-400" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm font-rajdhani leading-relaxed shadow-lg ${
                msg.sender === 'USER' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
        <div className="flex gap-4">
          <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-cyan-400 transition-all">
            <Mic size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="System command input..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-rajdhani focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <button 
            onClick={handleSend}
            className="p-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-all neon-glow"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JarvisChat;
