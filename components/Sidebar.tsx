
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Radar, 
  Brain, 
  Wallet, 
  BarChart2, 
  Settings, 
  Bot,
  Zap,
  Layers,
  X,
  User,
  Cpu,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/deriv', icon: <Layers size={20} />, label: 'Deriv Hub' },
    { to: '/charts', icon: <TrendingUp size={20} />, label: 'Live Charts' },
    { to: '/scanner', icon: <Radar size={20} />, label: 'Scanner' },
    { to: '/signals', icon: <Brain size={20} />, label: 'AI Signals' },
    { to: '/analysis', icon: <Activity size={20} />, label: 'AI Analysis' },
    { to: '/portfolio', icon: <Wallet size={20} />, label: 'Portfolio' },
    { to: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
    { to: '/control', icon: <Cpu size={20} />, label: 'JARVIS Control' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    { to: '/jarvis', icon: <Bot size={20} />, label: 'JARVIS Chat' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0
        w-64 lg:w-20 xl:w-64 h-full 
        glass border-r border-cyan-500/20 
        flex flex-col transition-all duration-300 
        z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center neon-glow">
          <Zap className="text-black" />
        </div>
        <span className="hidden lg:block font-orbitron font-bold text-xl tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          JARVIS
        </span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onClose && onClose()}
            className={({ isActive }) => `
              flex items-center gap-4 p-3 rounded-xl transition-all group relative overflow-hidden
              ${isActive ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <div className="relative z-10">{item.icon}</div>
            <span className="lg:hidden xl:block font-rajdhani font-semibold text-lg relative z-10">
              {item.label}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="lg:hidden xl:block p-4 rounded-xl bg-cyan-900/20 border border-cyan-500/30 text-xs text-cyan-400 font-mono">
          DERIV: AUTHORIZED
          <div className="mt-2 h-1 w-full bg-cyan-900 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[100%] animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
