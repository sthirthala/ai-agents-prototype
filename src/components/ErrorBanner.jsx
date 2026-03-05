export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner">
      <span className="error-icon">⚠️</span>
      <p>{message}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
