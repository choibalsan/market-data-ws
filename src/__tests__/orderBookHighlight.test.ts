import { describe, it, expect } from 'vitest';
import { computeHighlights } from '../utils/orderBookUtils';
import { OrderBookLevel } from '../store/useMarketStore';

describe('Highlights', () => {
  it('highlights new levels', () => {
    const oldAsks: OrderBookLevel[] = [
      { price: '101', priceParsed: 101, volume: '1', volumeParsed: 1 },
    ];
    const newAsks: OrderBookLevel[] = [
      { price: '101', priceParsed: 101, volume: '1', volumeParsed: 1 },
      { price: '102', priceParsed: 102, volume: '2', volumeParsed: 2 }, // new level
    ];

    const result = computeHighlights(newAsks, oldAsks, 'ask');
    expect(result['ask-102']).toBe(true);
    expect(result['ask-101']).toBe(undefined);
  });

  it('highlights changed volume', () => {
    const oldBids: OrderBookLevel[] = [
      { price: '99', priceParsed: 99, volume: '1', volumeParsed: 1 },
    ];
    const newBids: OrderBookLevel[] = [
      { price: '99', priceParsed: 99, volume: '2', volumeParsed: 2 }, // changed volume
    ];

    const result = computeHighlights(newBids, oldBids, 'bid');
    expect(result['bid-99']).toBe(true);
  });

  it('does not highlight unchanged levels', () => {
    const oldAsks: OrderBookLevel[] = [
      { price: '101', priceParsed: 101, volume: '1', volumeParsed: 1 },
    ];
    const newAsks: OrderBookLevel[] = [
      { price: '101', priceParsed: 101, volume: '1', volumeParsed: 1 },
    ];

    const result = computeHighlights(newAsks, oldAsks, 'ask');
    expect(Object.keys(result).length).toBe(0);
  });
});
