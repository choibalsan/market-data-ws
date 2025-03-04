import ReconnectingWebSocket, { ErrorEvent } from 'reconnecting-websocket';
import { Trade, useMarketStore } from '../store/useMarketStore';

let orderBookSocket: ReconnectingWebSocket | null = null;
let tradesSocket: ReconnectingWebSocket | null = null;

const DEPTH = 20;
const options = {
  connectionTimeout: 4000,
  maxRetries: Infinity,
  minReconnectionDelay: 1000,
  maxReconnectionDelay: 10000,
  reconnectionDelayGrowFactor: 1.5,
};

// Buffers for throttling updates (see previous example if needed)
let orderBookBuffer:
  | { bids: { price: string; priceParsed: number; volume: string; volumeParsed: number }[]; asks: { price: string; priceParsed: number; volume: string; volumeParsed: number }[] }
  | null = null;
let tradesBuffer: Array<{ 
  price: string; 
  priceParsed: number; 
  quantity: string; 
  quantityParsed: number; 
  timestamp: number; 
  side: 'buy' | 'sell' 
}> = [];

let updateScheduled = false;
function scheduleUpdate() {
  if (!updateScheduled) {
    updateScheduled = true;
    requestAnimationFrame(() => {
      if (orderBookBuffer) {
        useMarketStore.getState().updateOrderBook(orderBookBuffer);
        orderBookBuffer = null;
      }
      if (tradesBuffer.length > 0) {
        tradesBuffer.forEach((trade) => {
          useMarketStore.getState().addTrade(trade);
        });
        tradesBuffer = [];
      }
      updateScheduled = false;
    });
  }
}

export function connectBinanceSockets(market: string) {
  if (orderBookSocket) orderBookSocket.close();
  if (tradesSocket) tradesSocket.close();

  const lowerMarket = market.toLowerCase();
  const orderBookUrl = `wss://stream.binance.com:9443/ws/${lowerMarket}@depth${DEPTH}@100ms`;
  const tradesUrl = `wss://stream.binance.com:9443/ws/${lowerMarket}@trade`;

  orderBookSocket = new ReconnectingWebSocket(orderBookUrl, [], options);
  tradesSocket = new ReconnectingWebSocket(tradesUrl, [], options);

  orderBookSocket.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const bids = data.bids.map((level: [string, string]) => ({
        price: level[0],
        priceParsed: parseFloat(level[0]),
        volume: level[1],
        volumeParsed: parseFloat(level[1]),
      }));
      const asks = data.asks.map((level: [string, string]) => ({
        price: level[0],
        priceParsed: parseFloat(level[0]),
        volume: level[1],
        volumeParsed: parseFloat(level[1]),
      }));
      orderBookBuffer = { bids, asks };
      scheduleUpdate();
    } catch (err) {
      console.error("Failed to parse order book data:", err);
    }
  };

  tradesSocket.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const trade: Trade = {
        price: data.p,
        priceParsed: parseFloat(data.p),
        quantity: data.q,
        quantityParsed: parseFloat(data.q),
        timestamp: data.E,
        side: data.m ? 'sell' : 'buy',
      };
      tradesBuffer.push(trade);
      scheduleUpdate();
    } catch (err) {
      console.error("Failed to parse trade data:", err);
    }
  };

  orderBookSocket.onerror = (event: ErrorEvent) => {
    console.error("OrderBook WebSocket error:", event);
  };
  tradesSocket.onerror = (event: ErrorEvent) => {
    console.error("Trades WebSocket error:", event);
  };
}

export function disconnectBinanceSockets() {
  if (orderBookSocket) {
    orderBookSocket.close();
    orderBookSocket = null;
  }
  if (tradesSocket) {
    tradesSocket.close();
    tradesSocket = null;
  }
}
