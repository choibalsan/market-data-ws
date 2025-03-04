import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

export interface OrderBookLevel {
  price: number;
  volume: number;
}

const OrderBook: React.FC = () => {
  const { orderBook } = useMarketStore();

  // Local state to track highlights: keys like "ask-<price>" or "bid-<price>"
  const [highlights, setHighlights] = React.useState<{ [key: string]: 'bid' | 'ask' }>({});
  const prevOrderBook = React.useRef(orderBook);

  // Compare new order book to previous one to detect changes.
  React.useEffect(() => {
    const newHighlights: { [key: string]: 'bid' | 'ask' } = {};

    // Process ASKS (sell orders)
    const currentAsks = orderBook.asks.slice(0, 15);
    const prevAsks = prevOrderBook.current.asks.slice(0, 15);
    currentAsks.forEach((level) => {
      const key = `ask-${level.price}`;
      const prevLevel = prevAsks.find((l) => Math.abs(l.price - level.price) < 1e-8);
      if (!prevLevel || prevLevel.volume !== level.volume) {
        newHighlights[key] = 'ask';
      }
    });

    // Process BIDS (buy orders)
    const currentBids = orderBook.bids.slice(0, 15);
    const prevBids = prevOrderBook.current.bids.slice(0, 15);
    currentBids.forEach((level) => {
      const key = `bid-${level.price}`;
      const prevLevel = prevBids.find((l) => Math.abs(l.price - level.price) < 1e-8);
      if (!prevLevel || prevLevel.volume !== level.volume) {
        newHighlights[key] = 'bid';
      }
    });

    if (Object.keys(newHighlights).length > 0) {
      setHighlights(newHighlights);
      // Clear highlights after 1 second.
      setTimeout(() => setHighlights({}), 1000);
    }
    prevOrderBook.current = orderBook;
  }, [orderBook]);

  // Get visible levels (limit to 15)
  // For ASKS: sort descending (highest price first)
  const visibleAsks = [...orderBook.asks].slice(0, 15).sort((a, b) => b.price - a.price);
  // For BIDS: sort ascending (lowest price first)
  const visibleBids = [...orderBook.bids].slice(0, 15).sort((a, b) => a.price - b.price);

  // Calculate totals for bolding large orders.
  const totalAskVolume = visibleAsks.reduce((sum, level) => sum + level.volume, 0);
  const totalBidVolume = visibleBids.reduce((sum, level) => sum + level.volume, 0);
  // Calculate maximum volume among levels (for volume bars).
  const maxAskVolume = Math.max(...visibleAsks.map((l) => l.volume), 1);
  const maxBidVolume = Math.max(...visibleBids.map((l) => l.volume), 1);

  // Determine best bid and best ask to compute spread and midpoint.
  const bestBid = visibleBids.length ? visibleBids[visibleBids.length - 1] : null;
  const bestAsk = visibleAsks.length ? visibleAsks[visibleAsks.length - 1] : null;
  const spread = bestBid && bestAsk ? bestAsk.price - bestBid.price : null;
  const midpoint = bestBid && bestAsk ? (bestBid.price + bestAsk.price) / 2 : null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
      {/* Sell Orders (Asks) */}
      <div style={{ flex: 1, marginRight: '0.5rem' }}>
        <h2 style={{ color: 'red' }}>Sell Orders (ASKS)</h2>
        {visibleAsks.map((level) => {
          const key = `ask-${level.price}`;
          const highlight = highlights[key];
          // Bold if volume exceeds 1% of total ask volume.
          const isLarge = level.volume > 0.01 * totalAskVolume;
          // Compute bar width percentage relative to maximum ask volume.
          const barWidth = (level.volume / maxAskVolume) * 100;
          return (
            <div
              key={key}
              style={{
                position: 'relative',
                padding: '4px 8px',
                marginBottom: '2px',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: highlight ? 'rgba(255,0,0,0.3)' : 'transparent',
                fontWeight: isLarge ? 'bold' : 'normal',
              }}
            >
              {/* Volume Bar (absolute background) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${barWidth}%`,
                  backgroundColor: 'rgba(255,0,0,0.2)',
                  zIndex: 0,
                }}
              />
              <div style={{ zIndex: 1 }}>{level.price.toFixed(4)}</div>
              <div style={{ zIndex: 1 }}>{level.volume.toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      {/* Center Spread Display */}
      <div style={{ width: '150px', textAlign: 'center' }}>
        {midpoint !== null && (
          <div
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#f0f0f0',
            }}
          >
            <div>Midpoint</div>
            <div style={{ fontWeight: 'bold' }}>{midpoint.toFixed(4)}</div>
            {spread !== null && <div>Spread: {spread.toFixed(4)}</div>}
          </div>
        )}
      </div>

      {/* Buy Orders (Bids) */}
      <div style={{ flex: 1, marginLeft: '0.5rem' }}>
        <h2 style={{ color: 'green' }}>Buy Orders (BIDS)</h2>
        {visibleBids.map((level) => {
          const key = `bid-${level.price}`;
          const highlight = highlights[key];
          const isLarge = level.volume > 0.01 * totalBidVolume;
          const barWidth = (level.volume / maxBidVolume) * 100;
          return (
            <div
              key={key}
              style={{
                position: 'relative',
                padding: '4px 8px',
                marginBottom: '2px',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: highlight ? 'rgba(0,255,0,0.3)' : 'transparent',
                fontWeight: isLarge ? 'bold' : 'normal',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${barWidth}%`,
                  backgroundColor: 'rgba(0,255,0,0.2)',
                  zIndex: 0,
                }}
              />
              <div style={{ zIndex: 1 }}>{level.price.toFixed(4)}</div>
              <div style={{ zIndex: 1 }}>{level.volume.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderBook;
