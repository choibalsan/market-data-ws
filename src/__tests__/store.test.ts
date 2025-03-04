import { describe, it, expect, beforeEach } from 'vitest';
import { useMarketStore } from '../store/useMarketStore';


describe('Market Store', () => {
  beforeEach(() => {
    // reset the Zustand store before each test
    useMarketStore.setState({
      selectedMarket: 'BTCUSDT',
      orderBook: { bids: [], asks: [] },
      trades: [],
      updatesPaused: false,
      tradeCounter: 0,
      markets: [],
    });
  });

  it('sets selected market', () => {
    useMarketStore.getState().setMarket('ETHUSDT');
    expect(useMarketStore.getState().selectedMarket).toBe('ETHUSDT');
  });

  it('updates order book when not paused', () => {
    useMarketStore.getState().updateOrderBook({
      bids: [{ price: '100.0', priceParsed: 100, volume: '1', volumeParsed: 1 }],
      asks: [{ price: '101.0', priceParsed: 101, volume: '2', volumeParsed: 2 }],
    });
    expect(useMarketStore.getState().orderBook.bids.length).toBe(1);
    expect(useMarketStore.getState().orderBook.asks.length).toBe(1);
  });

  it('does not update order book when paused', () => {
    useMarketStore.getState().setUpdatesPaused(true);
    useMarketStore.getState().updateOrderBook({
      bids: [{ price: '200.0', priceParsed: 200, volume: '1', volumeParsed: 1 }],
      asks: [],
    });
    expect(useMarketStore.getState().orderBook.bids.length).toBe(0);
  });

  it('adds trade and increments tradeCounter', () => {
    useMarketStore.getState().addTrade({
      price: '100.5',
      priceParsed: 100.5,
      quantity: '0.1',
      quantityParsed: 0.1,
      timestamp: 1234567890000,
      side: 'buy',
    });
    const store = useMarketStore.getState();
    expect(store.trades.length).toBe(1);
    expect(store.tradeCounter).toBe(1);
  });
});
