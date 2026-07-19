import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'StadiumGenius',
        short_name: 'StadiumGenius',
        description: 'AI-Powered Smart Stadium Platform — FIFA World Cup 2026',
        theme_color: '#3378ff',
        background_color: '#080c14',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Dashboard', url: '/', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] },
          { name: 'Security', url: '/security', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] },
          { name: 'Fan Portal', url: '/fan', icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: ({ url, request }) => url.href.startsWith('http://localhost:5000/api/') && request.method === 'GET',
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    watch: {
      ignored: ['**/server/**'],
    },
  },
});
