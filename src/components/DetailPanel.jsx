export default function DetailPanel({ item, type, onClose }) {

  return (
    <aside className="detail-panel" style={{ '--panel-accent': item.color }}>
      <button className="detail-close" onClick={onClose}>✕</button>

      <div className="detail-header">
        <span className="detail-icon">{item.icon}</span>
        <h2 className="detail-title">{item.name}</h2>
        {item.provider && <span className="detail-provider">{item.provider}</span>}
      </div>

      <p className="detail-description">{item.description}</p>

      {item.capabilities && (
        <div className="detail-section">
          <h4>Capabilities</h4>
          <div className="detail-tags">
            {item.capabilities.map((cap) => (
              <span key={cap} className="tag tag-lg">{cap}</span>
            ))}
          </div>
        </div>
      )}

      {item.parameters && (
        <div className="detail-section">
          <h4>Specifications</h4>
          <div className="detail-specs">
            <div className="spec">
              <span className="spec-label">Parameters</span>
              <span className="spec-value">{item.parameters}</span>
            </div>
            <div className="spec">
              <span className="spec-label">Context Window</span>
              <span className="spec-value">{item.context}</span>
            </div>
            <div className="spec">
              <span className="spec-label">Type</span>
              <span className="spec-value">{item.type}</span>
            </div>
          </div>
        </div>
      )}

      {item.category && (
        <div className="detail-section">
          <h4>Category</h4>
          <span className="tag tag-lg">{item.category}</span>
        </div>
      )}

      {type === 'apis' && (
        <div className="detail-section">
          <h4>API Details</h4>
          <div className="detail-specs">
            <div className="spec">
              <span className="spec-label">Kind</span>
              <span className="spec-value">{item.kind || 'REST'}</span>
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
          </div>
        </div>
      )}
    </aside>
  );
}
