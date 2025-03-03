import ReconnectingWebSocket, {ErrorEvent} from 'reconnecting-websocket';
import {Trade, useMarketStore} from '../store/useMarketStore';

let orderBookSocket: ReconnectingWebSocket | null = null;
let tradesSocket: ReconnectingWebSocket | null = null;

// Options for the reconnecting websocket
const options = {
  connectionTimeout: 4000,
  maxRetries: Infinity, // Try to reconnect indefinitely.
  minReconnectionDelay: 1000,
  maxReconnectionDelay: 10000,
  reconnectionDelayGrowFactor: 2,
};

export function connectBinanceSockets(market: string) {
  if (orderBookSocket) orderBookSocket.close();
  if (tradesSocket) tradesSocket.close();

  const lowerMarket = market.toLowerCase();
  const orderBookUrl = `wss://stream.binance.com:9443/ws/${lowerMarket}@depth20@100ms`;
  const tradesUrl = `wss://stream.binance.com:9443/ws/${lowerMarket}@trade`;

  orderBookSocket = new ReconnectingWebSocket(orderBookUrl, [], options);
  tradesSocket = new ReconnectingWebSocket(tradesUrl, [], options);

  orderBookSocket.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const bids = data.bids.slice(0, 20).map((level: [string, string]) => ({
        price: parseFloat(level[0]),
        volume: parseFloat(level[1])
      }));
      const asks = data.asks.slice(0, 20).map((level: [string, string]) => ({
        price: parseFloat(level[0]),
        volume: parseFloat(level[1])
      }));
      useMarketStore.getState().updateOrderBook({ bids, asks });
    } catch (err) {
      console.error("Failed to parse order book data:", err);
    }
  };

  tradesSocket.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const trade: Trade = {
        price: parseFloat(data.p),
        quantity: parseFloat(data.q),
        timestamp: data.E,
        side: data.m ? 'sell' : 'buy'
      };
      useMarketStore.getState().addTrade(trade);
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
