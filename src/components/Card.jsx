export default function Card({ item, type, onClick, isSelected }) {
  const effectiveType = type === 'all'
    ? (item.category === 'api' ? 'apis' : item.category === 'agent' ? 'agents' : 'tools')
    : type;

  return (
    <article
      className={`card ${isSelected ? 'card-selected' : ''}`}
      onClick={() => onClick(item)}
      style={{ '--card-accent': item.color }}
    >
      <div className="card-header">
        <span className="card-icon">{item.icon}</span>
        <div className="card-badge">
          {effectiveType === 'apis' && (item.assetType || 'API')}
          {effectiveType === 'agents' && (item.assetType === 'a2a' ? 'A2A Agent' : 'Agent')}
          {effectiveType === 'tools' && (item.assetType === 'mcp' ? 'MCP Tool' : item.toolCategory || 'Tool')}
        </div>
      </div>
      <h3 className="card-title">{item.name}</h3>
      {item.provider && <span className="card-provider">{item.provider}</span>}
      <p className="card-description">{item.description}</p>
      {item.capabilities && (
        <div className="card-tags">
          {item.capabilities.map((cap) => (
            <span key={cap} className="tag">{cap}</span>
          ))}
        </div>
      )}
      {(effectiveType === 'apis' || effectiveType === 'tools') && (
        <div className="card-meta">
          <span>🔄 {item.lifecycleStage}</span>
          {item.version && <span>📌 {item.version}</span>}
        </div>
      )}
      <div className="card-footer">
        <span className="card-expand-hint">Click to explore →</span>
      </div>
    </article>
  );
}
