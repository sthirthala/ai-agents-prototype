const ASSET_TYPES_BY_TAB = {
  apis: ['REST', 'GraphQL', 'gRPC', 'SOAP', 'Webhook', 'Websocket'],
  tools: ['mcp'],
  agents: ['a2a'],
};

export default function FilterBar({ activeTab, selectedTypes, onToggleType }) {
  const types = ASSET_TYPES_BY_TAB[activeTab] || [];

  if (types.length <= 1) return null;

  return (
    <div className="filter-bar">
      <span className="filter-label">Filter:</span>
      <button
        className={`filter-chip ${selectedTypes.length === 0 ? 'active' : ''}`}
        onClick={() => onToggleType(null)}
      >
        All
      </button>
      {types.map((type) => (
        <button
          key={type}
          className={`filter-chip ${selectedTypes.includes(type) ? 'active' : ''}`}
          onClick={() => onToggleType(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
