import { agents, models, tools, getById } from '../data';

export default function DetailPanel({ item, type, onClose }) {
  const relatedModels = item.models?.map((id) => getById(models, id)).filter(Boolean) || [];
  const relatedTools = item.tools?.map((id) => getById(tools, id)).filter(Boolean) || [];

  // For models/tools, find which agents use them
  const usedByAgents =
    type !== 'agents'
      ? agents.filter((a) =>
          type === 'models'
            ? a.models?.includes(item.id)
            : a.tools?.includes(item.id)
        )
      : [];

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

      {relatedModels.length > 0 && (
        <div className="detail-section">
          <h4>🧠 Models Used</h4>
          <div className="detail-related">
            {relatedModels.map((m) => (
              <div key={m.id} className="related-chip" style={{ '--chip-color': m.color }}>
                <span>{m.icon}</span> {m.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {relatedTools.length > 0 && (
        <div className="detail-section">
          <h4>🛠️ Tools Available</h4>
          <div className="detail-related">
            {relatedTools.map((t) => (
              <div key={t.id} className="related-chip" style={{ '--chip-color': t.color }}>
                <span>{t.icon}</span> {t.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {usedByAgents.length > 0 && (
        <div className="detail-section">
          <h4>🤖 Used by Agents</h4>
          <div className="detail-related">
            {usedByAgents.map((a) => (
              <div key={a.id} className="related-chip" style={{ '--chip-color': a.color }}>
                <span>{a.icon}</span> {a.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
