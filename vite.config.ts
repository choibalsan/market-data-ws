/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Disable Fast Refresh in tests to avoid "can't detect preamble" error
      fastRefresh: !process.env.VITEST,
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
});
