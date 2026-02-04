
import React, { useState, useEffect } from 'react';
import { User, Wallet, TrendingUp, Shield, Globe, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { DerivAccount } from '../services/derivService';

interface ProfileProps {
  activeAccount: DerivAccount | null;
  accounts: DerivAccount[];
  onAccountSwitch: (acc: DerivAccount) => void;
}

const Profile: React.FC<ProfileProps> = ({ activeAccount, accounts, onAccountSwitch }) => {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getAccountTypeLabel = (type: string) => {
    if (type === 'real') return 'REAL ACCOUNT';
    if (type === 'demo') return 'DEMO ACCOUNT';
    return type.toUpperCase();
  };

  const getAccountStatusColor = (isVirtual: boolean) => {
    return isVirtual ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 'text-green-400 border-green-500/30 bg-green-500/10';
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-orbitron text-2xl lg:text-3xl text-cyan-400 flex items-center gap-3 lg:gap-4 font-black tracking-tighter uppercase">
            <User className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-500 animate-pulse" /> 
            <span className="hidden sm:inline">Account Profile</span>
            <span className="sm:hidden">Profile</span>
          </h1>
          <p className="text-[10px] lg:text-[11px] font-mono text-gray-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] font-bold">
            <span className="hidden lg:inline">DERIV BROKER INTEGRATION • LIVE EQUITY MONITORING</span>
            <span className="lg:hidden">DERIV • LIVE EQUITY</span>
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all text-cyan-400 font-orbitron text-[10px] lg:text-xs disabled:opacity-50"
        >
          <RefreshCw size={14} className={`lg:w-4 lg:h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">REFRESH DATA</span>
          <span className="sm:hidden">REFRESH</span>
        </button>
      </div>

      {/* Active Account Card */}
      {activeAccount ? (
        <div className="glass rounded-2xl lg:rounded-3xl overflow-hidden border-t-4 lg:border-t-8 border-t-cyan-500 relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-20 bg-cyan-500"></div>
          
          <div className="p-6 lg:p-10 relative z-10">
            {/* Account Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-1 relative">
                  <div className="w-full h-full rounded-2xl lg:rounded-3xl bg-black flex items-center justify-center">
                    <Globe size={32} className="lg:w-10 lg:h-10 text-cyan-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full border-2 lg:border-4 border-black animate-pulse"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 lg:gap-3 mb-2">
                    <h2 className="font-orbitron font-black text-2xl lg:text-4xl text-white tracking-tight">DERIV</h2>
                    <span className={`px-2 lg:px-3 py-1 rounded-lg text-[8px] lg:text-[10px] font-mono font-bold border ${getAccountStatusColor(activeAccount.is_virtual)}`}>
                      {activeAccount.is_virtual ? 'VIRTUAL' : 'LIVE'}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-400 font-rajdhani uppercase tracking-wider">
                    {getAccountTypeLabel(activeAccount.account_type)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                {activeAccount.is_virtual ? (
                  <AlertCircle size={16} className="lg:w-5 lg:h-5 text-yellow-400" />
                ) : (
                  <CheckCircle size={16} className="lg:w-5 lg:h-5 text-green-400" />
                )}
                <span className="text-[10px] lg:text-xs font-mono text-gray-400 uppercase">
                  <span className="hidden sm:inline">CONNECTION STATUS: </span>
                  <span className="text-green-400 font-bold">ACTIVE</span>
                </span>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
              {/* Live Equity */}
              <div className="glass bg-white/[0.03] p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-cyan-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3 lg:mb-4">
                    <Wallet size={18} className="lg:w-5 lg:h-5 text-cyan-400" />
                    <p className="text-[9px] lg:text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Live Equity</p>
                  </div>
                  <h3 className="font-orbitron font-black text-3xl lg:text-5xl text-cyan-400 mb-2 tracking-tight">
                    {activeAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs lg:text-sm font-mono text-gray-400">{activeAccount.currency}</p>
                </div>
              </div>

              {/* Account ID */}
              <div className="glass bg-white/[0.03] p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/10">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <Shield size={18} className="lg:w-5 lg:h-5 text-purple-400" />
                  <p className="text-[9px] lg:text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Account ID</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-mono font-bold text-xl lg:text-2xl text-white tracking-tight">
                    {activeAccount.loginid}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(activeAccount.loginid)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-all"
                    title="Copy Account ID"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] text-green-400 font-mono mt-2 animate-in fade-in">Copied!</p>
                )}
              </div>

              {/* Account Type */}
              <div className="glass bg-white/[0.03] p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/10">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <TrendingUp size={18} className="lg:w-5 lg:h-5 text-green-400" />
                  <p className="text-[9px] lg:text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Account Type</p>
                </div>
                <h3 className="font-orbitron font-bold text-lg lg:text-xl text-white uppercase tracking-tight">
                  {getAccountTypeLabel(activeAccount.account_type)}
                </h3>
                <p className="text-xs lg:text-sm font-mono text-gray-400 mt-2">
                  {activeAccount.is_virtual ? 'Practice Trading' : 'Live Trading'}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 p-5 lg:p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Broker</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm lg:text-base font-bold text-white font-rajdhani">Deriv.com</p>
                  <a 
                    href="https://deriv.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Integration Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm lg:text-base font-bold text-green-400 font-rajdhani">CONNECTED</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">API Version</p>
                <p className="text-sm lg:text-base font-bold text-white font-mono">WebSocket v3</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Last Updated</p>
                <p className="text-sm lg:text-base font-bold text-white font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-12 rounded-3xl text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-400" />
          <h3 className="font-orbitron text-xl text-white mb-2">No Active Account</h3>
          <p className="text-sm text-gray-400 font-rajdhani">Please connect your Deriv account to view profile information.</p>
        </div>
      )}

      {/* All Accounts List */}
      {accounts.length > 1 && (
        <div className="glass rounded-2xl lg:rounded-3xl overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-cyan-500/10 bg-white/5">
            <h2 className="font-orbitron text-sm lg:text-base text-cyan-400 flex items-center gap-2 lg:gap-3">
              <Wallet size={16} className="lg:w-5 lg:h-5" /> 
              <span className="hidden sm:inline">ALL CONNECTED ACCOUNTS</span>
              <span className="sm:hidden">ACCOUNTS</span>
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {accounts.map((acc) => (
              <button
                key={acc.loginid}
                onClick={() => onAccountSwitch(acc)}
                className={`w-full p-4 lg:p-6 hover:bg-white/5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 ${
                  activeAccount?.loginid === acc.loginid ? 'bg-cyan-500/5 border-l-4 border-l-cyan-500' : ''
                }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${
                    acc.is_virtual ? 'from-yellow-500 to-orange-500' : 'from-cyan-500 to-blue-600'
                  } p-0.5`}>
                    <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                      <Wallet size={18} className="lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono font-bold text-sm lg:text-base text-white">{acc.loginid}</p>
                      {activeAccount?.loginid === acc.loginid && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[8px] font-mono uppercase">Active</span>
                      )}
                    </div>
                    <p className="text-[10px] lg:text-xs text-gray-400 font-mono uppercase">{getAccountTypeLabel(acc.account_type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none text-left sm:text-right">
                    <p className="font-mono font-black text-lg lg:text-xl text-cyan-400">
                      {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] lg:text-xs text-gray-500 font-mono">{acc.currency}</p>
                  </div>
                  <span className={`px-2 lg:px-3 py-1 rounded-lg text-[8px] lg:text-[10px] font-mono font-bold border ${getAccountStatusColor(acc.is_virtual)}`}>
                    {acc.is_virtual ? 'VIRTUAL' : 'LIVE'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="glass p-4 lg:p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
        <div className="flex items-start gap-3 lg:gap-4">
          <Shield size={20} className="lg:w-6 lg:h-6 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-orbitron text-xs lg:text-sm text-cyan-400 mb-2 font-bold">SECURE CONNECTION</h4>
            <p className="text-[10px] lg:text-xs text-gray-400 leading-relaxed">
              Your Deriv account is connected via encrypted WebSocket. All account data is transmitted securely and is never stored on our servers. 
              JARVIS AI Trading System operates in read-only mode for your safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
