import React from 'react';
import { Suspense, useEffect, useState } from 'react';
import MarketSelector from './components/MarketSelector';
import { useMarketStore } from './store/useMarketStore';
import { connectBinanceSockets, disconnectBinanceSockets } from './websocket/binanceWs';
import WindowLimitModal from './components/WindowLimitModal';
import { registerWindow, unregisterWindow, getRegisteredWindows, updateWindowEntry } from './windowManager';

const OrderBook = React.lazy(() => import('./components/OrderBook'));
const TradesGrid = React.lazy(() => import('./components/TradesGrid'));

const BROADCAST_CHANNEL_NAME = 'binance-app';

const App = () => {
  const selectedMarket = useMarketStore((state) => state.selectedMarket);
  const [windowId, setWindowId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  // Register this window on mount
  useEffect(() => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setWindowId(id);
    registerWindow(id);

    // Create a broadcast channel for cross-window communication
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    setBroadcastChannel(bc);

    // Listen for messages instructing to stop websocket connections
    bc.onmessage = (event) => {
      if (event.data && event.data.type === 'STOP_WS' && event.data.targetId === id) {
        disconnectBinanceSockets();
        updateWindowEntry(id, { wsActive: false });
      }
    };

    // Listen for storage changes to update the state if other windows register/unregister
    const onStorage = () => {
      const activeWindows = getRegisteredWindows().filter((w) => w.wsActive);
      // If there are more than 2 active windows, show the modal
      if (activeWindows.length > 2) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    };
    window.addEventListener('storage', onStorage);

    // Remove the window from registration on unload
    const cleanup = () => {
      unregisterWindow(id);
      bc.close();
    };
    window.addEventListener('beforeunload', cleanup);

    return () => {
      unregisterWindow(id);
      bc.close();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  // Connect websockets if this window still has active connections
  useEffect(() => {
    const current = getRegisteredWindows().find((w) => w.id === windowId);
    if (current && current.wsActive) {
      connectBinanceSockets(selectedMarket);
    }
    return () => {
      disconnectBinanceSockets();
    };
  }, [selectedMarket, windowId]);

  const handleStopOldest = () => {
    // Find the oldest window with active websocket connections
    const activeWindows = getRegisteredWindows().filter((w) => w.wsActive);
    if (activeWindows.length > 0) {
      const oldest = activeWindows.reduce((prev, curr) => (prev.timestamp < curr.timestamp ? prev : curr));
      if (oldest.id) {
        // Instruct the oldest window to stop its websocket connections
        broadcastChannel?.postMessage({ type: 'STOP_WS', targetId: oldest.id });
        setShowModal(false);
      }
    }
  };

  const handleCloseCurrent = () => {
    // Attempt to close the current window (this may be blocked by the browser if not script‑opened)
    window.close();
  };

  return (
      <div style={{ padding: '1rem' }}>
        <h1>Binance Market Data</h1>
        <MarketSelector />
        <Suspense fallback={<div>Loading Order Book...</div>}>
          <OrderBook />
        </Suspense>
        <Suspense fallback={<div>Loading Trades...</div>}>
          <TradesGrid />
        </Suspense>
        {showModal && (
            <WindowLimitModal
                onStopOldest={handleStopOldest}
                onCloseCurrent={handleCloseCurrent}
            />
        )}
      </div>
  );
};

export default App;
