import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface OrderBookLevel {
  price: string;
  priceParsed: number;
  volume: string;
  volumeParsed: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface Trade {
  id?: string;
  price: string;
  priceParsed: number;
  quantity: string;
  quantityParsed: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

// trading pair from exchangeInfo
export interface MarketInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

interface MarketState {
  selectedMarket: string;
  orderBook: OrderBook;
  trades: Trade[];
  markets: MarketInfo[];
  updatesPaused: boolean;
  tradeCounter: number;
  setMarket: (marketSymbol: string) => void;
  updateOrderBook: (orderBook: OrderBook) => void;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  resetData: () => void;
  setMarkets: (markets: MarketInfo[]) => void;
  fetchMarkets: () => void;
  setUpdatesPaused: (paused: boolean) => void;
}

const MARKETS_CACHE_KEY = 'binance-markets';

export const useMarketStore = create(immer<MarketState>((set) => {
  // Initialize markets from localStorage if available
  let initialMarkets: MarketInfo[] = [];
  try {
    const cached = localStorage.getItem(MARKETS_CACHE_KEY);
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

    setMarket: (marketSymbol: string) => {
      set((state) => {
        state.selectedMarket = marketSymbol;
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

    setMarkets: (markets: MarketInfo[]) => {
      set((state) => {
        state.markets = markets;
      });
    },

    fetchMarkets: () => {
      fetch('https://api.binance.com/api/v3/exchangeInfo')
        .then((res) => res.json())
        .then((data) => {
          // data.symbols is an array trade pairs/markets with baseAsset, quoteAsset, etc.
          const filtered = data.symbols.filter((s: any) => s.status === 'TRADING');
          const marketInfos: MarketInfo[] = filtered.map((s: any) => ({
            symbol: s.symbol,
            baseAsset: s.baseAsset,
            quoteAsset: s.quoteAsset,
          }));

          // cache in localStorage, 
          localStorage.setItem(MARKETS_CACHE_KEY, JSON.stringify(marketInfos));
          set((state) => {
            state.markets = marketInfos;
          });
        })
        .catch((err) => console.error('Failed to fetch markets:', err));
    },

    setUpdatesPaused: (paused: boolean) => {
      set((state) => {
        state.updatesPaused = paused;
      });
    },
  };
}));
