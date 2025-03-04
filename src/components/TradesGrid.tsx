import React, { useMemo } from 'react';
import { useMarketStore } from '../store/useMarketStore';

const TradesGrid: React.FC = () => {
  const trades = useMarketStore((state) => state.trades);

  // Calculate the average trade quantity to highlight larger trades.
  const averageQuantity = useMemo(() => {
    if (trades.length === 0) return 0;
    const total = trades.reduce((sum, trade) => sum + trade.quantity, 0);
    return total / trades.length;
  }, [trades]);

  // Format a timestamp (milliseconds) as HH:MM:SS.
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
      }}
    >
      {/* Friendly title */}
      <h2 style={{ textAlign: 'center', margin: '0.5rem 0' }}>Recent Trades</h2>
      {trades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
          Waiting for trades...
        </div>
      ) : (
        <>
          {/* Column Headers */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              padding: '4px 8px',
              borderBottom: '2px solid #ccc',
            }}
          >
            <div style={{ width: '20%' }}>Time</div>
            <div style={{ width: '20%', textAlign: 'right' }}>Price</div>
            <div style={{ width: '20%', textAlign: 'right' }}>Amount</div>
            <div style={{ width: '20%', textAlign: 'center' }}>Direction</div>
          </div>
          {trades.map((trade) => {
            const timeStr = formatTime(trade.timestamp);
            const isLarge = averageQuantity > 0 && trade.quantity > 1.5 * averageQuantity;
            const color = trade.side === 'buy' ? 'green' : 'red';
            const directionArrow = trade.side === 'buy' ? '↑' : '↓';

            return (
              <div
                key={trade.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: isLarge ? 'rgba(255, 255, 0, 0.3)' : 'transparent',
                  color: color,
                }}
              >
                <div style={{ width: '20%' }}>{timeStr}</div>
                <div style={{ width: '20%', textAlign: 'right' }}>{trade.price.toFixed(4)}</div>
                <div style={{ width: '20%', textAlign: 'right' }}>{trade.quantity.toFixed(2)}</div>
                <div style={{ width: '20%', textAlign: 'center' }}>{directionArrow}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default TradesGrid;
