// ── Programmatically unregister service workers & clear Cache Storage in development mode ──
if (import.meta.env.DEV && typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// Auth0 is MANDATORY — app will not work without it
if (!auth0Domain || !auth0ClientId) {
  document.getElementById('root').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0e1a;color:#f8fafc;font-family:system-ui,sans-serif;padding:2rem;">
      <div style="max-width:500px;text-align:center;">
        <h1 style="font-size:2rem;color:#f43f5e;margin-bottom:1rem;">⚠️ Auth0 Configuration Required</h1>
        <p style="color:#94a3b8;margin-bottom:1.5rem;">
          <strong>VITE_AUTH0_DOMAIN</strong> and <strong>VITE_AUTH0_CLIENT_ID</strong> must be set in your <code>.env</code> file.
        </p>
        <pre style="background:#1e293b;padding:1rem;border-radius:0.75rem;text-align:left;font-size:0.8rem;color:#67e8f9;overflow-x:auto;">
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
        </pre>
        <p style="color:#64748b;margin-top:1rem;font-size:0.75rem;">
          Create a free Auth0 account at <a href="https://auth0.com" style="color:#38bdf8;">auth0.com</a>, 
          create a Single Page Application, and copy the Domain & Client ID.
        </p>
      </div>
    </div>
  `;
  throw new Error(
    'Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env'
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
