import { useMsal } from '@azure/msal-react';
import SearchBar from './SearchBar';

export default function Header({ searchQuery, onSearchChange }) {
  const { instance, accounts } = useMsal();
  const activeAccount = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-top-row">
          <div className="header-brand">
            <span className="header-logo">⚡</span>
            <h1 className="header-title">API Center Portal</h1>
          </div>
          {activeAccount && (
            <div className="header-user">
              <span className="header-user-name">{activeAccount.name || activeAccount.username}</span>
              <button className="header-logout-btn" onClick={handleLogout}>Sign out</button>
            </div>
          )}
        </div>
        {activeAccount && (
          <div className="header-search-row">
            <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search across all APIs, agents, and tools..." />
          </div>
        )}
      </div>
    </header>
  );
}
