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

// Warn in development if Auth0 is not configured — app will fall back to
// local JWT auth via AuthContext
if (!auth0Domain || !auth0ClientId) {
  console.warn(
    '⚠️  VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are not set. ' +
    'Auth0 SSO will be unavailable. Using local JWT authentication only.'
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain || 'placeholder.us.auth0.com'}
      clientId={auth0ClientId || 'placeholder'}
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

