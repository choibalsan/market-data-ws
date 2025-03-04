import React from 'react';
import { Trade } from '../store/useMarketStore';

function formatTimeMillis(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

export interface TradeRowProps {
  trade: Trade;
  averageQuantity: number;
}

const TradeRow = ({ trade, averageQuantity }: TradeRowProps) => {
  const timeStr = formatTimeMillis(trade.timestamp);
  const isLarge = averageQuantity > 0 && trade.quantityParsed > 1.5 * averageQuantity;
  const color = trade.side === 'buy' ? 'green' : 'red';
  const arrow = trade.side === 'buy' ? '↑' : '↓';

  const dynamicStyle = {
    color,
    fontWeight: isLarge ? 'bold' : 'normal',
    backgroundColor: isLarge ? 'rgba(255,255,0,0.2)' : 'transparent'
  };

  return (
    <div className="trade-row" style={dynamicStyle}>
      <div className="trade-col time">{timeStr}</div>
      <div className="trade-col price">{trade.price}</div>
      <div className="trade-col amount">{trade.quantity}</div>
      <div className="trade-col direction">{arrow}</div>
    </div>
  );
};

// Memoize rows to be rendered once, don't redraw if average or total changes
export default React.memo(
  TradeRow,
  (prev, next) => prev.trade.id === next.trade.id
);
