import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { fetchApiSpec } from '../services/apiCenterService';

export default function DetailPanel({ item, type, onClose }) {
  const { instance, accounts } = useMsal();
  const [spec, setSpec] = useState(null);
  const [specLoading, setSpecLoading] = useState(false);
  const [specError, setSpecError] = useState(null);

  const loadSpec = useCallback(async () => {
    setSpecLoading(true);
    setSpecError(null);
    try {
      const result = await fetchApiSpec(instance, accounts, item.id);
      setSpec(result);
    } catch (err) {
      setSpecError(err.message || 'Failed to load spec');
    } finally {
      setSpecLoading(false);
    }
  }, [instance, accounts, item.id]);

  const handleDownload = () => {
    if (!spec?.value) return;
    const isJson = spec.value.trim().startsWith('{');
    const ext = isJson ? 'json' : 'yaml';
    const mimeType = isJson ? 'application/json' : 'text/yaml';
    const blob = new Blob([spec.value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}-openapi.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenInVSCode = () => {
    if (!spec?.value) return;
    const isJson = spec.value.trim().startsWith('{');
    const ext = isJson ? 'json' : 'yaml';
    window.open(
      `https://vscode.dev/github/sthirthala/ai-agents-prototype#${item.id}-openapi.${ext}`,
      '_blank'
    );
    navigator.clipboard?.writeText(spec.value);
  };

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
          {type === 'tools' && item.endpointUrl && (
            <div className="spec spec-url">
              <span className="spec-label">Endpoint URL</span>
              <a className="spec-value spec-link" href={item.endpointUrl} target="_blank" rel="noopener noreferrer">
                {item.endpointUrl}
              </a>
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

      {type === 'apis' && (
        <div className="detail-section">
          <h4>API Specification</h4>

          {!spec && !specLoading && !specError && (
            <button className="spec-btn spec-btn-primary" onClick={loadSpec}>
              📄 Load OpenAPI Spec
            </button>
          )}

          {specLoading && (
            <div className="spec-loading">
              <div className="spinner spinner-sm" />
              <span>Loading specification...</span>
            </div>
          )}

          {specError && (
            <div className="spec-error">
              <span>⚠️ {specError}</span>
              <button className="spec-btn spec-btn-small" onClick={loadSpec}>Retry</button>
            </div>
          )}

          {spec && (
            <div className="spec-content">
              <div className="spec-meta">
                <span className="tag tag-lg">v{spec.versionName}</span>
                <span className="tag tag-lg">{spec.definitionName}</span>
              </div>
              <pre className="spec-preview">{spec.value.slice(0, 2000)}{spec.value.length > 2000 ? '\n...' : ''}</pre>
              <div className="spec-actions">
                <button className="spec-btn spec-btn-primary" onClick={handleDownload}>
                  ⬇️ Download Spec
                </button>
                <button className="spec-btn spec-btn-vscode" onClick={handleOpenInVSCode}>
                  Open in VS Code
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
