import React from 'react';
import { FixedSizeList } from 'react-window';
import { useMarketStore } from '../store/useMarketStore';

const TradesGrid = () => {
  const trades = useMarketStore((state) => state.trades);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const trade = trades[index];
    return (
        <div style={{ ...style, display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', borderBottom: '1px solid #ddd' }}>
          <div style={{ width: '30%' }}>{new Date(trade.timestamp).toLocaleTimeString()}</div>
          <div style={{ width: '20%' }}>{trade.side}</div>
          <div style={{ width: '25%' }}>{trade.price}</div>
          <div style={{ width: '25%' }}>{trade.quantity}</div>
        </div>
    );
  };

  return (
      <div>
        <h2>Recent Trades</h2>
        <FixedSizeList
            height={300}
            itemCount={trades.length}
            itemSize={35}
            width="100%"
        >
          {Row}
        </FixedSizeList>
      </div>
  );
};

export default TradesGrid;
