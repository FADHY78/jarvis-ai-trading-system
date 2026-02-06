
import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Globe, ChevronDown, Mic, Volume2, Sparkles, Menu, Cpu, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DerivAccount } from '../services/derivService';
import { speakJarvis } from '../services/voiceService';
import { PriceData } from '../types';

interface HeaderProps {
  activeAccount: DerivAccount | null;
  accounts: DerivAccount[];
  onAccountSwitch: (acc: DerivAccount) => void;
  onInitiateVoice: () => void;
  onMenuToggle?: () => void;
  prices: Record<string, PriceData>;
}

const Header: React.FC<HeaderProps> = ({ activeAccount, accounts, onAccountSwitch, onInitiateVoice, onMenuToggle, prices }) => {
  const [time, setTime] = useState(new Date());
  const [showAccountList, setShowAccountList] = useState(false);
  const navigate = useNavigate();

  const isConnected = Object.keys(prices).length > 0;
  const assetCount = Object.keys(prices).filter(s => !s.startsWith('frx') && !s.startsWith('cry')).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerVocalStatus = () => {
    const statusText = `System check complete. Account ${activeAccount?.loginid} is active with a balance of ${activeAccount?.balance?.toFixed(2)} ${activeAccount?.currency}. Markets are appearing volatile today, sir!`;
    speakJarvis(statusText, 'sophisticated');
  };

  return (
    <header className="h-16 px-4 lg:px-8 flex items-center justify-between border-b border-cyan-500/10 bg-black/40 backdrop-blur-md z-[60]">
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
        >
          <Menu size={20} />
        </button>

        <h1 className="font-orbitron font-medium text-xs lg:text-sm tracking-widest text-cyan-400 flex items-center gap-2">
          <Globe size={14} className="animate-spin-slow" />
          <span className="hidden sm:inline">JARVIS AI TRADING SYSTEM</span>
          <span className="sm:hidden">JARVIS</span>
        </h1>
        
        {/* Market Data Connection Indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded border text-[8px] font-mono uppercase tracking-wide ${
          isConnected 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
        }`}>
          {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
          <span className="hidden lg:inline">
            {isConnected ? `LIVE • ${assetCount} ASSETS` : 'CONNECTING...'}
          </span>
          <span className="lg:hidden">
            {isConnected ? assetCount : '...'}
          </span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowAccountList(!showAccountList)}
            className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all text-[10px] font-mono"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeAccount?.is_virtual ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            {activeAccount ? `${activeAccount.loginid} (${activeAccount.account_type.toUpperCase()})` : 'AUTHORIZING...'}
            <ChevronDown size={12} className={`transition-transform ${showAccountList ? 'rotate-180' : ''}`} />
          </button>

          {showAccountList && (
            <div className="absolute top-full left-0 mt-2 w-56 glass border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-2 border-b border-white/10 text-[9px] font-mono text-gray-500 uppercase px-4">Switch Account</div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {accounts.map(acc => (
                  <button
                    key={acc.loginid}
                    onClick={() => {
                      onAccountSwitch(acc);
                      setShowAccountList(false);
                      speakJarvis(`Switching to ${acc.account_type} account ${acc.loginid}, sir. Systems recalibrating!`, 'sophisticated');
                    }}
                    className={`w-full text-left p-3 hover:bg-white/5 flex items-center justify-between transition-colors border-l-2 ${activeAccount?.loginid === acc.loginid ? 'border-cyan-500 bg-cyan-500/10' : 'border-transparent'}`}
                  >
                    <div>
                      <div className="text-xs font-bold font-rajdhani">{acc.loginid}</div>
                      <div className="text-[9px] font-mono text-gray-500 uppercase">{acc.account_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-cyan-400">{acc.balance.toFixed(2)}</div>
                      <div className="text-[8px] text-gray-500">{acc.currency}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowAccountList(false);
                }}
                className="w-full p-3 border-t border-white/10 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-wider"
              >
                <User size={12} /> View Full Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* JARVIS Control Center Quick Access */}
        <button 
          onClick={() => navigate('/control')}
          className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-1.5 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/50 rounded-full text-purple-400 font-orbitron text-[9px] lg:text-[10px] tracking-widest hover:from-purple-500/30 hover:to-cyan-500/30 transition-all neon-glow-purple group"
          title="JARVIS Control Center"
        >
          <Cpu size={12} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden lg:inline">CONTROL CENTER</span>
          <span className="lg:hidden">CONTROL</span>
        </button>

        <button 
          onClick={triggerVocalStatus}
          className="p-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all group relative"
          title="JARVIS Vocal Status"
        >
          <Volume2 size={16} lg:size={18} className="group-hover:scale-110" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#050714] animate-pulse"></span>
        </button>

        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-cyan-500/20">
          <div className="text-right">
            <p className="text-xs font-orbitron font-bold">{time.toLocaleTimeString()}</p>
            <p className="text-[10px] text-gray-500 font-mono">{time.toLocaleDateString()}</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 hover:scale-110 transition-transform cursor-pointer group"
            title="View Profile"
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <User size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
