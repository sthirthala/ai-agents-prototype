import { useMsal } from '@azure/msal-react';

export default function Header() {
  const { instance, accounts } = useMsal();
  const activeAccount = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo">⚡</span>
          <h1 className="header-title">API Center Portal</h1>
        </div>
        <p className="header-subtitle">
          Azure API Center — APIs, Agents, Models &amp; Tools
        </p>
        {activeAccount && (
          <div className="header-user">
            <span className="header-user-name">{activeAccount.name || activeAccount.username}</span>
            <button className="header-logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}
