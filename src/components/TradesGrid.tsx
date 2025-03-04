import { useMemo } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import TradeRow from './TradeRow';

const TradesGrid = () => {
  const trades = useMarketStore((state) => state.trades);

  // Compute average quantity once
  const averageQuantity = useMemo(() => {
    if (trades.length === 0) return 0;
    const total = trades.reduce((sum, t) => sum + t.quantityParsed, 0);
    return total / trades.length;
  }, [trades]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ textAlign: 'center', margin: '0.5rem 0' }}>Recent Trades</h2>
      {trades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>Waiting for trades...</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc' }}>
          {trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} averageQuantity={averageQuantity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TradesGrid;
