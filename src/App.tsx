import React, { Suspense, useEffect, useState } from 'react';
import { useMarketStore } from './store/useMarketStore';
import { connectBinanceSockets, disconnectBinanceSockets } from './websocket/binanceWs';
import { registerWindow, unregisterWindow, getRegisteredWindows, updateWindowEntry } from './windowManager';
import ActiveWindowModal from './components/ActiveWindowModal';
import MarketSelector from './components/MarketSelector';
import WindowLimitModal from './components/WindowLimitModal';

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

  // Register window on mount and clean up on unload
  useEffect(() => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setWindowId(id);
    registerWindow(id);

    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    setBroadcastChannel(bc);

    bc.onmessage = (event) => {
      if (!event.data) return;
      if (event.data.type === 'PAUSE_WINDOW' && event.data.targetId === id) {
        setUpdatesPaused(true);
        updateWindowEntry(id, { updatesPaused: true });
        disconnectBinanceSockets();
      }
    };

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

  // Check for multiple active windows and show modal if needed
  useEffect(() => {
    if (!windowId) return;
    const windows = getRegisteredWindows();
    const activeWindows = windows.filter((w) => w.updatesPaused === false);
    if (activeWindows.length > 1) {
      setShowActiveModal(true);
    }
  }, [windowId]);

  // Handler: Pause this window
  const handlePauseMe = () => {
    setUpdatesPaused(true);
    updateWindowEntry(windowId, { updatesPaused: true });
    disconnectBinanceSockets();
    setShowActiveModal(false);
  };

  // Handler: Pause all other windows
  const handlePauseOthers = () => {
    const windows = getRegisteredWindows();
    windows.forEach((w) => {
      if (w.id !== windowId && w.updatesPaused === false) {
        broadcastChannel?.postMessage({ type: 'PAUSE_WINDOW', targetId: w.id });
      }
    });
    setShowActiveModal(false);
  };

  // Connect websockets if not paused
  useEffect(() => {
    if (!updatesPaused) {
      connectBinanceSockets(selectedMarket);
    } else {
      disconnectBinanceSockets();
    }
    return () => {
      disconnectBinanceSockets();
    };
  }, [selectedMarket, updatesPaused]);

  // Optional legacy modal if more than two windows are active
  const [showWindowLimitModal, setShowWindowLimitModal] = useState(false);
  useEffect(() => {
    const onStorage = () => {
      const activeWindows = getRegisteredWindows().filter((w) => !w.updatesPaused);
      setShowWindowLimitModal(activeWindows.length > 2);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleStopOldest = () => {
    const activeWindows = getRegisteredWindows().filter((w) => !w.updatesPaused);
    if (activeWindows.length > 0) {
      const oldest = activeWindows.reduce((prev, curr) => (prev.timestamp < curr.timestamp ? prev : curr));
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
    <div className="app-container">
      {/* Top Panel: Single line controls */}
      <header className="top-panel">
        <h1 className="app-title">Binance Market Data</h1>
        <MarketSelector />
        <button
          className="pause-btn"
          onClick={() => {
            const newPaused = !updatesPaused;
            setUpdatesPaused(newPaused);
            updateWindowEntry(windowId, { updatesPaused: newPaused });
            if (newPaused) {
              disconnectBinanceSockets();
            } else {
              connectBinanceSockets(selectedMarket);
            }
          }}
        >
          {updatesPaused ? 'Resume Updates' : 'Pause Updates'}
        </button>
      </header>

      {/* Main Content: Two-column layout */}
      <main className="main-content">
        <section className="orderbook-section">
          <Suspense fallback={<div>Loading Order Book...</div>}>
            <OrderBook />
          </Suspense>
        </section>
        <section className="trades-section">
          <Suspense fallback={<div>Loading Trades...</div>}>
            <TradesGrid />
          </Suspense>
        </section>
      </main>

      {/* Modals */}
      {showActiveModal && (
        <ActiveWindowModal onPauseMe={handlePauseMe} onPauseOthers={handlePauseOthers} />
      )}
      {showWindowLimitModal && (
        <WindowLimitModal onStopOldest={handleStopOldest} onCloseCurrent={handleCloseCurrent} />
      )}
    </div>
  );
};

export default App;
