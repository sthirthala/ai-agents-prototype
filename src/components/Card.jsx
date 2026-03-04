export default function Card({ item, type, onClick, isSelected }) {
  return (
    <article
      className={`card ${isSelected ? 'card-selected' : ''}`}
      onClick={() => onClick(item)}
      style={{ '--card-accent': item.color }}
    >
      <div className="card-header">
        <span className="card-icon">{item.icon}</span>
        <div className="card-badge">
          {type === 'agents' && 'Agent'}
          {type === 'models' && item.type}
          {type === 'tools' && item.category}
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
      {type === 'models' && (
        <div className="card-meta">
          <span>📐 {item.parameters}</span>
          <span>📝 {item.context}</span>
        </div>
      )}
      <div className="card-footer">
        <span className="card-expand-hint">Click to explore →</span>
      </div>
    </article>
  );
}
