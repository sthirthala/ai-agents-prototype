export default function ListView({ items, onItemClick, selectedId }) {
  return (
    <section className="list-view">
      <div className="list-header-row">
        <span className="list-col list-col-name">Name</span>
        <span className="list-col list-col-type">Type</span>
        <span className="list-col list-col-desc">Description</span>
        <span className="list-col list-col-lifecycle">Lifecycle</span>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className={`list-row ${item.id === selectedId ? 'list-row-selected' : ''}`}
          onClick={() => onItemClick(item)}
          style={{ '--row-accent': item.color }}
        >
          <span className="list-col list-col-name">
            <span className="list-row-icon">{item.icon}</span>
            {item.name}
          </span>
          <span className="list-col list-col-type">
            <span className="list-type-badge">{item.assetType}</span>
          </span>
          <span className="list-col list-col-desc">{item.description}</span>
          <span className="list-col list-col-lifecycle">
            {item.endpointUrl ? (
              <a className="list-endpoint-link" href={item.endpointUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                🔗 Endpoint
              </a>
            ) : (item.lifecycleStage || '—')}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <div className="list-empty">No items match your filters.</div>
      )}
    </section>
  );
}
