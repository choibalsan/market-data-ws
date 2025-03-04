interface ActiveWindowModalProps {
  onPauseMe: () => void;
  onPauseOthers: () => void;
}

const ActiveWindowModal = ({ onPauseMe, onPauseOthers }: ActiveWindowModalProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
      }}
    >
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
        <h2>Another Active Window Detected</h2>
        <p>You can only have one active (unpaused) window at a time.</p>
        <p>What would you like to do?</p>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={onPauseMe} style={{ marginRight: '1rem' }}>
            Pause This Window
          </button>
          <button onClick={onPauseOthers}>Pause All Other Windows</button>
        </div>
      </div>
    </div>
  );
};

export default ActiveWindowModal;
