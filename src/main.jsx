// ── Programmatically unregister service workers & clear Cache Storage in development mode ──
if (import.meta.env.DEV && typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let needsReload = false;
      for (const registration of registrations) {
        registration.unregister();
        needsReload = true;
      }
      if (needsReload) {
        window.location.reload();
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || "stadiumgenius-dummy.us.auth0.com"}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || "dummyclientid12345"}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
