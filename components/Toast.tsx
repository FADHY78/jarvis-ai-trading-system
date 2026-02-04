import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Send } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-400" />,
    error: <XCircle size={18} className="text-red-400" />,
    info: <Send size={18} className="text-cyan-400" />
  };

  const colors = {
    success: 'from-green-500/20 to-emerald-500/10 border-green-500/40',
    error: 'from-red-500/20 to-rose-500/10 border-red-500/40',
    info: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40'
  };

  const textColors = {
    success: 'text-green-300',
    error: 'text-red-300',
    info: 'text-cyan-300'
  };

  return (
    <div className={`fixed top-20 right-4 z-[100] glass bg-gradient-to-br ${colors[type]} border rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-5 fade-in duration-300 max-w-sm`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-mono ${textColors[type]} leading-relaxed`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <XCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
