import React, { useMemo } from 'react';
import { useMarketStore } from '../store/useMarketStore';

function formatTimeMillis(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

const TradesGrid: React.FC = () => {
  const trades = useMarketStore((state) => state.trades);

  const averageQuantity = useMemo(() => {
    if (trades.length === 0) return 0;
    const total = trades.reduce((sum, trade) => sum + trade.quantityParsed, 0);
    return total / trades.length;
  }, [trades]);

  return (
    <div className="trades-container">
      <h2 className="trades-title">Recent Trades</h2>
      {trades.length === 0 ? (
        <div className="placeholder">Waiting for trades...</div>
      ) : (
        <>
          <div className="trades-header">
            <div className="trade-col time-col">Time</div>
            <div className="trade-col price-col">Price</div>
            <div className="trade-col amount-col">Amount</div>
            <div className="trade-col direction-col">Direction</div>
          </div>
          {trades.map((trade) => {
            const timeStr = formatTimeMillis(trade.timestamp);
            const isLarge = averageQuantity > 0 && trade.quantityParsed > 1.5 * averageQuantity;
            const color = trade.side === 'buy' ? 'green' : 'red';
            const arrow = trade.side === 'buy' ? '↑' : '↓';

            return (
              <div key={trade.id} className={`trade-row ${isLarge ? 'large-trade' : ''}`} style={{ color }}>
                <div className="trade-col time-col">{timeStr}</div>
                {/* Show original string values */}
                <div className="trade-col price-col">{trade.price}</div>
                <div className="trade-col amount-col">{trade.quantity}</div>
                <div className="trade-col direction-col">{arrow}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default TradesGrid;
