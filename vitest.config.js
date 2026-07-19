import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.jsx'],
    globals: true,
    exclude: ['node_modules/**', '**/node_modules/**', 'dist/**', 'dev-dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/pages/Login.jsx',
        'src/pages/Register.jsx',
        'src/context/AuthContext.jsx',
        'src/components/ErrorBoundary.jsx',
        'src/components/StadiumBackdrop.jsx'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'dev-dist/**',
        'server/**',
        'src/setupTests.jsx',
        'vite.config.js',
        'vitest.config.js',
        'playwright.config.js',
        'e2e/**'
      ],
    },
  },
});
