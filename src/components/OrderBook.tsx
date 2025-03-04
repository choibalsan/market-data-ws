import React, { memo, useEffect, useRef, useState } from 'react';
import { useMarketStore, OrderBookLevel } from '../store/useMarketStore';

interface OrderBookRowProps {
  level: OrderBookLevel;
  barWidth: number;
  side: 'ask' | 'bid';
  highlight: boolean;
}

const OrderBookRow: React.FC<OrderBookRowProps> = memo(
  ({ level, barWidth, side, highlight }) => {
    const volumeBarStyle = {
      width: `${barWidth}%`,
      backgroundColor: side === 'ask' ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)'
    };

    // Apply highlight CSS class if applicable
    const rowClass = `orderbook-row ${highlight ? (side === 'ask' ? 'highlight-ask' : 'highlight-bid') : ''}`;

    return (
      <div className={rowClass}>
        <div className="volume-bar" style={volumeBarStyle}></div>
        <div className="order-price">{level.price}</div>
        <div className="order-volume">{level.volume}</div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.level.priceParsed === nextProps.level.priceParsed &&
    prevProps.level.volumeParsed === nextProps.level.volumeParsed &&
    prevProps.barWidth === nextProps.barWidth &&
    prevProps.highlight === nextProps.highlight
);

const OrderBook: React.FC = () => {
  const { orderBook } = useMarketStore();

  // We'll compute highlights based on a 5% change threshold
  const [highlights, setHighlights] = useState<{ [key: string]: boolean }>({});
  const prevOrderBook = useRef(orderBook);

  useEffect(() => {
    const newHighlights: { [key: string]: boolean } = {};

    // Check asks for changes
    orderBook.asks.forEach((level) => {
      const key = `ask-${level.price}`;
      const prevLevel = prevOrderBook.current.asks.find(
        (l) => Math.abs(l.priceParsed - level.priceParsed) < 1e-8
      );
      if (!prevLevel) {
        // New level, always highlight
        newHighlights[key] = true;
      } else {
        const change = Math.abs(level.volumeParsed - prevLevel.volumeParsed) / (prevLevel.volumeParsed || 1);
        if (change > 0.05) {
          newHighlights[key] = true;
        }
      }
    });

    // Check bids for changes
    orderBook.bids.forEach((level) => {
      const key = `bid-${level.price}`;
      const prevLevel = prevOrderBook.current.bids.find(
        (l) => Math.abs(l.priceParsed - level.priceParsed) < 1e-8
      );
      if (!prevLevel) {
        newHighlights[key] = true;
      } else {
        const change = Math.abs(level.volumeParsed - prevLevel.volumeParsed) / (prevLevel.volumeParsed || 1);
        if (change > 0.05) {
          newHighlights[key] = true;
        }
      }
    });

    setHighlights(newHighlights);
    prevOrderBook.current = orderBook;
  }, [orderBook]);

  // Sort asks descending (highest price first) and bids ascending (lowest price first)
  const sortedAsks = [...orderBook.asks].sort((a, b) => b.priceParsed - a.priceParsed);
  const sortedBids = [...orderBook.bids].sort((a, b) => a.priceParsed - b.priceParsed);

  const maxAskVolume = Math.max(...sortedAsks.map((l) => l.volumeParsed), 1);
  const maxBidVolume = Math.max(...sortedBids.map((l) => l.volumeParsed), 1);

  const bestBid = sortedBids.length ? sortedBids[sortedBids.length - 1] : null;
  const bestAsk = sortedAsks.length ? sortedAsks[sortedAsks.length - 1] : null;
  const spread = bestBid && bestAsk ? bestAsk.priceParsed - bestBid.priceParsed : null;
  const midpoint = bestBid && bestAsk ? (bestBid.priceParsed + bestAsk.priceParsed) / 2 : null;

  return (
    <div className="orderbook-container">
      {/* Sell Orders (Asks) */}
      <div className="orderbook-side">
        <h2 className="orderbook-title asks-title">Sell Orders (ASKS)</h2>
        {sortedAsks.map((level) => {
          const barWidth = (level.volumeParsed / maxAskVolume) * 100;
          const key = `ask-${level.price}`;
          const highlight = !!highlights[key];
          return (
            <OrderBookRow key={key} level={level} barWidth={barWidth} side="ask" highlight={highlight} />
          );
        })}
      </div>

      {/* Center Spread */}
      <div className="spread-container">
        {midpoint !== null && (
          <div className="spread-box">
            <div>Midpoint</div>
            {/* Format midpoint to 8 decimal places */}
            <div className="spread-value">{midpoint.toFixed(8)}</div>
            {/* Format spread to 8 decimal places if it exists */}
            {spread !== null && <div>Spread: {spread.toFixed(8)}</div>}
          </div>
        )}
      </div>

      {/* Buy Orders (Bids) */}
      <div className="orderbook-side">
        <h2 className="orderbook-title bids-title">Buy Orders (BIDS)</h2>
        {sortedBids.map((level) => {
          const barWidth = (level.volumeParsed / maxBidVolume) * 100;
          const key = `bid-${level.price}`;
          const highlight = !!highlights[key];
          return (
            <OrderBookRow key={key} level={level} barWidth={barWidth} side="bid" highlight={highlight} />
          );
        })}
      </div>
    </div>
  );
};

export default OrderBook;
