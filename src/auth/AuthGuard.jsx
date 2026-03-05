import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

function LoginPage() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-icon">🔐</span>
        <h1>Welcome to API Center Portal</h1>
        <p>Sign in with your Microsoft account to explore APIs, agents, models, and tools from Azure API Center.</p>
        <button className="login-btn" onClick={handleLogin}>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}

export default function AuthGuard({ children }) {
  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </>
  );
}
