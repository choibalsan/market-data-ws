import React from 'react';

interface WindowLimitModalProps {
  onStopOldest: () => void;
  onCloseCurrent: () => void;
}

const WindowLimitModal = ({ onStopOldest, onCloseCurrent }: WindowLimitModalProps) => {
  return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Window Limit Reached</h2>
          <p>There are already 2 active windows with websocket connections.</p>
          <p>Please choose an option:</p>
          <button onClick={onStopOldest} style={{ marginRight: '1rem' }}>Stop WS on Oldest Window</button>
          <button onClick={onCloseCurrent}>Close This Window</button>
        </div>
      </div>
  );
};

export default WindowLimitModal;
