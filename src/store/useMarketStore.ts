import create from 'zustand';
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
  id?: string;
  price: number;
  quantity: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

interface MarketState {
  selectedMarket: string;
  orderBook: OrderBook;
  trades: Trade[];
  markets: string[];
  updatesPaused: boolean;
  tradeCounter: number;
  setMarket: (market: string) => void;
  updateOrderBook: (orderBook: OrderBook) => void;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  resetData: () => void;
  setMarkets: (markets: string[]) => void;
  fetchMarkets: () => void;
  setUpdatesPaused: (paused: boolean) => void;
}

const LOCAL_STORAGE_KEY = 'binance-markets';

export const useMarketStore = create(immer<MarketState>((set) => {
  // Initialize markets from localStorage if available, else default to an empty array.
  let initialMarkets: string[] = [];
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      initialMarkets = JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error parsing cached markets', e);
  }

  return {
    selectedMarket: 'BTCUSDT',
    orderBook: { bids: [], asks: [] },
    trades: [],
    markets: initialMarkets,
    updatesPaused: false,
    tradeCounter: 0,
    setMarket: (market: string) => {
      set((state) => {
        state.selectedMarket = market;
        // Clear old data when switching markets.
        state.orderBook = { bids: [], asks: [] };
        state.trades = [];
      });
    },
    updateOrderBook: (orderBook: OrderBook) => {
      set((state) => {
        if (!state.updatesPaused) {
          state.orderBook = orderBook;
        }
      });
    },
    addTrade: (trade: Omit<Trade, 'id'>) => {
      set((state) => {
        if (!state.updatesPaused) {
          const newTrade: Trade = {
            id: `${trade.timestamp}-${state.tradeCounter}`,
            ...trade,
          };
          state.tradeCounter++;
          state.trades.unshift(newTrade);
          if (state.trades.length > 300) {
            state.trades.pop();
          }
        }
      });
    },
    resetData: () => {
      set((state) => {
        state.orderBook = { bids: [], asks: [] };
        state.trades = [];
      });
    },
    setMarkets: (markets: string[]) => {
      set((state) => {
        state.markets = markets;
      });
    },
    fetchMarkets: () => {
      fetch('https://api.binance.com/api/v3/exchangeInfo')
        .then((res) => res.json())
        .then((data) => {
          const symbols = data.symbols
            .filter((s: any) => s.status === 'TRADING')
            .map((s: any) => s.symbol);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(symbols));
          set((state) => {
            state.markets = symbols;
          });
        })
        .catch((err) => console.error("Failed to fetch markets:", err));
    },
    setUpdatesPaused: (paused: boolean) => {
      set((state) => {
        state.updatesPaused = paused;
      });
    },
  };
}));
