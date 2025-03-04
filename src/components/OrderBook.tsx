import { memo, useEffect, useRef, useState } from 'react';
import { useMarketStore, OrderBookLevel } from '../store/useMarketStore';
import { computeHighlights } from '../utils/orderBookUtils';

interface OrderBookRowProps {
  level: OrderBookLevel;
  barWidth: number;
  side: 'ask' | 'bid';
  highlight: boolean;
}

const OrderBookRow = memo(
  ({ level, barWidth, side, highlight }: OrderBookRowProps) => {
    const volumeBarStyle = {
      width: `${barWidth}%`,
      backgroundColor: side === 'ask' ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)',
    };

    const rowClass = `orderbook-row ${
      highlight ? (side === 'ask' ? 'highlight-ask' : 'highlight-bid') : ''
    }`;

    return (
      <div className={rowClass}>
        <div className="volume-bar" style={volumeBarStyle}></div>
        <div className="order-price">{level.price}</div>
        <div className="order-volume">{level.volume}</div>
      </div>
    );
  }
);

const OrderBook = () => {
  const { orderBook } = useMarketStore();
  const [highlights, setHighlights] = useState<{ [key: string]: boolean }>({});
  const prevOrderBook = useRef(orderBook);

  useEffect(() => {
    // compute highlights for asks and bids separately
    const newHighlightsAsks = computeHighlights(orderBook.asks, prevOrderBook.current.asks, 'ask');
    const newHighlightsBids = computeHighlights(orderBook.bids, prevOrderBook.current.bids, 'bid');
    setHighlights({ ...newHighlightsAsks, ...newHighlightsBids });
    prevOrderBook.current = orderBook;
  }, [orderBook]);

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

      <div className="spread-container">
        {midpoint !== null && (
          <div className="spread-box">
            <div>Midpoint</div>
            <div className="spread-value">{midpoint.toFixed(8)}</div>
            {spread !== null && <div>Spread: {spread.toFixed(8)}</div>}
          </div>
        )}
      </div>

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
