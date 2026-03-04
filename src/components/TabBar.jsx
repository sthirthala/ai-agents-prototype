export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {tab.count !== null && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
