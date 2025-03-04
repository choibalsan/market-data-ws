import React, { Suspense, useEffect, useState } from 'react';
import { useMarketStore } from './store/useMarketStore';
import { connectBinanceSockets, disconnectBinanceSockets } from './websocket/binanceWs';
import {
  registerWindow,
  unregisterWindow,
  getRegisteredWindows,
  updateWindowEntry,
} from './windowManager';

import ActiveWindowModal from './components/ActiveWindowModal';
import MarketSelector from './components/MarketSelector';
import WindowLimitModal from './components/WindowLimitModal'; // if you still want to keep the old limit logic

const OrderBook = React.lazy(() => import('./components/OrderBook'));
const TradesGrid = React.lazy(() => import('./components/TradesGrid'));

const BROADCAST_CHANNEL_NAME = 'binance-app';

const App: React.FC = () => {
  const selectedMarket = useMarketStore((state) => state.selectedMarket);
  const updatesPaused = useMarketStore((state) => state.updatesPaused);
  const setUpdatesPaused = useMarketStore((state) => state.setUpdatesPaused);

  const [windowId, setWindowId] = useState<string>('');
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  // For any older "2+ windows" logic:
  const [showWindowLimitModal, setShowWindowLimitModal] = useState(false);

  useEffect(() => {
    // Create an ID for this window
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setWindowId(id);

    // Register as unpaused by default (active).
    registerWindow(id);

    // Create a broadcast channel
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    setBroadcastChannel(bc);

    bc.onmessage = (event) => {
      if (!event.data) return;

      // If we receive a "PAUSE_WINDOW" message and we are the target, pause ourselves
      if (event.data.type === 'PAUSE_WINDOW' && event.data.targetId === id) {
        // Pause this window
        setUpdatesPaused(true);
        updateWindowEntry(id, { updatesPaused: true });
        disconnectBinanceSockets();
      }
    };

    // Remove ourselves on unload
    const cleanup = () => {
      unregisterWindow(id);
      bc.close();
    };
    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [setUpdatesPaused]);

  // After registering, check if more than one window is unpaused
  useEffect(() => {
    const windows = getRegisteredWindows();
    const activeWindows = windows.filter((w) => w.updatesPaused === false);
    // If more than 1 active window, show the modal in the new window
    if (windowId && activeWindows.length > 1) {
      setShowActiveModal(true);
    }
  }, [windowId]);

  // "Pause Me" => set updatesPaused for this window
  const handlePauseMe = () => {
    setUpdatesPaused(true);
    updateWindowEntry(windowId, { updatesPaused: true });
    disconnectBinanceSockets();
    setShowActiveModal(false);
  };

  // "Pause Others" => broadcast a message to all other windows to pause
  const handlePauseOthers = () => {
    const windows = getRegisteredWindows();
    windows.forEach((w) => {
      if (w.id !== windowId && w.updatesPaused === false) {
        broadcastChannel?.postMessage({ type: 'PAUSE_WINDOW', targetId: w.id });
      }
    });
    // The current window remains unpaused
    setShowActiveModal(false);
  };

  // Connect websockets for the selected market if we are not paused
  useEffect(() => {
    if (!updatesPaused) {
      connectBinanceSockets(selectedMarket);
    }
    return () => {
      disconnectBinanceSockets();
    };
  }, [selectedMarket, updatesPaused]);

  // Optional old logic: if you still have the "2+ windows" limit
  // you can keep or remove this
  useEffect(() => {
    const onStorage = () => {
      const activeWindows = getRegisteredWindows().filter((w) => !w.updatesPaused);
      // Example of old logic for more than 2 windows
      setShowWindowLimitModal(activeWindows.length > 2);
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Example of old limit logic handlers
  const handleStopOldest = () => {
    const activeWindows = getRegisteredWindows().filter((w) => !w.updatesPaused);
    if (activeWindows.length > 0) {
      const oldest = activeWindows.reduce((prev, curr) =>
        prev.timestamp < curr.timestamp ? prev : curr
      );
      if (oldest.id) {
        broadcastChannel?.postMessage({ type: 'PAUSE_WINDOW', targetId: oldest.id });
      }
    }
    setShowWindowLimitModal(false);
  };

  const handleCloseCurrent = () => {
    window.close();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top panel */}
      <div style={{ flex: '0 0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0 }}>Binance Market Data</h1>
          <MarketSelector />
          <button onClick={() => {
            const newPaused = !updatesPaused;
            setUpdatesPaused(newPaused);
            updateWindowEntry(windowId, { updatesPaused: newPaused });
            if (newPaused) {
              disconnectBinanceSockets();
            } else {
              connectBinanceSockets(selectedMarket);
            }
          }}>
            {updatesPaused ? 'Resume Updates' : 'Pause Updates'}
          </button>
        </div>
      </div>

      {/* Main content: two-column layout */}
      <div style={{ flex: '1 1 auto', display: 'flex', overflow: 'hidden' }}>
        {/* Order Book */}
        <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #ccc', padding: '1rem' }}>
          <Suspense fallback={<div>Loading Order Book...</div>}>
            <OrderBook />
          </Suspense>
        </div>
        {/* Trades */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <Suspense fallback={<div>Loading Trades...</div>}>
            <TradesGrid />
          </Suspense>
        </div>
      </div>

      {/* Show the "pause me or pause others" modal if there's another active window */}
      {showActiveModal && (
        <ActiveWindowModal
          onPauseMe={handlePauseMe}
          onPauseOthers={handlePauseOthers}
        />
      )}

      {/* Optional old limit modal */}
      {showWindowLimitModal && (
        <WindowLimitModal
          onStopOldest={handleStopOldest}
          onCloseCurrent={handleCloseCurrent}
        />
      )}
    </div>
  );
};

export default App;
