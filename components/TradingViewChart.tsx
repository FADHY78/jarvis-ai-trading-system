
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  autosize?: boolean;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol = 'FX:EURUSD', 
  theme = 'dark',
  autosize = true 
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (container.current && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          "autosize": autosize,
          "symbol": symbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": theme,
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": container.current.id,
          "hide_side_toolbar": false,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "BollingerBands@tv-basicstudies"
          ],
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if necessary
    };
  }, [symbol, theme, autosize]);

  return (
    <div className="w-full h-full glass rounded-xl overflow-hidden border border-cyan-500/20">
      <div id={`tradingview_${Math.random().toString(36).substring(7)}`} ref={container} className="w-full h-full" />
    </div>
  );
};

export default TradingViewChart;
