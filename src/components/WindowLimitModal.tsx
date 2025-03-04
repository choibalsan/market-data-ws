import React from 'react';

interface ActiveWindowModalProps {
  onPauseMe: () => void;
  onPauseOthers: () => void;
}

const ActiveWindowModal: React.FC<ActiveWindowModalProps> = ({ onPauseMe, onPauseOthers }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Another Active Window Detected</h2>
        <p>You can only have one active websocket connection at a time.</p>
        <p>Please choose:</p>
        <div className="modal-actions">
          <button onClick={onPauseMe}>Pause This Window</button>
          <button onClick={onPauseOthers}>Pause All Others</button>
        </div>
      </div>
    </div>
  );
};

export default ActiveWindowModal;
