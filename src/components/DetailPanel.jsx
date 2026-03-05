export default function DetailPanel({ item, type, onClose }) {

  return (
    <aside className="detail-panel" style={{ '--panel-accent': item.color }}>
      <button className="detail-close" onClick={onClose}>✕</button>

      <div className="detail-header">
        <span className="detail-icon">{item.icon}</span>
        <h2 className="detail-title">{item.name}</h2>
        {item.assetType && <span className="detail-provider">{item.assetType}</span>}
      </div>

      <p className="detail-description">{item.description}</p>

      {item.capabilities && item.capabilities.length > 0 && (
        <div className="detail-section">
          <h4>Capabilities</h4>
          <div className="detail-tags">
            {item.capabilities.map((cap) => (
              <span key={cap} className="tag tag-lg">{cap}</span>
            ))}
          </div>
        </div>
      )}

      <div className="detail-section">
        <h4>Details</h4>
        <div className="detail-specs">
          <div className="spec">
            <span className="spec-label">Asset Type</span>
            <span className="spec-value">{item.assetType}</span>
          </div>
          <div className="spec">
            <span className="spec-label">Lifecycle</span>
            <span className="spec-value">{item.lifecycleStage || 'Unknown'}</span>
          </div>
          {item.version && (
            <div className="spec">
              <span className="spec-label">Version</span>
              <span className="spec-value">{item.version}</span>
            </div>
          )}
          {type === 'tools' && (
            <div className="spec">
              <span className="spec-label">Category</span>
              <span className="spec-value">{item.toolCategory || 'MCP'}</span>
            </div>
          )}
          {type === 'apis' && (
            <div className="spec">
              <span className="spec-label">Protocol</span>
              <span className="spec-value">{item.kind || item.assetType}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
