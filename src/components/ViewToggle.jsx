export default function ViewToggle({ view, onToggle }) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${view === 'card' ? 'active' : ''}`}
        onClick={() => onToggle('card')}
        title="Card view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onToggle('list')}
        title="List view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="14" height="2" rx="0.5" />
          <rect x="1" y="7" width="14" height="2" rx="0.5" />
          <rect x="1" y="12" width="14" height="2" rx="0.5" />
        </svg>
      </button>
    </div>
  );
}
