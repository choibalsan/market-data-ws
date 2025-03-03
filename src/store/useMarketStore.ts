import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface OrderBookLevel {
  price: number;
  volume: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface Trade {
  price: number;
  quantity: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

interface MarketState {
  selectedMarket: string;
  orderBook: OrderBook;
  trades: Trade[];
  setMarket: (market: string) => void;
  updateOrderBook: (orderBook: OrderBook) => void;
  addTrade: (trade: Trade) => void;
  resetData: () => void;
}

export const useMarketStore = create(immer<MarketState>((set) => ({
  selectedMarket: 'BTCUSDT',
  orderBook: { bids: [], asks: [] },
  trades: [],
  setMarket: (market: string) => set((state) => {
    state.selectedMarket = market;
    // Reset previous data when switching markets
    state.orderBook = { bids: [], asks: [] };
    state.trades = [];
  }),
  updateOrderBook: (orderBook: OrderBook) => set((state) => {
    state.orderBook = orderBook;
  }),
  addTrade: (trade: Trade) => set((state) => {
    state.trades.unshift(trade);
    // Keep only the most recent 50 trades for performance
    if (state.trades.length > 50) {
      state.trades.pop();
    }
  }),
  resetData: () => set((state) => {
    state.orderBook = { bids: [], asks: [] };
    state.trades = [];
  })
})));
